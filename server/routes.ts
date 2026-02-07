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
        imageUrl: "/images/lehenga_stock_1.jpg",
        category: "Lehenga",
        isNewArrival: true,
        stock: 5
      },
      {
        name: "Net Zarkan Sequence Lehenga",
        description: "Pastel Floral Elegance with intricate detailing.",
        price: 32000.00,
        imageUrl: "/images/lehenga_stock_2.jpg",
        category: "Lehenga",
        isNewArrival: true,
        stock: 8
      },
      {
        name: "Royal Red Bridal Lehenga",
        description: "Exquisite craftsmanship with golden thread work.",
        price: 38000.00,
        imageUrl: "/images/lehenga_stock_3.jpg",
        category: "Lehenga",
        stock: 10
      },
      {
        name: "Designer Floral Lehenga",
        description: "Modern design with traditional touch for wedding guests.",
        price: 28000.00,
        imageUrl: "/images/lehenga_stock_4.jpg",
        category: "Lehenga",
        stock: 12
      },
      {
        name: "Silk Embroidered Lehenga",
        description: "Rich silk fabric with heavy embroidery work.",
        price: 35000.00,
        imageUrl: "/images/lehenga_stock_5.jpg",
        category: "Lehenga",
        stock: 7
      },
      {
        name: "Banarasi Silk Saree",
        description: "Traditional red Banarasi saree with gold zari work.",
        price: 15000.00,
        imageUrl: "/images/saree_stock_1.jpg",
        category: "Saree",
        stock: 20
      },
      {
        name: "Kanjivaram Pure Silk",
        description: "Authentic Kanjivaram with temple border design.",
        price: 18500.00,
        imageUrl: "/images/saree_stock_2.jpg",
        category: "Saree",
        stock: 15
      },
      {
        name: "Chiffon Designer Saree",
        description: "Lightweight and elegant for evening parties.",
        price: 7500.00,
        imageUrl: "/images/saree_stock_3.jpg",
        category: "Saree",
        stock: 25
      },
      {
        name: "Cotton Handloom Saree",
        description: "Pure cotton comfort with traditional prints.",
        price: 3500.00,
        imageUrl: "/images/saree_stock_4.jpg",
        category: "Saree",
        stock: 30
      },
      {
        name: "Tussar Silk Saree",
        description: "Natural silk texture with artistic hand painting.",
        price: 12000.00,
        imageUrl: "/images/saree_stock_5.jpg",
        category: "Saree",
        stock: 18
      },
      {
        name: "Georgette Party Wear",
        description: "Elegant party wear saree with stone embellishments.",
        price: 8500.00,
        imageUrl: "/images/party_stock_1.jpg",
        category: "Party Dress",
        stock: 15
      },
      {
        name: "Modern Fusion Gown",
        description: "A perfect blend of ethnic and contemporary styles.",
        price: 9500.00,
        imageUrl: "/images/party_stock_2.jpg",
        category: "Party Dress",
        stock: 12
      },
      {
        name: "Embroidered Anarkali",
        description: "Stunning floor-length Anarkali with intricate sequins.",
        price: 11000.00,
        imageUrl: "/images/party_stock_3.jpg",
        category: "Party Dress",
        stock: 10
      },
      {
        name: "Floral Organza Saree",
        description: "Trendy organza fabric with vibrant floral prints.",
        price: 6500.00,
        imageUrl: "https://purnimasareebd.com/wp-content/uploads/2025/05/saree-2.webp",
        category: "Saree",
        stock: 20
      },
      {
        name: "Net Sequined Saree",
        description: "Glimmering net saree for glamorous night events.",
        price: 8900.00,
        imageUrl: "https://purnimasareebd.com/wp-content/uploads/2025/05/party-dress.webp",
        category: "Saree",
        stock: 14
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
