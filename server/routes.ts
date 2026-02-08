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
    // Insert dummy products using attached assets
    const seedProducts = [
      {
        name: "Bridal Lehenga Pink Floral",
        description: "Heavy Embroidery & Diamond Border Bridal Lehenga. Perfect for grand weddings.",
        price: 45000.00,
        imageUrl: "/images/IMG-20250524-WA0015-300x300_1770468292705.jpg",
        category: "Lehenga",
        isNewArrival: true,
        stock: 5
      },
      {
        name: "Burberry Jarkan Maroon Lehenga",
        description: "Deep maroon velvet lehenga with Burberry Jarkan work.",
        price: 32000.00,
        imageUrl: "/images/IMG-20250524-WA0068-300x300_1770468292707.jpg",
        category: "Lehenga",
        isNewArrival: true,
        stock: 8
      },
      {
        name: "Georgette Dupatta Maroon Suite",
        description: "Elegant maroon georgette dupatta with intricate embroidery.",
        price: 2250.00,
        imageUrl: "/images/IMG-20250524-WA0070-300x300_1770468292716.jpg",
        category: "Saree",
        stock: 10
      },
      {
        name: "Georgette Jarkan Maroon Saree",
        description: "Beautiful maroon saree with georgette jarkan work.",
        price: 2295.00,
        imageUrl: "/images/IMG-20250524-WA0072-300x300_1770468292718.jpg",
        category: "Saree",
        stock: 12
      },
      {
        name: "Georgette Jarkan Designer Saree",
        description: "Premium maroon georgette jarkan designer saree.",
        price: 2495.00,
        imageUrl: "/images/IMG-20250524-WA0075-300x300_1770468292725.jpg",
        category: "Saree",
        stock: 7
      },
      {
        name: "Heavy Work Georgette Jarkan",
        description: "Rich maroon georgette saree with heavy jarkan embroidery.",
        price: 2800.00,
        imageUrl: "/images/IMG-20250524-WA0076-300x300_1770468292729.jpg",
        category: "Saree",
        stock: 20
      },
      {
        name: "Royal Maroon Jarkan Saree",
        description: "Exquisite royal maroon saree with detailed jarkan work.",
        price: 3500.00,
        imageUrl: "/images/IMG-20250524-WA0077-300x300_1770468292734.jpg",
        category: "Saree",
        stock: 15
      },
      {
        name: "Bridal White Lehenga",
        description: "Stunning white bridal lehenga with heavy traditional work.",
        price: 38000.00,
        imageUrl: "/images/IMG-20250524-WA0111-300x300_1770468292737.jpg",
        category: "Lehenga",
        stock: 25
      },
      {
        name: "Net Zarkan Arpita Blue Lehenga",
        description: "Beautiful blue net lehenga with Zarkan Arpita work.",
        price: 28500.00,
        imageUrl: "/images/IMG-20250524-WA0116-300x300_1770468292740.jpg",
        category: "Lehenga",
        stock: 30
      },
      {
        name: "Net Zarkan Aneri Purple Lehenga",
        description: "Elegant purple net lehenga with Zarkan Aneri embroidery.",
        price: 29000.00,
        imageUrl: "/images/IMG-20250524-WA0123-300x300_1770468292743.jpg",
        category: "Lehenga",
        stock: 18
      },
      {
        name: "Sequence Zarkan Shivangi Pink",
        description: "Soft pink lehenga with sequence and Zarkan Shivangi work.",
        price: 31000.00,
        imageUrl: "/images/IMG-20250524-WA0168-300x300_1770468292753.jpg",
        category: "Lehenga",
        stock: 15
      }
    ];

    for (const p of seedProducts) {
      await db.insert(schema.products).values({
        ...p,
        price: p.price.toString(),
      });
    }
    console.log("Database seeded with products");
  }
}

import * as schema from "@shared/schema";
import { db } from "./db";
