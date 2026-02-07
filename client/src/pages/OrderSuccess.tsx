import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-500 max-w-md mb-8">
          Thank you for shopping with Purnima Sarees. We have received your order and will begin processing it shortly.
        </p>
        <div className="flex gap-4">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
