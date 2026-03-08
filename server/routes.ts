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
import bcrypt from "bcryptjs";
import session from "express-session";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || "chandrabati-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }));

  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, name, phone, address } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }
      const existing = await MongoUser.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await MongoUser.create({ email, password: hashedPassword, name, phone, address });

      (req.session as any).userId = user._id.toString();
      (req.session as any).userEmail = user.email;
      (req.session as any).userName = user.name;

      res.status(201).json({ message: "Account created successfully", email: user.email, name: user.name });
    } catch (err: any) {
      console.error("Register error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await MongoUser.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        const directMatch = user.password === password;
        if (!directMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const hashed = await bcrypt.hash(password, 10);
        await MongoUser.findByIdAndUpdate(user._id, { password: hashed });
      }

      (req.session as any).userId = user._id.toString();
      (req.session as any).userEmail = user.email;
      (req.session as any).userName = user.name;

      res.json({ message: "Logged in successfully", email: user.email, name: user.name });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/auth/user", (req, res) => {
    const sess = req.session as any;
    if (sess?.userId) {
      return res.json({
        id: sess.userId,
        email: sess.userEmail,
        name: sess.userName,
      });
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.products.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const products = await storage.getProducts(category, search);
    res.json(products);
  });

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
    const url = `/images/${req.file.filename}`;
    res.json({ url });
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.secondaryImages && typeof body.secondaryImages === 'string') {
        body.secondaryImages = JSON.parse(body.secondaryImages);
      }
      if (Array.isArray(body.secondaryImages) && body.secondaryImages.length > 3) {
        body.secondaryImages = body.secondaryImages.slice(0, 3);
      }
      const input = insertProductSchema.parse(body);
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
      const body = { ...req.body };
      if (body.secondaryImages && typeof body.secondaryImages === 'string') {
        body.secondaryImages = JSON.parse(body.secondaryImages);
      }
      if (Array.isArray(body.secondaryImages) && body.secondaryImages.length > 3) {
        body.secondaryImages = body.secondaryImages.slice(0, 3);
      }
      const input = insertProductSchema.partial().parse(body);
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

  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.id));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      if (!input.rating || input.rating < 1 || input.rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      if (!input.reviewerName || input.reviewerName.trim().length < 1) {
        return res.status(400).json({ message: "Reviewer name is required" });
      }
      if (!input.comment || input.comment.trim().length < 1) {
        return res.status(400).json({ message: "Comment is required" });
      }
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

  app.get(api.cart.list.path, async (req, res) => {
    const userId = (req.session as any)?.userId || (req.user as any)?._id?.toString();
    const sessionId = req.headers["x-session-id"] || req.sessionID;
    const items = await storage.getCartItems(userId, sessionId as string);
    res.json(items);
  });

  app.post(api.cart.addItem.path, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || (req.user as any)?._id?.toString();
      const sessionId = req.headers["x-session-id"] || req.sessionID;
      const input = api.cart.addItem.input.parse(req.body);

      const item = await storage.addToCart({
        ...input,
        userId,
        sessionId: sessionId as string,
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
    const userId = (req.session as any)?.userId || (req.user as any)?._id?.toString();
    const sessionId = req.headers["x-session-id"] || req.sessionID;
    const input = api.cart.updateItem.input.parse(req.body);
    const updated = await storage.updateCartItem(Number(req.params.id), input.quantity, userId, sessionId as string);
    if (!updated) return res.status(404).json({ message: "Cart item not found" });
    res.json(updated);
  });

  app.delete(api.cart.removeItem.path, async (req, res) => {
    const userId = (req.session as any)?.userId || (req.user as any)?._id?.toString();
    const sessionId = req.headers["x-session-id"] || req.sessionID;
    await storage.removeFromCart(Number(req.params.id), userId, sessionId as string);
    res.status(204).send();
  });

  app.get("/api/user/orders", async (req, res) => {
    const sess = req.session as any;
    if (!sess?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const orders = await storage.getOrders(sess.userId);
    res.json(orders);
  });

  app.get("/api/user/profile", async (req, res) => {
    const sess = req.session as any;
    if (!sess?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await MongoUser.findById(sess.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    const sess = req.session as any;
    if (!sess?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { name, phone, address } = req.body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;

      const updated = await MongoUser.findByIdAndUpdate(
        sess.userId,
        { $set: updateData },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "User not found" });

      sess.userName = updated.name;
      res.json({
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get(api.orders.list.path, async (req, res) => {
    const userId = (req.session as any)?.userId;
    const orders = await storage.getOrders(userId);
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
      const userId = (req.session as any)?.userId || (req.user as any)?._id?.toString();
      const sessionId = req.headers["x-session-id"] || req.sessionID;

      const cartItems = await storage.getCartItems(userId, sessionId as string);
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

      await storage.clearCart(userId, sessionId as string);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Order creation error:", err);
      res.status(500).json({ message: "Failed to place order" });
    }
  });

  return httpServer;
}

import * as schema from "@shared/schema";
import { db } from "./db";
