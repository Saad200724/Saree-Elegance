import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Order, Product } from "@shared/routes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, CheckCircle2, Truck } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName || 'Guest'}</h1>
          <p className="text-gray-500 mt-2">Track your orders and manage your account.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Your Orders
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
              </div>
            ) : !orders || orders.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <Card key={order.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Order ID</p>
                            <p className="font-mono font-medium">#{order.id}</p>
                          </div>
                          <div className="h-8 w-px bg-gray-200" />
                          <div>
                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Date</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={order.status} />
                            <p className="text-lg font-bold text-gray-900 ml-4">৳{Number(order.totalAmount).toLocaleString()}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8"
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <head>
                                      <title>Invoice - ${order.id}</title>
                                      <style>
                                        body { font-family: sans-serif; padding: 40px; color: #333; }
                                        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
                                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7FB432; padding-bottom: 20px; margin-bottom: 30px; }
                                        .logo { color: #7FB432; font-weight: bold; font-size: 24px; }
                                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                        th { background: #F4F8EF; text-align: left; padding: 12px; }
                                        td { padding: 12px; border-bottom: 1px solid #eee; }
                                        .total { text-align: right; font-size: 1.2em; font-weight: bold; color: #3A5A1F; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="invoice-box">
                                        <div class="header">
                                          <div><div class="logo">LOGO</div><p>Order ID: #${order.id}</p></div>
                                          <div style="text-align: right"><h2>INVOICE</h2><p>${new Date(order.createdAt).toLocaleDateString()}</p></div>
                                        </div>
                                        <div style="margin-bottom: 30px">
                                          <h3>Customer Details</h3>
                                          <p><strong>Name:</strong> ${order.firstName} ${order.lastName}</p>
                                          <p><strong>Phone:</strong> ${order.phone}</p>
                                          <p><strong>Address:</strong> ${order.address}</p>
                                        </div>
                                        <table>
                                          <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                                          <tbody>
                                            ${order.items.map((item: any) => `
                                              <tr>
                                                <td>${item.product?.name || 'Product'}</td>
                                                <td>${item.quantity}</td>
                                                <td>৳${Number(item.price).toLocaleString()}</td>
                                                <td>৳${(item.quantity * Number(item.price)).toLocaleString()}</td>
                                              </tr>
                                            `).join('')}
                                          </tbody>
                                        </table>
                                        <div class="total">Total: ৳${Number(order.totalAmount).toLocaleString()}</div>
                                        <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #888;">
                                          <p>Thank you for shopping with us!</p>
                                          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #7FB432; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
                                        </div>
                                      </div>
                                    </body>
                                  </html>
                                `);
                                win.document.close();
                              }
                            }}
                          >
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-6">
                      <div className="space-y-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                              <img 
                                src={item.product?.imageUrl} 
                                alt={item.product?.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{item.product?.name}</h4>
                              <p className="text-sm text-gray-500">Qty: {item.quantity} × ৳{Number(item.price).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string, icon: any }> = {
    pending: { color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
    processing: { color: "bg-blue-50 text-blue-700 border-blue-100", icon: Package },
    shipped: { color: "bg-purple-50 text-purple-700 border-purple-100", icon: Truck },
    delivered: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
