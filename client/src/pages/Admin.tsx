import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Loader2, Plus, Pencil, Trash2, Store, Upload, X, Image as ImageIcon } from "lucide-react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Saree4you") {
      setAuthenticated(true);
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  const openProductDialog = (product: Product | null) => {
    setEditingProduct(product);
    setPrimaryImageUrl(product?.imageUrl || "");
    setSecondaryImages((product as any)?.secondaryImages || []);
    setIsProductDialogOpen(true);
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
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPrimaryImageUrl(url);
      toast({ title: "Primary image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSecondaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (secondaryImages.length + files.length > 3) {
      toast({ title: "Maximum 3 secondary images allowed", variant: "destructive" });
      return;
    }
    setUploadingSecondary(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      setSecondaryImages(prev => [...prev, ...urls].slice(0, 3));
      toast({ title: `${urls.length} image(s) uploaded` });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingSecondary(false);
    }
  };

  const removeSecondaryImage = (index: number) => {
    setSecondaryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      originalPrice: formData.get("originalPrice") as string || null,
      imageUrl: primaryImageUrl,
      secondaryImages: secondaryImages,
      category: formData.get("category") as string,
      stock: parseInt(formData.get("stock") as string),
      isNewArrival: formData.get("isNewArrival") === "on",
    };

    if (!data.imageUrl) {
      toast({ title: "Please upload or enter a primary image URL", variant: "destructive" });
      return;
    }

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
                data-testid="input-admin-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button data-testid="button-admin-login" type="submit" className="w-full">Login</Button>
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
          <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Products</h2>
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-product" onClick={() => openProductDialog(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input data-testid="input-product-name" name="name" defaultValue={editingProduct?.name} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select name="category" defaultValue={editingProduct?.category || "Saree"}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Saree">Saree</SelectItem>
                          <SelectItem value="Lehenga">Lehenga</SelectItem>
                          <SelectItem value="Pakistani">Pakistani</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price</label>
                      <Input data-testid="input-product-price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Original Price (Optional)</label>
                      <Input name="originalPrice" type="number" step="0.01" defaultValue={editingProduct?.originalPrice || ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stock</label>
                      <Input name="stock" type="number" defaultValue={editingProduct?.stock || 0} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Image (Required)</label>
                    <div className="flex gap-2">
                      <Input
                        data-testid="input-primary-image"
                        value={primaryImageUrl}
                        onChange={(e) => setPrimaryImageUrl(e.target.value)}
                        placeholder="Image URL or upload below"
                      />
                    </div>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => document.getElementById('primary-upload')?.click()}
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      ) : primaryImageUrl ? (
                        <div className="flex items-center gap-4">
                          <img src={primaryImageUrl} alt="Primary" className="w-20 h-20 object-cover rounded" />
                          <span className="text-sm text-green-600 font-medium">Primary image set</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-6 w-6 text-gray-400" />
                          <p className="text-sm text-gray-500">Click to upload primary image</p>
                        </div>
                      )}
                      <input
                        id="primary-upload"
                        type="file"
                        className="hidden"
                        onChange={handlePrimaryUpload}
                        accept="image/*"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secondary Images (Up to 3)</label>
                    <div className="grid grid-cols-3 gap-3">
                      {secondaryImages.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`Secondary ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                          <button
                            type="button"
                            onClick={() => removeSecondaryImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {secondaryImages.length < 3 && (
                        <div
                          className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                          onClick={() => document.getElementById('secondary-upload')?.click()}
                        >
                          {uploadingSecondary ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-[10px] text-gray-400 mt-1">Add image</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      id="secondary-upload"
                      type="file"
                      className="hidden"
                      onChange={handleSecondaryUpload}
                      accept="image/*"
                      multiple
                      disabled={uploadingSecondary}
                    />
                    <p className="text-xs text-muted-foreground">{secondaryImages.length}/3 secondary images added</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea data-testid="input-product-description" name="description" defaultValue={editingProduct?.description} required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isNewArrival" id="isNewArrival" defaultChecked={editingProduct?.isNewArrival || false} />
                    <label htmlFor="isNewArrival" className="text-sm font-medium">New Arrival</label>
                  </div>
                  <Button data-testid="button-submit-product" type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
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
                  <TableHead>Images</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>৳{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        1 + {(product as any).secondaryImages?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openProductDialog(product)} data-testid={`button-edit-product-${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(product.id)} data-testid={`button-delete-product-${product.id}`}>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Order Management</h2>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: [api.orders.list.path] })}>
              Refresh Orders
            </Button>
          </div>
          {ordersLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{order.firstName} {order.lastName}</div>
                        <div className="text-xs text-gray-500">{order.phone}</div>
                        <div className="text-xs text-gray-400">{order.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs max-w-[200px]">
                          <span className="font-semibold">{order.division}, {order.district}</span><br/>
                          {order.upazila}<br/>
                          <span className="text-gray-500">{order.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs flex justify-between gap-2">
                              <span className="truncate max-w-[100px]">{item.product?.name}</span>
                              <span className="text-gray-500">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-sm text-[#3A5A1F]">৳{Number(order.totalAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          className="capitalize text-[10px] px-2 py-0"
                          variant={
                            order.status === "delivered" ? "default" :
                            order.status === "pending" ? "destructive" : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(val) => statusMutation.mutate({ id: order.id, status: val })}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
