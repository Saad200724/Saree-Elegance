import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useProducts(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: [api.products.list.path, filters],
    queryFn: async () => {
      // Clean undefined filters
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.search) params.search = filters.search;

      const queryString = new URLSearchParams(params).toString();
      const url = `${api.products.list.path}?${queryString}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return api.products.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useProductReviews(productId: number) {
  return useQuery({
    queryKey: [api.products.get.path, productId, 'reviews'], // Derived key
    queryFn: async () => {
      const url = buildUrl(api.reviews.list.path, { id: productId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.reviews.list.responses[200].parse(await res.json());
    },
    enabled: !!productId,
  });
}
