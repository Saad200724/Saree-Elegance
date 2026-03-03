import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="চন্দ্রাবতী" className="h-10 w-10 object-contain" />
              <span className="font-heading text-2xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors">
                চন্দ্রাবতী
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sarees That Define You. Experience the elegance of traditional handloom and contemporary designs.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.facebook.com/profile.php?id=61584594611053" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 mb-6">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-gray-500 hover:text-accent text-sm transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=Saree" className="text-gray-500 hover:text-accent text-sm transition-colors">Sarees</Link></li>
              <li><Link href="/shop?category=Lehenga" className="text-gray-500 hover:text-accent text-sm transition-colors">Lehengas</Link></li>
              <li><Link href="/shop?category=Party Dress" className="text-gray-500 hover:text-accent text-sm transition-colors">Party Dresses</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about-us" className="text-gray-500 hover:text-accent text-sm transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-accent text-sm transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-accent text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-accent text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 mb-6">Connect</h3>
            <p className="text-gray-500 text-sm mb-4">Phone: 01805-108818</p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61584594611053" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">© 2026 চন্দ্রাবতী. Powered by <a href="http://znforge.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">ZnForge</a></p>
          <div className="flex gap-4">
             {/* Payment icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
