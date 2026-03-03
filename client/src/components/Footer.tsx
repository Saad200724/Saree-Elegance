import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Footer() {
  const [location] = useLocation();
  const hideFooter = location === "/login" || location === "/signup";

  if (hideFooter) return null;

  return (
    <footer className="bg-white border-t border-gray-100 pt-8 md:pt-16 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand */}
          <div className="space-y-4 text-center md:text-left">
            <Link href="/" className="flex items-center justify-center md:justify-start gap-3 group">
              <img src="/logo.png" alt="চন্দ্রাবতী" className="h-8 md:h-10 w-8 md:w-10 object-contain" />
              <span className="font-heading text-xl md:text-2xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors">
                চন্দ্রাবতী
              </span>
            </Link>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Sarees That Define You. Experience the elegance of traditional handloom and contemporary designs.
            </p>
          </div>

          {/* Shop Links - Hidden on Mobile or Shortened */}
          <div className="hidden md:block">
            <h3 className="font-heading font-semibold text-gray-900 mb-6">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-gray-500 hover:text-accent text-sm transition-colors">All Products</Link></li>
              <li><Link href="/sarees" className="text-gray-500 hover:text-accent text-sm transition-colors">Sarees</Link></li>
              <li><Link href="/lehengas" className="text-gray-500 hover:text-accent text-sm transition-colors">Lehengas</Link></li>
              <li><Link href="/pakistani-dresses" className="text-gray-500 hover:text-accent text-sm transition-colors">Pakistani Dresses</Link></li>
            </ul>
          </div>

          {/* Quick Links for Mobile */}
          <div className="flex md:hidden justify-center gap-6 border-y border-gray-50 py-4">
            <Link href="/shop" className="text-gray-600 text-xs font-medium">Shop</Link>
            <Link href="/about-us" className="text-gray-600 text-xs font-medium">About</Link>
            <Link href="/contact" className="text-gray-600 text-xs font-medium">Contact</Link>
            <Link href="/privacy" className="text-gray-600 text-xs font-medium">Privacy</Link>
          </div>

          {/* Company - Desktop Only */}
          <div className="hidden md:block">
            <h3 className="font-heading font-semibold text-gray-900 mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about-us" className="text-gray-500 hover:text-accent text-sm transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-accent text-sm transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-accent text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-accent text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="text-center md:text-left">
            <h3 className="hidden md:block font-heading font-semibold text-gray-900 mb-6">Connect</h3>
            <p className="text-gray-500 text-xs md:text-sm mb-4">Phone: 01805-108818</p>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="https://www.facebook.com/profile.php?id=61584594611053" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent transition-colors flex items-center gap-2">
                <Facebook className="h-4 md:h-5 w-4 md:w-5" />
                <span className="text-xs md:text-sm font-medium">Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-[10px] md:text-xs">© 2026 চন্দ্রাবতী. Powered by <a href="https://znforge.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">ZnForge</a></p>
        </div>
      </div>
    </footer>
  );
}
