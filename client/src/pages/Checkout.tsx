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
import { Loader2, Phone, ShoppingBag, CheckCircle2, ShieldCheck, Truck } from "lucide-react";

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
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  if (!cartItems || cartItems.length === 0) {
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
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] selection:bg-primary/10">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 transform transition-transform hover:rotate-0 duration-500">
              <ShoppingBag className="text-white w-9 h-9 -rotate-3 transition-transform hover:rotate-0" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">Checkout.</h1>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Complete your ethnic collection order</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-50/50 group hover:scale-105 transition-all duration-500">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:rotate-12 transition-all">
              <Phone className="w-6 h-6 text-accent group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Hotline</p>
              <p className="font-black text-gray-900 text-2xl tracking-tighter">01405-045023</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Section: Input Fields */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Personal Information */}
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/30 overflow-hidden group hover:shadow-gray-200/40 transition-all duration-700">
                <div className="bg-[#fcfcfc] px-12 py-8 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                    <div className="w-3 h-10 bg-primary rounded-full shadow-lg shadow-primary/20" />
                    Personal Info
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step 01</span>
                  </div>
                </div>
                
                <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="System" className="h-16 bg-gray-50/30 border-gray-100 focus:bg-white focus:ring-[12px] focus:ring-primary/5 rounded-[1.25rem] transition-all text-lg font-bold px-8 placeholder:text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Administrator" className="h-16 bg-gray-50/30 border-gray-100 focus:bg-white focus:ring-[12px] focus:ring-primary/5 rounded-[1.25rem] transition-all text-lg font-bold px-8 placeholder:text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="01XXXXXXXXX" className="h-16 bg-gray-50/30 border-gray-100 focus:bg-white focus:ring-[12px] focus:ring-primary/5 rounded-[1.25rem] transition-all text-lg font-bold px-8 placeholder:text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@gmail.com" className="h-16 bg-gray-50/30 border-gray-100 focus:bg-white focus:ring-[12px] focus:ring-primary/5 rounded-[1.25rem] transition-all text-lg font-bold px-8 placeholder:text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/30 overflow-hidden group hover:shadow-gray-200/40 transition-all duration-700">
                <div className="bg-[#fcfcfc] px-12 py-8 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                    <div className="w-3 h-10 bg-accent rounded-full shadow-lg shadow-accent/20" />
                    Shipping Address
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step 02</span>
                  </div>
                </div>
                
                <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FormField
                      control={form.control}
                      name="division"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Division *</FormLabel>
                          <select 
                            className="w-full h-16 bg-gray-50/30 border border-gray-100 rounded-[1.25rem] px-8 text-gray-900 font-bold text-lg focus:bg-white focus:ring-[12px] focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                            {...field}
                          >
                            <option value="">Select Division</option>
                            <option value="Dhaka">Dhaka</option>
                            <option value="Chittagong">Chittagong</option>
                            <option value="Rajshahi">Rajshahi</option>
                            <option value="Khulna">Khulna</option>
                            <option value="Barisal">Barisal</option>
                            <option value="Sylhet">Sylhet</option>
                            <option value="Rangpur">Rangpur</option>
                            <option value="Mymensingh">Mymensingh</option>
                          </select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">District *</FormLabel>
                          <select 
                            className="w-full h-16 bg-gray-50/30 border border-gray-100 rounded-[1.25rem] px-8 text-gray-900 font-bold text-lg focus:bg-white focus:ring-[12px] focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                            {...field}
                          >
                            <option value="">Select District</option>
                            <option value="Dhaka">Dhaka</option>
                            <option value="Gazipur">Gazipur</option>
                            <option value="Narayanganj">Narayanganj</option>
                            <option value="Savar">Savar</option>
                          </select>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="upazila"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Upazilla/Thana *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Thana" className="h-16 bg-gray-50/30 border-gray-100 focus:bg-white focus:ring-[12px] focus:ring-primary/5 rounded-[1.25rem] transition-all text-lg font-bold px-8 placeholder:text-gray-200" {...field} />
                          </FormControl>
                          <FormMessage className="font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Full Address *</FormLabel>
                        <FormControl>
                          <textarea 
                            placeholder="House number, Street name, Area, etc."
                            className="w-full min-h-[160px] bg-gray-50/30 border border-gray-100 rounded-[2rem] p-10 text-lg font-bold focus:bg-white focus:ring-[12px] focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-gray-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="font-bold text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="orderNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <textarea 
                            placeholder="Add any special instructions for your delivery"
                            className="w-full min-h-[100px] bg-gray-50/30 border border-gray-100 rounded-[1.5rem] p-8 text-lg font-bold focus:bg-white focus:ring-[12px] focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-gray-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right Section: Order Summary & Payment */}
            <div className="lg:col-span-4 space-y-12">
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden sticky top-24 transform transition-transform hover:-translate-y-1 duration-700">
                <div className="bg-[#fcfcfc] px-10 py-8 border-b border-gray-50">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Summary</h2>
                </div>
                
                <div className="p-10">
                  {/* Cart Items Scroll Area */}
                  <div className="space-y-8 mb-10 max-h-[380px] overflow-y-auto pr-4 custom-scrollbar">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-6 items-center group">
                        <div className="w-24 h-24 bg-gray-50 rounded-[1.5rem] overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 shadow-sm">
                          <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-black text-gray-900 truncate tracking-tight group-hover:text-primary transition-colors">{item.product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">৳{Number(item.product.price).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Cost Breakdown */}
                  <div className="space-y-6 border-t border-gray-50 pt-10">
                    <div className="flex justify-between items-center text-gray-400 font-bold text-sm uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-gray-900 font-black">৳{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="bg-primary/5 p-6 rounded-[1.5rem] border border-primary/10 flex items-center justify-between group cursor-pointer transition-all hover:bg-primary/10">
                      <span className="text-primary font-black text-xs uppercase tracking-[0.2em]">Apply Coupon</span>
                      <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-primary/20 transition-all group-hover:scale-110 group-hover:rotate-90">+</div>
                    </div>

                    <div className="flex justify-between items-center text-gray-400 font-bold text-sm uppercase tracking-widest">
                      <span>Delivery Fee</span>
                      <span className="text-gray-900 font-black">৳{deliveryFee}</span>
                    </div>
                    
                    {/* Grand Total */}
                    <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] mt-10 shadow-2xl shadow-gray-900/20 transform -rotate-1 hover:rotate-0 transition-transform duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                      <div className="flex justify-between items-end relative z-10">
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-2">Grand Total</span>
                        <span className="text-5xl font-black italic tracking-tighter">৳{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div className="mt-16 space-y-8">
                    <p className="font-black text-gray-900 text-xs uppercase tracking-[0.3em] mb-8 border-l-4 border-accent pl-6">Payment Method</p>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <div className="space-y-5">
                          <div 
                            className={`flex items-center gap-6 p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 ${field.value === "Cash on Delivery" ? "bg-primary/5 border-primary shadow-xl shadow-primary/5 scale-[1.03]" : "bg-white border-gray-100 hover:border-gray-200"}`}
                            onClick={() => field.onChange("Cash on Delivery")}
                          >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${field.value === "Cash on Delivery" ? "border-primary bg-primary shadow-lg shadow-primary/30" : "border-gray-200"}`}>
                              {field.value === "Cash on Delivery" && <div className="w-3 h-3 rounded-full bg-white shadow-sm" />}
                            </div>
                            <div className="flex-1">
                              <span className="font-black text-gray-900 text-xl tracking-tight">Cash on Delivery</span>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Payment at your doorstep</p>
                            </div>
                          </div>
                          
                          <div 
                            className={`flex items-center gap-6 p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 ${field.value === "RupantorPay" ? "bg-accent/5 border-accent shadow-xl shadow-accent/5 scale-[1.03]" : "bg-white border-gray-100 hover:border-gray-200"}`}
                            onClick={() => field.onChange("RupantorPay")}
                          >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${field.value === "RupantorPay" ? "border-accent bg-accent shadow-lg shadow-accent/30" : "border-gray-200"}`}>
                              {field.value === "RupantorPay" && <div className="w-3 h-3 rounded-full bg-white shadow-sm" />}
                            </div>
                            <div className="flex-1">
                              <span className="font-black text-gray-900 text-xl tracking-tight">RupantorPay</span>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">bKash, Nagad, Rocket</p>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createOrder.isPending} 
                    className="w-full h-24 bg-accent hover:bg-accent/90 text-white font-black text-3xl rounded-[2.5rem] mt-16 shadow-2xl shadow-accent/40 transition-all hover:scale-[1.05] active:scale-[0.95] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    {createOrder.isPending ? (
                      <div className="flex items-center gap-6 relative z-10">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <span className="italic">Placing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-4 relative z-10">
                        <span>Place Order</span>
                        <CheckCircle2 className="w-8 h-8 group-hover:scale-125 transition-transform" />
                      </div>
                    )}
                  </Button>
                  
                  {/* Trust Badges */}
                  <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex gap-8 items-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-help">
                      <ShieldCheck className="w-6 h-6 text-gray-900" />
                      <Truck className="w-6 h-6 text-gray-900" />
                      <ShieldCheck className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[10px] text-gray-300 uppercase tracking-[0.4em] font-black">Secure Checkout</p>
                      <div className="h-1 w-12 bg-gray-50 rounded-full" />
                    </div>
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
