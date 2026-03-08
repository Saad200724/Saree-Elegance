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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, User, Phone, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
  address: z.string().min(10, "Please provide a full address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Login() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isSignup = location === "/signup";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isSignup) {
      loginForm.reset();
      signupForm.reset();
    } else {
      loginForm.reset();
      signupForm.reset();
    }
  }, [isSignup]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Invalid credentials");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back!", description: "Logged in successfully" });
      setLocation("/");
    } catch (error: any) {
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid credentials",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          password: data.password,
        }),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Registration failed");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Account Created", description: "Welcome to চন্দ্রাবতী!" });
      setLocation("/");
    } catch (error: any) {
      toast({ 
        title: "Signup Failed", 
        description: error.message || "Email might already be in use",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-md w-full relative z-20">
          <Card className="border-border/40 shadow-2xl shadow-primary/5 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1 pb-4 text-center">
              <CardTitle className="text-3xl font-bold font-heading text-primary">
                {isSignup ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isSignup ? "Join the চন্দ্রাবতী family today" : "Sign in to access your account"}
              </p>
            </CardHeader>
            <CardContent className="text-black">
              {isSignup ? (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-3">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 text-xs font-bold">
                            <User className="h-3 w-3 text-accent" /> Full Name
                          </FormLabel>
                          <FormControl>
                            <Input data-testid="input-name" placeholder="Your full name" {...field} className="h-10 rounded-lg border-gray-300 focus:ring-primary text-black bg-white" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 text-xs font-bold">
                            <Mail className="h-3 w-3 text-accent" /> Email
                          </FormLabel>
                          <FormControl>
                            <Input data-testid="input-email" placeholder="email@example.com" {...field} className="h-10 rounded-lg border-gray-300 focus:ring-primary text-black bg-white" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 text-xs font-bold">
                            <Phone className="h-3 w-3 text-accent" /> Phone
                          </FormLabel>
                          <FormControl>
                            <Input data-testid="input-phone" placeholder="01XXXXXXXXX" {...field} className="h-10 rounded-lg border-gray-300 focus:ring-primary text-black bg-white" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 text-xs font-bold">
                            <MapPin className="h-3 w-3 text-accent" /> Address
                          </FormLabel>
                          <FormControl>
                            <textarea 
                              data-testid="input-address"
                              placeholder="Full Delivery Address" 
                              {...field} 
                              className="w-full min-h-[80px] p-2 rounded-lg border border-gray-300 focus:ring-primary text-black bg-white text-sm" 
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 text-xs font-bold">
                            <Lock className="h-3 w-3 text-accent" /> Password
                          </FormLabel>
                          <FormControl>
                            <Input data-testid="input-password" type="password" {...field} className="h-10 rounded-lg border-gray-300 focus:ring-primary text-black bg-white" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 text-xs font-bold">
                            <Lock className="h-3 w-3 text-accent" /> Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input data-testid="input-confirm-password" type="password" {...field} className="h-10 rounded-lg border-gray-300 focus:ring-primary text-black bg-white" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <Button data-testid="button-signup" type="submit" className="w-full btn-accent mt-4 h-11 text-lg" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Sign Up"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 font-bold">
                            <Mail className="h-4 w-4 text-accent" /> Email
                          </FormLabel>
                          <FormControl>
                            <Input data-testid="input-login-email" placeholder="name@example.com" {...field} className="h-12 rounded-xl border-gray-300 focus:ring-primary text-black bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center gap-2 font-bold">
                            <Lock className="h-4 w-4 text-accent" /> Password
                          </FormLabel>
                          <FormControl>
                            <Input data-testid="input-login-password" type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl border-gray-300 focus:ring-primary text-black bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button data-testid="button-login" type="submit" className="w-full btn-primary mt-4 h-12 text-lg" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              )}
              
              <div className="mt-8 text-center text-sm">
                <p className="text-muted-foreground">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <Link 
                    href={isSignup ? "/login" : "/signup"} 
                    className="text-primary font-bold hover:text-accent transition-colors"
                    data-testid="link-toggle-auth"
                  >
                    {isSignup ? "Login here" : "Sign up here"}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
