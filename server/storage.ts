import { db } from "./db";
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
  getOrders(): Promise<(Order & { items: any[] })[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  syncWithMongo(): Promise<void>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    if (category) {
      query = query.where(eq(products.category, category)) as any;
    }
    return await query.orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    // Sync to Mongo
    try {
      await connectToMongoDB();
      await MongoProduct.create({
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price.toString(),
        originalPrice: newProduct.originalPrice?.toString(),
        imageUrl: newProduct.imageUrl,
        category: newProduct.category,
        stock: newProduct.stock,
        isNewArrival: newProduct.isNewArrival
      });
      console.log(`Synced product ${newProduct.name} to MongoDB`);
    } catch (e) {
      console.error("Mongo Sync Error on Create:", e);
    }
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    if (updated) {
      // Sync to Mongo
      try {
        await connectToMongoDB();
        await MongoProduct.findOneAndUpdate(
          { name: updated.name },
          {
            name: updated.name,
            description: updated.description,
            price: updated.price.toString(),
            originalPrice: updated.originalPrice?.toString(),
            imageUrl: updated.imageUrl,
            category: updated.category,
            stock: updated.stock,
            isNewArrival: updated.isNewArrival
          },
          { upsert: true, returnDocument: 'after' }
        );
        console.log(`Synced product ${updated.name} to MongoDB on update`);
      } catch (e) {
        console.error("Mongo Sync Error on Update:", e);
      }
    }
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.getProduct(id);
    await db.delete(products).where(eq(products.id, id));
    if (product) {
      try {
        await connectToMongoDB();
        await MongoProduct.deleteOne({ name: product.name });
        console.log(`Deleted product ${product.name} from MongoDB`);
      } catch (e) {
        console.error("Mongo Sync Error on Delete:", e);
      }
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    // Sync to Mongo
    try {
      await MongoReview.create({
        ...newReview,
        price: undefined // Review doesn't have price
      });
    } catch (e) {
      console.error("Mongo Sync Error:", e);
    }
    return newReview;
  }

  async getCartItems(userId?: string, sessionId?: string): Promise<(CartItem & { product: Product })[]> {
    const results = await db.select({
      id: cartItems.id,
      userId: cartItems.userId,
      sessionId: cartItems.sessionId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(
      userId 
        ? eq(cartItems.userId, userId)
        : eq(cartItems.sessionId, sessionId!)
    );
    return results;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
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
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const whereClause = userId 
      ? eq(cartItems.userId, userId)
      : sessionId 
        ? eq(cartItems.sessionId, sessionId)
        : null;
    if (whereClause) {
      await db.delete(cartItems).where(whereClause);
    }
  }

  async createOrder(orderData: InsertOrder, items: { productId: number, quantity: number, price: number }[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
      for (const item of items) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
        });
      }
      return order;
    });
  }

  async getOrders(): Promise<(Order & { items: any[] })[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const results = [];
    for (const order of allOrders) {
      const items = await db.select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));
      results.push({ ...order, items });
    }
    return results;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.email,
      set: userData
    }).returning();
    // Sync to Mongo
    try {
      await MongoUser.findOneAndUpdate(
        { email: user.email },
        {
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          password: "OAuthUser", // For Replit Auth, we don't have password, but we need it for schema
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (e) {
      console.error("Mongo User Sync Error:", e);
    }
    return user;
  }

  async syncWithMongo(): Promise<void> {
    try {
      await connectToMongoDB();
      
      // Wait for connection to be fully established if it's currently connecting
      if (mongoose.connection.readyState === 2) {
        await new Promise((resolve) => {
          const check = () => {
            if (mongoose.connection.readyState === 1) resolve(true);
            else setTimeout(check, 100);
          };
          check();
        });
      }

      if (mongoose.connection.readyState !== 1) {
        console.error("MongoDB not ready for sync after waiting. State:", mongoose.connection.readyState);
        return;
      }
      console.log("Starting MongoDB sync...");
      const allProducts = await db.select().from(products);
      console.log(`Found ${allProducts.length} products to sync`);
      
      for (const p of allProducts) {
        await MongoProduct.findOneAndUpdate(
          { name: p.name },
          {
            name: p.name,
            description: p.description,
            price: p.price.toString(),
            originalPrice: p.originalPrice?.toString(),
            imageUrl: p.imageUrl,
            category: p.category,
            stock: p.stock,
            isNewArrival: p.isNewArrival
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
      console.log("Successfully synced products to MongoDB");
    } catch (error) {
      console.error("Error syncing with MongoDB:", error);
    }
  }
}

export const storage = new DatabaseStorage();
