import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Products ===
  app.get(api.products.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const products = await storage.getProducts(category, search);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // === Reviews ===
  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.id));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview({
        ...input,
        productId: Number(req.params.id),
      });
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Cart ===
  app.get(api.cart.list.path, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    const sessionId = req.sessionID;
    const items = await storage.getCartItems(userId, sessionId);
    res.json(items);
  });

  app.post(api.cart.addItem.path, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const sessionId = req.sessionID;
      const input = api.cart.addItem.input.parse(req.body);
      
      const item = await storage.addToCart({
        ...input,
        userId,
        sessionId: userId ? undefined : sessionId,
      });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.cart.updateItem.path, async (req, res) => {
    const input = api.cart.updateItem.input.parse(req.body);
    const updated = await storage.updateCartItem(Number(req.params.id), input.quantity);
    if (!updated) return res.status(404).json({ message: "Cart item not found" });
    res.json(updated);
  });

  app.delete(api.cart.removeItem.path, async (req, res) => {
    await storage.removeFromCart(Number(req.params.id));
    res.status(204).send();
  });

  // === Orders ===
  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = (req.user as any)?.claims?.sub;
      const sessionId = req.sessionID;
      
      // Get cart items to convert to order items
      const cartItems = await storage.getCartItems(userId, sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price)
      }));

      const order = await storage.createOrder({
        ...input,
        userId,
      }, orderItems);

      // Clear cart
      await storage.clearCart(userId, sessionId);

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    // Insert dummy products
    const seedProducts = [
      {
        name: "Velvet Zarkan Bridal Lehenga",
        description: "Heavy Vertical Embroidery & Diamond Border. Perfect for weddings.",
        price: 45000.00,
        originalPrice: 55000.00,
        imageUrl: "https://purnimasareebd.com/wp-content/uploads/2025/06/IMG-20250524-WA0137-300x300.jpg",
        category: "Lehenga",
        isNewArrival: true,
        stock: 5
      },
      {
        name: "Net Zarkan Sequence Lehenga",
        description: "Pastel Floral Elegance with intricate detailing.",
        price: 32000.00,
        imageUrl: "https://purnimasareebd.com/wp-content/uploads/2025/06/IMG-20250524-WA0168-300x300.jpg",
        category: "Lehenga",
        isNewArrival: true,
        stock: 8
      },
      {
        name: "Banarasi Silk Saree",
        description: "Traditional red Banarasi saree with gold zari work.",
        price: 15000.00,
        imageUrl: "https://purnimasareebd.com/wp-content/uploads/2025/05/saree-2.webp",
        category: "Saree",
        stock: 20
      },
      {
        name: "Georgette Party Wear",
        description: "Elegant party wear saree with stone embellishments.",
        price: 8500.00,
        imageUrl: "https://purnimasareebd.com/wp-content/uploads/2025/05/party-dress.webp",
        category: "Party Dress",
        stock: 15
      }
    ];

    for (const p of seedProducts) {
      await db.insert(schema.products).values({
        ...p,
        price: p.price.toString(),
        originalPrice: p.originalPrice ? p.originalPrice.toString() : null
      });
    }
    console.log("Database seeded with products");
  }
}

import * as schema from "@shared/schema";
import { db } from "./db";
