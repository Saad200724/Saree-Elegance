import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { MongoUser } from "./lib/mongodb";
import { insertProductSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === MongoDB Auth Routes ===
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, name, phone, address } = req.body;
      const existing = await MongoUser.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already exists" });
      
      const user = await MongoUser.create({ email, password, name, phone, address });
      res.status(201).json({ message: "User registered in MongoDB", id: user._id });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await MongoUser.findOne({ email, password });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      res.json({ message: "Logged in successfully", email: user.email });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Products ===
  app.get(api.products.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const products = await storage.getProducts(category, search);
    res.json(products);
  });

  // === Admin Products ===
  const storage_disk = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
      const uploadPath = path.join(process.cwd(), "public", "images");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req: any, file: any, cb: any) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage_disk });

  app.post("/api/admin/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Ensure the path is correct for the frontend
    const url = `/images/${req.file.filename}`;
    res.json({ url });
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      const input = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Product creation error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = insertProductSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(id, input);
      if (!updated) return res.status(404).json({ message: "Product not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Product update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Duplicate upload route removed

  app.delete(api.admin.products.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.status(204).send();
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
        sessionId,
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
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const input = api.orders.updateStatus.input.parse(req.body);
    const updated = await storage.updateOrderStatus(id, input.status);
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  });

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
  // seedDatabase no longer needed as we use Mongo directly and don't want to re-seed on every restart
  // await seedDatabase();

  return httpServer;
}

import * as schema from "@shared/schema";
import { db } from "./db";
