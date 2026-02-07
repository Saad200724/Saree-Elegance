import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertOrderSchema } from "@shared/routes";
import { z } from "zod";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const checkoutSchema = insertOrderSchema.pick({
  guestName: true,
  guestEmail: true,
  guestPhone: true,
  address: true,
  totalAmount: true // We'll set this programmatically
}).extend({
  guestEmail: z.string().email().optional().or(z.literal("")),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0) || 0;
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      guestName: user ? `${user.firstName} ${user.lastName}` : "",
      guestEmail: user?.email || "",
      guestPhone: "",
      address: "",
      totalAmount: total.toString(),
    },
  });

  if (authLoading || cartLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin" /></div>;
  }

  if (!cartItems || cartItems.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = (data: CheckoutFormValues) => {
    createOrder.mutate({
      ...data,
      userId: user?.id,
      totalAmount: total.toString(),
    }, {
      onSuccess: () => setLocation("/success")
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="font-heading text-xl font-semibold mb-6">Shipping Details</h2>
             
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 
                 {!user && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-6">
                      Already have an account? <a href="/api/login" className="font-bold underline">Login</a> for faster checkout.
                    </div>
                 )}

                 <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="guestEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234 567 890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={createOrder.isPending} 
                    size="lg" 
                    className="w-full bg-accent hover:bg-accent/90 mt-4"
                  >
                    {createOrder.isPending ? "Processing..." : `Pay ৳${total.toLocaleString()}`}
                  </Button>
               </form>
             </Form>
          </div>

          {/* Order Review */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-heading font-semibold text-lg mb-4">Your Order</h3>
               <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                 {cartItems.map((item) => (
                   <div key={item.id} className="flex gap-4">
                     <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                       <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <p className="font-medium text-sm text-gray-900">{item.product.name}</p>
                       <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                       <p className="text-sm font-semibold">৳{Number(item.product.price).toLocaleString()}</p>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="border-t border-gray-100 mt-6 pt-4 space-y-2">
                 <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>৳{shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
