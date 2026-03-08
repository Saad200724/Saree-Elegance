import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ShoppingBag, FileText, Package } from "lucide-react";
import { Link, useLocation } from "wouter";
import { openInvoice } from "@/lib/invoice";

export default function OrderSuccess() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const orderId = params.get('orderId');

  const { data: orders } = useQuery<any[]>({
    queryKey: ["/api/user/orders"],
    queryFn: async () => {
      const res = await fetch("/api/user/orders", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const currentOrder = orders?.find((o: any) => String(o.id) === orderId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-100 text-[#7FB432] rounded-full flex items-center justify-center mb-8 shadow-inner">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="font-heading text-4xl font-black italic tracking-tight text-gray-900 mb-4">Order Placed Successfully!</h1>
        {orderId && (
          <p className="text-xl font-mono font-bold text-[#3A5A1F] mb-2" data-testid="text-order-id">Order ID: #{orderId}</p>
        )}
        <p className="text-gray-500 max-w-md mb-8 text-sm">
          Thank you for shopping with Chandrabati. Your order has been received and is being processed.
          You can view and print the invoice below.
        </p>

        {currentOrder && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 w-full max-w-md">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {currentOrder.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">৳{(item.quantity * Number(item.price)).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">Total</span>
              <span className="text-xl font-black text-gray-900">৳{Number(currentOrder.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {currentOrder && (
            <Button
              onClick={() => openInvoice(currentOrder)}
              className="bg-gray-900 hover:bg-black text-white px-8 h-12 font-bold"
              data-testid="button-view-invoice"
            >
              <FileText className="mr-2 h-5 w-5" /> View Invoice
            </Button>
          )}
          <Button asChild className="bg-[#7FB432] hover:bg-[#3A5A1F] text-white px-8 h-12 font-bold" data-testid="link-continue-shopping">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 px-8 h-12 font-bold" data-testid="link-view-orders">
            <Link href="/dashboard">View My Orders</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
