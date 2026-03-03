import { db } from "./db";
import {
  products, reviews, cartItems, orders, orderItems,
  type Product, type InsertProduct,
  type Review, type InsertReview,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder
} from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";
import { MongoProduct, MongoReview } from "./lib/mongodb";

export interface IStorage extends IAuthStorage {
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
  syncWithMongo(): Promise<void>;
}

export class DatabaseStorage extends (authStorage.constructor as { new(): IAuthStorage }) implements IStorage {
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    if (category) {
      query = query.where(eq(products.category, category)) as any;
    }
    return await query.orderBy(desc(products.createdAt));
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

  async syncWithMongo(): Promise<void> {
    try {
      const allProducts = await db.select().from(products);
      for (const p of allProducts) {
        await MongoProduct.findOneAndUpdate(
          { name: p.name },
          {
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            imageUrl: p.imageUrl,
            category: p.category,
            stock: p.stock,
            isNewArrival: p.isNewArrival
          },
          { upsert: true }
        );
      }
      console.log("Successfully synced products to MongoDB");
    } catch (error) {
      console.error("Error syncing with MongoDB:", error);
    }
  }
}

export const storage = new DatabaseStorage();
