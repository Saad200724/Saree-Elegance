import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-heading text-2xl font-bold tracking-tight text-primary">
                PURNIMA
              </span>
              <span className="block font-body text-xs tracking-[0.2em] text-muted-foreground uppercase mt-1">
                Sarees
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Exquisite collection of traditional and modern sarees, handcrafted with love and heritage.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
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
              <li><a href="#" className="text-gray-500 hover:text-accent text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-accent text-sm transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-500 hover:text-accent text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-accent text-sm transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 mb-6">Newsletter</h3>
            <p className="text-gray-500 text-sm mb-4">Subscribe to get special offers and updates.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">© 2024 Purnima Sarees. All rights reserved.</p>
          <div className="flex gap-4">
             {/* Payment icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
