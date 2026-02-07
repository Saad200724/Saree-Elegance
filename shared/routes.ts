import { z } from 'zod';
import { insertProductSchema, insertReviewSchema, insertCartItemSchema, insertOrderSchema, products, reviews, cartItems, orders } from './schema';

export * from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/products/:id/reviews' as const,
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products/:id/reviews' as const,
      input: insertReviewSchema.omit({ productId: true }),
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  cart: {
    list: {
      method: 'GET' as const,
      path: '/api/cart' as const,
      responses: {
        200: z.array(z.custom<typeof cartItems.$inferSelect & { product: typeof products.$inferSelect }>()),
      },
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/cart' as const,
      input: z.object({ productId: z.number(), quantity: z.number().default(1) }),
      responses: {
        201: z.custom<typeof cartItems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/cart/:id' as const,
      input: z.object({ quantity: z.number() }),
      responses: {
        200: z.custom<typeof cartItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    removeItem: {
      method: 'DELETE' as const,
      path: '/api/cart/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
