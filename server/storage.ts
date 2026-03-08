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
import { MongoProduct, MongoReview, MongoUser, MongoOrder, MongoCartItem, connectToMongoDB } from "./lib/mongodb";
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
          secondaryImages: p.secondaryImages || [],
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
        secondaryImages: product.secondaryImages || [],
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
        secondaryImages: newMongoProduct.secondaryImages || [],
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
      
      // Find the existing product in Mongo by the hashed numeric ID
      const allMongo = await MongoProduct.find({});
      const existingMongo = allMongo.find(p => {
        let hash = 0;
        const idStr = p._id.toString();
        for (let i = 0; i < idStr.length; i++) {
          hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash) === id;
      });

      if (!existingMongo) {
        console.error(`Update failed: Mongo product with ID ${id} not found`);
        return undefined;
      }

      const updateData: any = {};
      if (product.name !== undefined) updateData.name = product.name;
      if (product.description !== undefined) updateData.description = product.description;
      if (product.price !== undefined) updateData.price = product.price.toString();
      if (product.originalPrice !== undefined) updateData.originalPrice = product.originalPrice?.toString();
      if (product.imageUrl !== undefined) updateData.imageUrl = product.imageUrl;
      if (product.secondaryImages !== undefined) updateData.secondaryImages = product.secondaryImages;
      if (product.category !== undefined) updateData.category = product.category;
      if (product.stock !== undefined) updateData.stock = product.stock;
      if (product.isNewArrival !== undefined) updateData.isNewArrival = product.isNewArrival;

      const updated = await MongoProduct.findByIdAndUpdate(
        existingMongo._id,
        { $set: updateData },
        { new: true }
      );

      if (!updated) {
        return undefined;
      }

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
        secondaryImages: updated.secondaryImages || [],
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
      const found = products.find(p => p.id === id);
      if (!found) {
        console.log(`Product with ID ${id} not found in current hash list`);
      }
      return found;
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
      await connectToMongoDB();
      let query: any = {};
      
      // If we have a userId, we should prefer it, but also check if there are items from a previous guest session
      if (userId) {
        query.userId = userId.toString();
      } else if (sessionId) {
        query.sessionId = sessionId.toString();
      } else {
        console.warn("[Storage] getCartItems called without userId or sessionId");
        return [];
      }

      console.log(`[Storage] Fetching cart for ${userId ? 'User: ' + userId : 'Session: ' + sessionId} with query:`, JSON.stringify(query));
      const mongoCartItems = await MongoCartItem.find(query);
      console.log(`[Storage] Found ${mongoCartItems.length} items in Mongo`);
      
      const mongoProducts = await this.getProducts();
      
      return mongoCartItems.map(item => {
        const product = mongoProducts.find(p => p.id === item.productId);
        return {
          id: item.productId,
          userId: item.userId || null,
          sessionId: item.sessionId || null,
          productId: item.productId,
          quantity: item.quantity,
          createdAt: item.createdAt,
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
      await connectToMongoDB();
      let query: any = { productId: item.productId };
      if (item.userId) {
        query.userId = item.userId.toString();
      } else if (item.sessionId) {
        query.sessionId = item.sessionId.toString();
      } else {
        console.error("[Storage] Cannot add to cart: No userId or sessionId provided", item);
        throw new Error("Cannot add to cart: No userId or sessionId provided");
      }

      console.log(`[Storage] Adding to cart: Product ${item.productId} for ${item.userId ? 'User ' + item.userId : 'Session ' + item.sessionId}`);
      const existing = await MongoCartItem.findOne(query);

      if (existing) {
        existing.quantity += (item.quantity || 1);
        await existing.save();
        console.log(`[Storage] Updated existing item quantity to ${existing.quantity}`);
        return { 
          ...item, 
          id: item.productId, 
          quantity: existing.quantity,
          createdAt: existing.createdAt 
        } as CartItem;
      }

      const newItem = await MongoCartItem.create({
        userId: item.userId?.toString(),
        sessionId: item.sessionId?.toString(),
        productId: item.productId,
        quantity: item.quantity || 1
      });

      console.log(`[Storage] Created new cart item in Mongo:`, newItem);
      return { 
        ...item, 
        id: item.productId, 
        quantity: newItem.quantity,
        createdAt: newItem.createdAt 
      } as CartItem;
    } catch (e) {
      console.error("Add to cart error:", e);
      throw e;
    }
  }

  async updateCartItem(id: number, quantity: number, userId?: string, sessionId?: string): Promise<CartItem | undefined> {
    try {
      await connectToMongoDB();
      let query: any = { productId: id };
      if (userId) query.userId = userId;
      else if (sessionId) query.sessionId = sessionId;
      else return undefined;

      const updated = await MongoCartItem.findOneAndUpdate(
        query,
        { $set: { quantity } },
        { new: true }
      );
      if (!updated) return undefined;
      return {
        id: updated.productId,
        userId: updated.userId || null,
        sessionId: updated.sessionId || null,
        productId: updated.productId,
        quantity: updated.quantity,
        createdAt: updated.createdAt
      } as CartItem;
    } catch (e) {
      console.error("Update cart item error:", e);
      return undefined;
    }
  }

  async removeFromCart(id: number, userId?: string, sessionId?: string): Promise<void> {
    try {
      await connectToMongoDB();
      let query: any = { productId: id };
      if (userId) query.userId = userId;
      else if (sessionId) query.sessionId = sessionId;
      else return;

      await MongoCartItem.deleteOne(query);
    } catch (e) {
      console.error("Remove from cart error:", e);
    }
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    try {
      await connectToMongoDB();
      let query: any = {};
      if (userId) query.userId = userId;
      else if (sessionId) query.sessionId = sessionId;
      else return;

      await MongoCartItem.deleteMany(query);
    } catch (e) {
      console.error("Clear cart error:", e);
    }
  }

  async createOrder(orderData: InsertOrder, items: { productId: number, quantity: number, price: number }[]): Promise<Order> {
    try {
      const mongoProducts = await this.getProducts();
      let newOrderId = Math.floor(Math.random() * 1000000);

      if (isDbConnected) {
        try {
          const order = await db.transaction(async (tx: any) => {
            const [newOrder] = await tx.insert(orders).values({
              ...orderData,
              totalAmount: orderData.totalAmount.toString(),
            }).returning();
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
          newOrderId = order.id;
        } catch (dbErr) {
          console.error("Database Order Error, falling back to Mongo only:", dbErr);
        }
      }

      // Sync/Create Order in MongoDB
      try {
        await connectToMongoDB();
        const itemsWithDetails = items.map(item => {
          const product = mongoProducts.find(p => p.id === item.productId);
          return {
            ...item,
            price: item.price.toString(),
            name: product?.name || "Unknown Product",
            imageUrl: product?.imageUrl || ""
          };
        });

        await MongoOrder.create({
          ...orderData,
          totalAmount: orderData.totalAmount.toString(),
          items: itemsWithDetails,
          status: 'pending'
        });
      } catch (e) {
        console.error("Mongo Order Sync Error:", e);
        if (!isDbConnected) throw e; // If both fail, then we have a problem
      }

      return {
        ...orderData,
        id: newOrderId,
        status: 'pending',
        createdAt: new Date(),
        paymentMethod: orderData.paymentMethod || 'Cash on Delivery'
      } as Order;
    } catch (e) {
      console.error("Create order error:", e);
      throw e;
    }
  }

  async getOrders(userId?: string): Promise<(Order & { items: any[] })[]> {
    try {
      await connectToMongoDB();
      
      let mongoQuery: any = {};
      if (userId) mongoQuery.userId = userId;
      
      const mongoOrders = await MongoOrder.find(mongoQuery).sort({ createdAt: -1 });
      
      return mongoOrders.map(o => {
        // Deterministic hash of MongoDB _id for stable order ID
        let hash = 0;
        const idStr = o._id.toString();
        for (let i = 0; i < idStr.length; i++) {
          hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
          hash |= 0;
        }
        const orderId = Math.abs(hash);

        return {
          id: orderId,
          userId: o.userId || null,
          firstName: o.firstName || null,
          lastName: o.lastName || null,
          email: o.email || null,
          phone: o.phone || null,
          division: o.division || null,
          district: o.district || null,
          upazila: o.upazila || null,
          address: o.address,
          orderNotes: o.orderNotes || null,
          totalAmount: o.totalAmount,
          status: o.status,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt,
          items: o.items.map((item: any, idx: number) => ({
            id: orderId * 100 + idx, // Stable item ID derived from order ID
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              name: item.name,
              imageUrl: item.imageUrl
            }
          }))
        };
      });
    } catch (e) {
      console.error("Order Fetch Error:", e);
      return [];
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      await connectToMongoDB();
      
      // Since we use hashed IDs in the frontend, we need to find the order by matching the hash
      const allOrders = await MongoOrder.find({});
      const targetOrder = allOrders.find(o => {
        let hash = 0;
        const idStr = o._id.toString();
        for (let i = 0; i < idStr.length; i++) {
          hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash) === id;
      });

      if (!targetOrder) {
        console.error(`Order with hashed ID ${id} not found in MongoDB`);
        return undefined;
      }

      const updated = await MongoOrder.findByIdAndUpdate(
        targetOrder._id,
        { $set: { status } },
        { new: true }
      );

      if (!updated) return undefined;

      // Sync with Drizzle if connected
      if (isDbConnected) {
        try {
          // Attempt to find and update in Drizzle too, though Drizzle might have different IDs
          // This is best-effort sync
          await db.update(orders).set({ status }).where(eq(orders.email, updated.email));
        } catch (dbErr) {
          console.warn("Drizzle status update failed (non-critical):", dbErr);
        }
      }
      
      return {
        id: id,
        userId: updated.userId || null,
        firstName: updated.firstName || null,
        lastName: updated.lastName || null,
        email: updated.email || null,
        phone: updated.phone || null,
        division: updated.division || null,
        district: updated.district || null,
        upazila: updated.upazila || null,
        address: updated.address,
        orderNotes: updated.orderNotes || null,
        totalAmount: updated.totalAmount,
        status: updated.status,
        paymentMethod: updated.paymentMethod,
        createdAt: updated.createdAt
      } as Order;
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
