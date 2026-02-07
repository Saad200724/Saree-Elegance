import { Link } from "wouter";
import { type Product } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
        
        {/* Badge */}
        {product.isNewArrival && (
          <div className="absolute top-3 left-3 z-10 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
            New
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-contain object-center bg-white transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center bg-gradient-to-t from-black/20 to-transparent">
            <Button 
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="w-full bg-white text-gray-900 hover:bg-accent hover:text-white shadow-lg transition-colors font-medium"
            >
              {addToCart.isPending ? "Adding..." : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-heading font-medium text-gray-900 text-lg mb-2 truncate group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              ৳{Number(product.price).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ৳{Number(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
