import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import logo from "/logo.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login data:", data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            <Link href="/">
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Shop
              </div>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10 w-10 object-contain rounded-full bg-yellow-100 p-1" />
            <div className="flex flex-col">
              <span className="font-bold text-emerald-600 leading-none">Meow Meow</span>
              <span className="text-[10px] text-gray-500">Pet Shop</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
              <Lock className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-emerald-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-sm mb-8 text-center">Sign in to Meow Meow Pet Shop</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-900 flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          {...field} 
                          className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-emerald-500 rounded-xl h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-900 flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                          className="bg-gray-50 border-gray-100 focus:bg-white focus:ring-emerald-500 rounded-xl h-12"
                        />
                      </FormControl>
                      <div className="flex justify-end mt-1">
                        <button type="button" className="text-xs text-emerald-600 hover:underline">Forgot Password?</button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 mt-4">
                  Sign In <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-sm text-gray-500">
              Don't have an account? <Link href="/auth" className="text-emerald-600 font-semibold hover:underline">Sign Up</Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[10px] text-gray-400">
          Your security is important to us. All data is encrypted.
        </div>
      </div>
    </div>
  );
}
