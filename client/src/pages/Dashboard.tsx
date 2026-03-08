import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Package, Clock, CheckCircle2, Truck, User, Settings, LogOut,
  ShoppingBag, MapPin, Phone, Mail, Calendar, FileText, ChevronDown, ChevronUp
} from "lucide-react";
import { openInvoice } from "@/lib/invoice";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <User className="w-16 h-16 text-gray-300 mb-6" />
              <h2 className="text-2xl font-black italic tracking-tight text-gray-900 mb-2">Sign In Required</h2>
              <p className="text-gray-500 text-sm mb-8 text-center">Please log in to view your dashboard and track orders.</p>
              <Button
                onClick={() => setLocation("/login")}
                className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold px-8"
                data-testid="button-goto-login"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full pb-24 md:pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black italic tracking-tight text-gray-900" data-testid="text-welcome">
            Welcome, {user.name || 'there'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your account and track your orders.</p>
        </div>

        <div className="flex gap-3 mb-8 border-b border-gray-200 pb-0">
          <button
            onClick={() => setActiveTab('orders')}
            data-testid="tab-orders"
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              activeTab === 'orders'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package className="w-4 h-4" />
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            data-testid="tab-profile"
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              activeTab === 'profile'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            Profile
          </button>
        </div>

        {activeTab === 'orders' ? <OrdersSection /> : <ProfileSection user={user} logout={logout} />}
      </main>
      <Footer />
    </div>
  );
}

function OrdersSection() {
  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/orders"],
    queryFn: async () => {
      const res = await fetch("/api/user/orders", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
  });

  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  const deliveredOrders = orders?.filter((o: any) => o.status === 'delivered').length || 0;
  const pendingOrders = orders?.filter((o: any) => o.status === 'pending').length || 0;
  const totalSpent = orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0) || 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Orders" value={totalOrders.toString()} color="blue" />
        <StatCard icon={CheckCircle2} label="Delivered" value={deliveredOrders.toString()} color="emerald" />
        <StatCard icon={Clock} label="Pending" value={pendingOrders.toString()} color="amber" />
        <StatCard icon={ShoppingBag} label="Total Spent" value={`৳${totalSpent.toLocaleString()}`} color="purple" />
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-6" />
            <h3 className="text-xl font-black italic tracking-tight text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start shopping to see your orders here.</p>
            <Button asChild className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold px-8">
              <a href="/shop" data-testid="link-goto-shop">Browse Products</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
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
                    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Date</p>
                    <p className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="hidden md:block h-8 w-px bg-gray-100" />
                  <div className="hidden md:block">
                    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">Items</p>
                    <p className="font-medium text-gray-700">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-700 font-medium">{order.address}</p>
                      {order.division && <p className="text-xs text-gray-500 mt-1">{order.division}, {order.district}, {order.upazila}</p>}
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Payment</p>
                      <p className="text-sm text-gray-700 font-medium">{order.paymentMethod || 'Cash on Delivery'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Order Status</p>
                      <OrderTimeline status={order.status} />
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-3">Items Ordered</p>
                    <div className="space-y-3">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                            {item.product?.imageUrl ? (
                              <img src={item.product.imageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{item.product?.name || 'Product'}</h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} x ৳{Number(item.price).toLocaleString()}</p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">৳{(item.quantity * Number(item.price)).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openInvoice(order); }}
                      data-testid={`button-invoice-${order.id}`}
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
    </div>
  );
}

function ProfileSection({ user, logout }: { user: any; logout: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const startEditing = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setEditAddress(profile?.address || "");
    setIsEditing(true);
  };

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; address: string }) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({ title: "Profile updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ name: editName, phone: editPhone, address: editAddress });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-black italic tracking-tight">Account Information</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={startEditing} data-testid="button-edit-profile" className="text-xs font-bold">
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="text-xs">Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save-profile" className="text-xs font-bold bg-gray-900 hover:bg-black text-white">
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Full Name</span>
              </div>
              {isEditing ? (
                <Input
                  data-testid="input-edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-gray-900 font-medium text-lg" data-testid="text-user-name">{profile?.name || '-'}</p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
              </div>
              <p className="text-gray-900 font-medium text-lg" data-testid="text-user-email">{profile?.email || '-'}</p>
              <p className="text-[10px] text-gray-400">Email cannot be changed</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Phone</span>
              </div>
              {isEditing ? (
                <Input
                  data-testid="input-edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-gray-900 font-medium text-lg" data-testid="text-user-phone">{profile?.phone || 'Not set'}</p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Member Since</span>
              </div>
              <p className="text-gray-900 font-medium text-lg">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Delivery Address</span>
            </div>
            {isEditing ? (
              <textarea
                data-testid="input-edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full min-h-[80px] p-3 rounded-lg border border-gray-300 text-sm mt-1"
              />
            ) : (
              <p className="text-gray-900 font-medium" data-testid="text-user-address">{profile?.address || 'Not set'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Sign Out</h3>
              <p className="text-sm text-gray-500">Sign out of your account on this device.</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              data-testid="button-logout"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  const iconColor = colorMap[color] || colorMap.blue;

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardContent className="flex items-center gap-4 py-5 px-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-black text-gray-900" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
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

function OrderTimeline({ status }: { status: string }) {
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
