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
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0) || 0;
  const deliveryFee = 130;
  const total = subtotal + deliveryFee;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      division: "",
      district: "",
      upazila: "",
      address: "",
      orderNotes: "",
      paymentMethod: "Cash on Delivery",
    },
  });

  if (authLoading || cartLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!cartItems || cartItems.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = (data: CheckoutFormValues) => {
    createOrder.mutate({
      ...data,
      totalAmount: total.toString(),
      status: 'pending',
    }, {
      onSuccess: (order) => {
        setLocation(`/success?orderId=${order.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#7FB432] rounded-full flex items-center justify-center">
               <span className="text-white font-bold text-xs">LOGO</span>
            </div>
            <h1 className="text-2xl font-bold text-[#2D3E50]">Checkout</h1>
          </div>
          <div className="flex items-center gap-2 text-[#2D3E50] font-medium">
             <span className="text-lg">📞</span>
             <span>01405-045023</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Order Details & Address */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#F4F8EF] px-6 py-4 border-b border-gray-200">
                  <h2 className="text-[#3A5A1F] font-bold text-lg">Order Details</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">First Name *</FormLabel>
                          <FormControl>
                            <Input className="bg-gray-50 border-gray-200 h-12" {...field} />
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
                          <FormLabel className="text-gray-700 font-semibold">Last Name</FormLabel>
                          <FormControl>
                            <Input className="bg-gray-50 border-gray-200 h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Phone *</FormLabel>
                          <FormControl>
                            <Input className="bg-gray-50 border-gray-200 h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Email Address *</FormLabel>
                          <FormControl>
                            <Input className="bg-gray-50 border-gray-200 h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="text-[#3A5A1F] font-bold text-lg mb-6">Customer Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="division"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Division *</FormLabel>
                            <select 
                              className="flex h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7FB432]"
                              {...field}
                            >
                              <option value="">Select Division</option>
                              <option value="Dhaka">Dhaka</option>
                              <option value="Chittagong">Chittagong</option>
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
                            <FormLabel className="text-gray-700 font-semibold">District *</FormLabel>
                            <select 
                              className="flex h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7FB432]"
                              {...field}
                            >
                              <option value="">Select District</option>
                              <option value="Dhaka">Dhaka</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="upazila"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Upazila/Thana *</FormLabel>
                            <FormControl>
                              <Input className="bg-gray-50 border-gray-200 h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Full Address *</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7FB432]"
                            {...field}
                          />
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
                        <FormLabel className="text-gray-700 font-semibold">Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <textarea 
                            placeholder="Add any special instructions for your order"
                            className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7FB432]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Payment */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#F4F8EF] px-6 py-4 border-b border-gray-200">
                  <h2 className="text-[#3A5A1F] font-bold text-lg">Order Summary</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-16 h-16 border border-gray-100 rounded bg-gray-50 p-1 flex-shrink-0">
                          <img src={item.product.imageUrl} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} x ৳{Number(item.product.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">৳{subtotal}</span>
                    </div>
                    <div className="text-[#3A5A1F] text-sm cursor-pointer hover:underline">
                      Have a coupon? Click here to enter your code
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">৳{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-[#3A5A1F] border-t border-gray-100 pt-3">
                      <span>Total</span>
                      <span>৳{total}</span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <p className="font-bold text-gray-700">Payment Method</p>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <div className="space-y-3">
                          <div 
                            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${field.value === "Cash on Delivery" ? "bg-[#FFFCEB] border-[#FFD33D]" : "border-gray-200"}`}
                            onClick={() => field.onChange("Cash on Delivery")}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${field.value === "Cash on Delivery" ? "border-[#FFD33D]" : "border-gray-300"}`}>
                              {field.value === "Cash on Delivery" && <div className="w-2 h-2 rounded-full bg-[#FFD33D]" />}
                            </div>
                            <span className="font-medium text-gray-900">Cash on Delivery</span>
                          </div>
                          <div 
                            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${field.value === "RupantorPay" ? "bg-[#FFFCEB] border-[#FFD33D]" : "border-gray-200"}`}
                            onClick={() => field.onChange("RupantorPay")}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${field.value === "RupantorPay" ? "border-[#FFD33D]" : "border-gray-300"}`}>
                              {field.value === "RupantorPay" && <div className="w-2 h-2 rounded-full bg-[#FFD33D]" />}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">RupantorPay (bKash, Nagad, Rocket)</span>
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createOrder.isPending} 
                    className="w-full h-14 bg-[#FFD33D] hover:bg-[#FFD33D]/90 text-gray-900 font-bold text-lg rounded-lg mt-8"
                  >
                    {createOrder.isPending ? "Placing Order..." : "Place Order Now"}
                  </Button>
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
