import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Menu, X, User, LogOut, Search, Home, Grid, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { data: cartItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: Grid },
    { href: "/sarees", label: "Sarees" },
    { href: "/lehengas", label: "Lehengas" },
    { href: "/pakistani-dresses", label: "Pakistani Dress" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 md:gap-3 group">
              <img src="/logo.png" alt="চন্দ্রাবতী" className="h-8 md:h-12 w-8 md:w-12 object-contain" />
              <div className="flex flex-col">
                <span className="font-heading text-lg md:text-2xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors leading-none">
                  চন্দ্রাবতী
                </span>
                <span className="hidden md:block font-body text-[10px] tracking-[0.1em] text-muted-foreground uppercase mt-1 leading-none">
                  Sarees That Define You
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    location === link.href ? "text-accent" : "text-gray-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons & Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search (Desktop) */}
              <Button variant="ghost" size="icon" className="hidden md:flex text-gray-500 hover:text-accent hover:bg-transparent">
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-accent hover:bg-transparent">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold h-4 md:h-5 w-4 md:w-5 flex items-center justify-center rounded-full animate-in zoom-in">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name || "User"}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button asChild variant="default" size="sm" className="hidden md:flex bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
                  <Link href="/auth">Login</Link>
                </Button>
              )}

              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-8 mt-8">
                    <div className="flex flex-col gap-4">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="text-lg font-heading font-medium text-gray-800 hover:text-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    {!user && (
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white">
                        <Link href="/auth">Login / Register</Link>
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around h-16 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/" className={`flex flex-col items-center gap-1 ${location === "/" ? "text-accent" : "text-gray-500"}`}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/shop" className={`flex flex-col items-center gap-1 ${location === "/shop" ? "text-accent" : "text-gray-500"}`}>
          <Grid className="h-5 w-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>
        <div className="relative -mt-10">
          <Link href="/" className="bg-white rounded-full p-1 shadow-md border border-gray-50">
             <div className="p-1 rounded-full">
               <img src="/logo.png" alt="Home" className="h-14 w-14 object-contain" />
             </div>
          </Link>
        </div>
        <Link href="/auth" className={`flex flex-col items-center gap-1 ${location === "/auth" ? "text-accent" : "text-gray-500"}`}>
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
        <Link href="/contact" className={`flex flex-col items-center gap-1 ${location === "/contact" ? "text-accent" : "text-gray-500"}`}>
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px] font-medium">Contact</span>
        </Link>
      </div>
    </>
  );
}
