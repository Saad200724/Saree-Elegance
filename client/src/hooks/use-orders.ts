import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, type InsertOrder } from "@shared/routes";
import type { Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useOrders() {
  return useQuery<(Order & { items: any[] })[]>({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create order");
      }
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({
        title: "Order Placed!",
        description: "Thank you for your purchase.",
      });
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
