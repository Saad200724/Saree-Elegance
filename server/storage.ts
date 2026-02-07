import { db } from "./db";
import {
  products, reviews, cartItems, orders, orderItems,
  type Product, type InsertProduct,
  type Review, type InsertReview,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Products
  getProducts(category?: string, search?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  // Reviews
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Cart
  getCartItems(userId?: string, sessionId?: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId?: string, sessionId?: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder, items: { productId: number, quantity: number, price: number }[]): Promise<Order>;
}

export class DatabaseStorage extends (authStorage.constructor as { new(): IAuthStorage }) implements IStorage {
  // Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (category) {
      query = query.where(eq(products.category, category)) as any;
    }
    
    // Simple search implementation
    if (search) {
      // In a real app we'd use ilike or tsvector, but for simple MVP:
      // query = query.where(ilike(products.name, `%${search}%`)); 
      // Drizzle ilike needs sql operator
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  // Reviews
  async getReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Cart
  async getCartItems(userId?: string, sessionId?: string): Promise<(CartItem & { product: Product })[]> {
    const whereClause = userId 
      ? eq(cartItems.userId, userId)
      : sessionId 
        ? eq(cartItems.sessionId, sessionId)
        : null;

    if (!whereClause) return [];

    return await db.select({
      ...cartItems,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(whereClause);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [existing] = await db.select().from(cartItems)
      .where(sql`${cartItems.productId} = ${item.productId} AND (${cartItems.userId} = ${item.userId ?? null} OR ${cartItems.sessionId} = ${item.sessionId ?? null})`);

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

  // Orders
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
}

export const storage = new DatabaseStorage();
