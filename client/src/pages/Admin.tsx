import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Order, api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Loader2, Plus, Pencil, Trash2, CheckCircle, Clock, Truck, Store, Upload } from "lucide-react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Saree4you") {
      setAuthenticated(true);
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [api.products.list.path],
    enabled: authenticated,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<(Order & { items: any[] })[]>({
    queryKey: [api.orders.list.path],
    enabled: authenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (newProduct: any) => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      setIsProductDialogOpen(false);
      toast({ title: "Product created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      toast({ title: "Product updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.admin.products.delete.path, { id }), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Product deleted successfully" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(buildUrl(api.orders.updateStatus.path, { id }), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Order status updated" });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      const imageUrlInput = document.querySelector('input[name="imageUrl"]') as HTMLInputElement;
      if (imageUrlInput) {
        imageUrlInput.value = data.url;
        const event = new Event('input', { bubbles: true });
        imageUrlInput.dispatchEvent(event);
      }
      toast({ title: "Image uploaded successfully" });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      originalPrice: formData.get("originalPrice") as string || null,
      imageUrl: formData.get("imageUrl") as string,
      category: formData.get("category") as string,
      stock: parseInt(formData.get("stock") as string),
      isNewArrival: formData.get("isNewArrival") === "on",
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/">
          <Button variant="outline">
            <Store className="mr-2 h-4 w-4" /> Go to Store
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Products</h2>
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingProduct(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input name="name" defaultValue={editingProduct?.name} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select name="category" defaultValue={editingProduct?.category || "Saree"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Saree">Saree</SelectItem>
                          <SelectItem value="Lehenga">Lehenga</SelectItem>
                          <SelectItem value="Pakistani">Pakistani</SelectItem>
                          <SelectItem value="Three Piece">Three Piece</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price</label>
                      <Input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Original Price (Optional)</label>
                      <Input name="originalPrice" type="number" step="0.01" defaultValue={editingProduct?.originalPrice || ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stock</label>
                      <Input name="stock" type="number" defaultValue={editingProduct?.stock || 0} required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Product Image</label>
                      <div className="flex gap-2">
                        <Input name="imageUrl" defaultValue={editingProduct?.imageUrl} placeholder="Image URL" required />
                        <div className="relative">
                          <Input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer w-10"
                            onChange={handleFileUpload}
                            accept="image/*"
                            disabled={uploading}
                          />
                          <Button type="button" variant="outline" size="icon" disabled={uploading}>
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Enter a URL or upload an image file</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea name="description" defaultValue={editingProduct?.description} required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isNewArrival" id="isNewArrival" defaultChecked={editingProduct?.isNewArrival || false} />
                    <label htmlFor="isNewArrival" className="text-sm font-medium">New Arrival</label>
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {productsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell><img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" /></TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>৳{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditingProduct(product); setIsProductDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <h2 className="text-2xl font-semibold mb-6">Order Management</h2>
          {ordersLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="grid gap-6">
              {orders?.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Order #{order.id}</CardTitle>
                    <Select defaultValue={order.status} onValueChange={(val) => statusMutation.mutate({ id: order.id, status: val })}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-bold">Customer Info</p>
                        <p className="text-sm">{order.guestName || "User ID: " + order.userId}</p>
                        <p className="text-sm">{order.guestPhone}</p>
                        <p className="text-sm text-muted-foreground">{order.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Items</p>
                        <ul className="text-sm space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{item.product.name} x {item.quantity}</span>
                              <span>৳{item.price}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm font-bold mt-2 pt-2 border-t">Total: ৳{order.totalAmount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
