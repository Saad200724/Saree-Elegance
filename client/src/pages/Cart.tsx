import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Minus, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { data: cartItems, isLoading } = useCart();
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0) || 0;
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  if (isLoading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="p-20 text-center">Loading cart...</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems?.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="mb-6 inline-flex p-4 bg-gray-50 rounded-full">
              <Trash2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems?.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-6 items-center">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.product.category}</p>
                    <p className="font-medium text-gray-900">৳{Number(item.product.price).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <button 
                        onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                        className="p-2 hover:bg-gray-50 text-gray-500"
                        disabled={updateItem.isPending}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm font-medium">{item.quantity}</span>
                      <button 
                         onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                         className="p-2 hover:bg-gray-50 text-gray-500"
                         disabled={updateItem.isPending}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-heading font-semibold text-xl mb-6">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `৳${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                  <Link href="/checkout">Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                
                <p className="text-xs text-center text-gray-400 mt-4">
                  Secure Checkout - SSL Encrypted
                </p>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
