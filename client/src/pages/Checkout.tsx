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
import { z } from "zod";
import { useLocation } from "wouter";
import { Loader2, Phone, ShoppingBag, CheckCircle2, Truck, CreditCard, Home } from "lucide-react";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila/Thana is required"),
  address: z.string().min(1, "Full address is required"),
  orderNotes: z.string().optional(),
  paymentMethod: z.enum(["Cash on Delivery", "RupantorPay"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: cartItems, isLoading: cartLoading, isError: cartError } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0) || 0;
  const deliveryFee = subtotal > 5000 ? 0 : 130;
  const total = subtotal + deliveryFee;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || "",
      lastName: user?.name?.split(' ').slice(1).join(' ') || "",
      email: user?.email || "",
      phone: user?.phone || "",
      division: "",
      district: "",
      upazila: "",
      address: user?.address || "",
      orderNotes: "",
      paymentMethod: "Cash on Delivery",
    },
  });

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
          <p className="text-gray-500 font-medium">Preparing your checkout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartError || !cartItems || cartItems.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = (data: CheckoutFormValues) => {
    createOrder.mutate({
      ...data,
      totalAmount: total.toString(),
    }, {
      onSuccess: (order) => {
        setLocation(`/success?orderId=${order.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-500">Please enter your details to complete the order.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side: Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Home className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="email"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="017XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division</FormLabel>
                        <select 
                          className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          {...field}
                        >
                          <option value="">Select</option>
                          <option value="Dhaka">Dhaka</option>
                          <option value="Chittagong">Chittagong</option>
                          <option value="Rajshahi">Rajshahi</option>
                          <option value="Khulna">Khulna</option>
                          <option value="Barisal">Barisal</option>
                          <option value="Sylhet">Sylhet</option>
                          <option value="Rangpur">Rangpur</option>
                          <option value="Mymensingh">Mymensingh</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Input placeholder="Dhaka" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="upazila"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thana</FormLabel>
                        <Input placeholder="Savar" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input placeholder="House #, Road #, Area..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Any specific instructions..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <div className="space-y-3">
                      <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${field.value === "Cash on Delivery" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-100 hover:bg-gray-50"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" className="w-4 h-4 text-primary" checked={field.value === "Cash on Delivery"} onChange={() => field.onChange("Cash on Delivery")} />
                          <div>
                            <span className="font-bold text-gray-900 block">Cash on Delivery</span>
                            <span className="text-xs text-gray-500">Pay when you receive the product</span>
                          </div>
                        </div>
                      </label>
                      <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${field.value === "RupantorPay" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-100 hover:bg-gray-50"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" className="w-4 h-4 text-primary" checked={field.value === "RupantorPay"} onChange={() => field.onChange("RupantorPay")} />
                          <div>
                            <span className="font-bold text-gray-900 block">Online Payment</span>
                            <span className="text-xs text-gray-500">bKash, Nagad, Rocket or Card</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Right side: Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary">৳{Number(item.product.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-50 mb-8">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-gray-900">৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-3xl font-bold text-primary">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createOrder.isPending} 
                  className="w-full h-14 text-lg font-bold rounded-xl"
                >
                  {createOrder.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <>Place Order <CheckCircle2 className="ml-2 w-5 h-5" /></>
                  )}
                </Button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Free delivery on orders over ৳5,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>Support: 01405-045023</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </main>

      <Footer />
    </div>
  );
}
