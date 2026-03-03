import { db, pool, isDbConnected } from "./db";
import {
  products, reviews, cartItems, orders, orderItems, users,
  type Product, type InsertProduct,
  type Review, type InsertReview,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder
} from "@shared/schema";
import mongoose from "mongoose";
import { eq, desc, sql, and } from "drizzle-orm";
import { MongoProduct, MongoReview, MongoUser, connectToMongoDB } from "./lib/mongodb";
import { type UpsertUser, type User } from "@shared/models/auth";

export interface IStorage {
  getProducts(category?: string, search?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getCartItems(userId?: string, sessionId?: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId?: string, sessionId?: string): Promise<void>;
  createOrder(order: InsertOrder, items: { productId: number, quantity: number, price: number }[]): Promise<Order>;
  getOrders(userId?: string): Promise<(Order & { items: any[] })[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  syncWithMongo(): Promise<void>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      await connectToMongoDB();
      let query: any = {};
      if (category) query.category = category;
      if (search) query.name = { $regex: search, $options: 'i' };
      
      const mongoProducts = await MongoProduct.find(query).sort({ createdAt: -1 });
      return mongoProducts.map(p => {
        // Deterministic hash of _id to keep IDs stable during a session
        let hash = 0;
        const idStr = p._id.toString();
        for (let i = 0; i < idStr.length; i++) {
          hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
          hash |= 0;
        }
        return {
          id: Math.abs(hash),
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice || null,
          imageUrl: p.imageUrl,
          category: p.category,
          stock: p.stock,
          isNewArrival: p.isNewArrival,
          createdAt: p.createdAt
        };
      });
    } catch (e) {
      console.error("Mongo Fetch Error:", e);
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      await connectToMongoDB();
      const newMongoProduct = await MongoProduct.create({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString(),
        imageUrl: product.imageUrl,
        category: product.category,
        stock: product.stock,
        isNewArrival: product.isNewArrival
      });
      
      let hash = 0;
      const idStr = newMongoProduct._id.toString();
      for (let i = 0; i < idStr.length; i++) {
        hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
        hash |= 0;
      }

      return {
        id: Math.abs(hash),
        name: newMongoProduct.name,
        description: newMongoProduct.description,
        price: newMongoProduct.price,
        originalPrice: newMongoProduct.originalPrice || null,
        imageUrl: newMongoProduct.imageUrl,
        category: newMongoProduct.category,
        stock: newMongoProduct.stock,
        isNewArrival: newMongoProduct.isNewArrival,
        createdAt: newMongoProduct.createdAt
      };
    } catch (e) {
      console.error("Mongo Create Error:", e);
      throw e;
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      await connectToMongoDB();
      
      // Get all products to find the one with the generated numeric ID
      const all = await this.getProducts();
      const existing = all.find(p => p.id === id);
      if (!existing) {
        console.error(`Update failed: Product with ID ${id} not found`);
        return undefined;
      }

      const updateData: any = {};
      if (product.name !== undefined) updateData.name = product.name;
      if (product.description !== undefined) updateData.description = product.description;
      if (product.price !== undefined) updateData.price = product.price.toString();
      if (product.originalPrice !== undefined) updateData.originalPrice = product.originalPrice?.toString();
      if (product.imageUrl !== undefined) updateData.imageUrl = product.imageUrl;
      if (product.category !== undefined) updateData.category = product.category;
      if (product.stock !== undefined) updateData.stock = product.stock;
      if (product.isNewArrival !== undefined) updateData.isNewArrival = product.isNewArrival;

      const updated = await MongoProduct.findOneAndUpdate(
        { name: existing.name }, // Match by name since it's the most stable field we have
        { $set: updateData },
        { new: true }
      );

      if (!updated) {
        console.error(`Update failed: MongoDB document not found for name ${existing.name}`);
        return undefined;
      }

      // Re-hash ID for consistency
      let hash = 0;
      const idStr = updated._id.toString();
      for (let i = 0; i < idStr.length; i++) {
        hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
        hash |= 0;
      }

      return {
        id: Math.abs(hash),
        name: updated.name,
        description: updated.description,
        price: updated.price,
        originalPrice: updated.originalPrice || null,
        imageUrl: updated.imageUrl,
        category: updated.category,
        stock: updated.stock,
        isNewArrival: updated.isNewArrival,
        createdAt: updated.createdAt
      };
    } catch (e) {
      console.error("Mongo Update Error:", e);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await connectToMongoDB();
      const all = await this.getProducts();
      const product = all.find(p => p.id === id);
      if (product) {
        await MongoProduct.deleteOne({ name: product.name });
        console.log(`Deleted product ${product.name} from MongoDB`);
      }
    } catch (e) {
      console.error("Mongo Delete Error:", e);
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      await connectToMongoDB();
      const products = await this.getProducts();
      return products.find(p => p.id === id);
    } catch (e) {
      console.error("Mongo GetProduct Error:", e);
      return undefined;
    }
  }

  async getReviews(productId: number): Promise<Review[]> {
    try {
      await connectToMongoDB();
      const mongoReviews = await MongoReview.find({ productId }).sort({ createdAt: -1 });
      return mongoReviews.map(r => ({
        id: Math.floor(Math.random() * 1000000),
        productId: r.productId,
        userId: r.userId || null,
        reviewerName: r.reviewerName,
        rating: r.rating,
        comment: r.comment,
        imageUrl: r.imageUrl || null,
        createdAt: r.createdAt
      }));
    } catch (e) {
      console.error("Mongo Review Fetch Error:", e);
      return [];
    }
  }

  async createReview(review: InsertReview): Promise<Review> {
    try {
      await connectToMongoDB();
      const newMongoReview = await MongoReview.create({
        productId: review.productId,
        userId: review.userId,
        reviewerName: review.reviewerName,
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl
      });
      return {
        id: Math.floor(Math.random() * 1000000),
        productId: newMongoReview.productId,
        userId: newMongoReview.userId || null,
        reviewerName: newMongoReview.reviewerName,
        rating: newMongoReview.rating,
        comment: newMongoReview.comment,
        imageUrl: newMongoReview.imageUrl || null,
        createdAt: newMongoReview.createdAt
      };
    } catch (e) {
      console.error("Mongo Review Create Error:", e);
      throw e;
    }
  }

  async getCartItems(userId?: string, sessionId?: string): Promise<(CartItem & { product: Product })[]> {
    try {
      if (!isDbConnected) return [];
      const dbCartItems = await db.select().from(cartItems).where(
        userId 
          ? eq(cartItems.userId, userId)
          : eq(cartItems.sessionId, sessionId!)
      );
      
      const mongoProducts = await this.getProducts();
      
      return dbCartItems.map(item => {
        const product = mongoProducts.find(p => p.id === item.productId);
        return {
          ...item,
          product: product || {
            id: item.productId,
            name: "Unknown Product",
            description: "",
            price: "0",
            originalPrice: null,
            imageUrl: "",
            category: "",
            stock: 0,
            isNewArrival: false,
            createdAt: new Date()
          }
        };
      });
    } catch (e) {
      console.error("Cart Fetch Error:", e);
      return [];
    }
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    try {
      if (!isDbConnected) throw new Error("Database not connected");
      const [existing] = await db.select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.productId, item.productId),
            item.userId 
              ? eq(cartItems.userId, item.userId) 
              : eq(cartItems.sessionId, item.sessionId!)
          )
        );

      if (existing) {
        const [updated] = await db.update(cartItems)
          .set({ quantity: existing.quantity + (item.quantity || 1) })
          .where(eq(cartItems.id, existing.id))
          .returning();
        return updated;
      }
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    } catch (e) {
      console.error("Add to cart error:", e);
      return { ...item, id: Math.floor(Math.random() * 1000000), userId: item.userId || null, sessionId: item.sessionId || null, createdAt: new Date() } as CartItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    try {
      if (!isDbConnected) throw new Error("Database not connected");
      const [updated] = await db.update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, id))
        .returning();
      return updated;
    } catch (e) {
      console.error("Update cart item error:", e);
      return undefined;
    }
  }

  async removeFromCart(id: number): Promise<void> {
    try {
      if (!isDbConnected) throw new Error("Database not connected");
      await db.delete(cartItems).where(eq(cartItems.id, id));
    } catch (e) {
      console.error("Remove from cart error:", e);
    }
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    try {
      if (!isDbConnected) throw new Error("Database not connected");
      const whereClause = userId 
        ? eq(cartItems.userId, userId)
        : sessionId 
          ? eq(cartItems.sessionId, sessionId)
          : null;
      if (whereClause) {
        await db.delete(cartItems).where(whereClause);
      }
    } catch (e) {
      console.error("Clear cart error:", e);
    }
  }

  async createOrder(orderData: InsertOrder, items: { productId: number, quantity: number, price: number }[]): Promise<Order> {
    try {
      if (!isDbConnected) throw new Error("Database not connected");
      const order = await db.transaction(async (tx: any) => {
        const [newOrder] = await tx.insert(orders).values(orderData).returning();
        for (const item of items) {
          await tx.insert(orderItems).values({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price.toString(),
          });
        }
        return newOrder;
      });

      // Sync Order to MongoDB if possible
      try {
        await connectToMongoDB();
        // Assuming we have a MongoOrder model, but if not we can just keep it in Drizzle for now
        // since Admin panel reads from getOrders which uses Drizzle.
        // If user wants EVERYTHING in Mongo, I should add MongoOrder.
      } catch (e) {
        console.error("Mongo Order Sync Error:", e);
      }

      return order;
    } catch (e) {
      console.error("Create order error:", e);
      throw e;
    }
  }

  async getOrders(userId?: string): Promise<(Order & { items: any[] })[]> {
    try {
      if (!isDbConnected) return [];
      await connectToMongoDB();
      
      let allOrders;
      if (userId) {
        allOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
      } else {
        allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      }
      
      const mongoProducts = await this.getProducts();
      const results = [];
      
      for (const order of allOrders) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        const itemsWithProduct = items.map(item => ({
          ...item,
          product: mongoProducts.find(p => p.id === item.productId)
        }));
        results.push({ ...order, items: itemsWithProduct });
      }
      return results;
    } catch (e) {
      console.error("Order Fetch Error:", e);
      return [];
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      if (!isDbConnected) throw new Error("Database not connected");
      const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
      return updated;
    } catch (e) {
      console.error("Update order status error:", e);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      await connectToMongoDB();
      const updatedMongoUser = await MongoUser.findOneAndUpdate(
        { email: userData.email },
        {
          email: userData.email,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          password: "OAuthUser",
        },
        { upsert: true, new: true }
      );
      
      return {
        id: Math.floor(Math.random() * 1000000),
        email: updatedMongoUser.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };
    } catch (e) {
      console.error("Mongo User Upsert Error:", e);
      throw e;
    }
  }

  async syncWithMongo(): Promise<void> {
    // This is no longer needed as we're using Mongo directly
    return;
  }
}

export const storage = new DatabaseStorage();
