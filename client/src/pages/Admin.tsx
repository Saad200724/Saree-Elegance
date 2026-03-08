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
import { Loader2, Plus, Pencil, Trash2, Store, Upload, X, Image as ImageIcon, FileText, ChevronDown, ChevronUp, Package, Clock, CheckCircle2, Truck, User } from "lucide-react";
import { openInvoice } from "@/lib/invoice";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
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
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{product.name}</span>
                        {(product as any).isNewArrival && (
                          <Badge className="text-[10px] px-1.5 py-0 w-fit bg-emerald-50 text-emerald-700 border border-emerald-200" variant="outline">New Arrival</Badge>
                        )}
                      </div>
                    </TableCell>
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
          ) : !orders || orders.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="w-16 h-16 text-gray-200 mb-6" />
                <h3 className="text-xl font-black italic tracking-tight text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 text-sm">Orders will appear here once customers place them.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => (
                <Card key={order.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-admin-order-${order.id}`}>
                  <div
                    className="flex flex-wrap justify-between items-center gap-4 px-6 py-4 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Order ID</p>
                        <p className="font-mono font-bold text-gray-900">#{order.id}</p>
                      </div>
                      <div className="hidden sm:block h-8 w-px bg-gray-100" />
                      <div className="hidden sm:block">
                        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Customer</p>
                        <p className="font-medium text-gray-700">{order.firstName} {order.lastName}</p>
                      </div>
                      <div className="hidden md:block h-8 w-px bg-gray-100" />
                      <div className="hidden md:block">
                        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Items</p>
                        <p className="font-medium text-gray-700">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="hidden md:block h-8 w-px bg-gray-100" />
                      <div className="hidden md:block">
                        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Date</p>
                        <p className="font-medium text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <AdminStatusBadge status={order.status} />
                      <p className="text-lg font-black text-gray-900">৳{Number(order.totalAmount).toLocaleString()}</p>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <CardContent className="border-t border-gray-100 py-6 bg-gray-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Customer</p>
                          <p className="text-sm text-gray-700 font-medium">{order.firstName} {order.lastName}</p>
                          <p className="text-xs text-gray-500">{order.phone}</p>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Shipping Address</p>
                          <p className="text-sm text-gray-700 font-medium">{order.address}</p>
                          {order.division && <p className="text-xs text-gray-500 mt-1">{order.division}, {order.district}, {order.upazila}</p>}
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Payment</p>
                          <p className="text-sm text-gray-700 font-medium">{(order as any).paymentMethod || 'Cash on Delivery'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Order Status</p>
                          <AdminOrderTimeline status={order.status} />
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-3">Items Ordered</p>
                        <div className="space-y-3">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                {item.product?.imageUrl ? (
                                  <img src={item.product.imageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                                ) : item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm truncate">{item.product?.name || item.name || 'Product'}</h4>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} x ৳{Number(item.price).toLocaleString()}</p>
                              </div>
                              <p className="font-bold text-gray-900 text-sm">৳{(item.quantity * Number(item.price)).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Update Status</p>
                          <Select
                            defaultValue={order.status}
                            onValueChange={(val) => statusMutation.mutate({ id: order.id, status: val })}
                          >
                            <SelectTrigger className="w-[130px] h-9 text-xs font-medium" data-testid={`select-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); openInvoice(order); }}
                          data-testid={`button-admin-invoice-${order.id}`}
                          className="text-xs font-bold gap-2"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Invoice
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; icon: any }> = {
    pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    processing: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Package },
    shipped: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
    delivered: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  };
  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function AdminOrderTimeline({ status }: { status: string }) {
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-1">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${idx <= currentIndex ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          {idx < steps.length - 1 && (
            <div className={`w-4 h-0.5 ${idx < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
      <span className="text-xs text-gray-500 ml-2 capitalize">{status}</span>
    </div>
  );
}
