import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCart() {
  return useQuery({
    queryKey: [api.cart.list.path],
    queryFn: async () => {
      console.log("Fetching cart items...");
      const sessionId = localStorage.getItem("x-session-id");
      const headers: Record<string, string> = {};
      if (sessionId) headers["x-session-id"] = sessionId;

      const res = await fetch(api.cart.list.path, { 
        headers,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      console.log("Cart data received:", data);
      return api.cart.list.responses[200].parse(data);
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      console.log("Adding to cart:", { productId, quantity });
      const sessionId = localStorage.getItem("x-session-id");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionId) headers["x-session-id"] = sessionId;

      const res = await fetch(api.cart.addItem.path, {
        method: api.cart.addItem.method,
        headers,
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to add to cart");
      }
      const result = await res.json();
      console.log("Add to cart result:", result);
      return api.cart.addItem.responses[201].parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      toast({
        title: "Added to cart",
        description: "The item has been added to your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const sessionId = localStorage.getItem("x-session-id");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionId) headers["x-session-id"] = sessionId;

      const url = buildUrl(api.cart.updateItem.path, { id });
      const res = await fetch(url, {
        method: api.cart.updateItem.method,
        headers,
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return api.cart.updateItem.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const sessionId = localStorage.getItem("x-session-id");
      const headers: Record<string, string> = {};
      if (sessionId) headers["x-session-id"] = sessionId;

      const url = buildUrl(api.cart.removeItem.path, { id });
      const res = await fetch(url, {
        method: api.cart.removeItem.method,
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
    },
  });
}
