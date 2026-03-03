import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function OrderSuccess() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const orderId = params.get('orderId');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-100 text-[#7FB432] rounded-full flex items-center justify-center mb-8 shadow-inner">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        {orderId && (
          <p className="text-xl font-mono font-bold text-[#3A5A1F] mb-4">Order ID: #{orderId}</p>
        )}
        <p className="text-gray-500 max-w-md mb-8">
          Thank you for shopping with us. We have received your order and synced it to our MongoDB database for processing. 
          An invoice has been generated in our admin panel.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-[#7FB432] hover:bg-[#3A5A1F] text-white px-8 h-12">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 px-8 h-12">
            <Link href="/dashboard">View My Orders</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
