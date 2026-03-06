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
    e.preventDefault();
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div className="relative h-full flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-sans text-sm font-medium text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex flex-col mb-4">
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {Number(product.originalPrice).toLocaleString()} BDT
              </span>
            )}
            <span className="text-sm font-bold text-[#0D3B31]">
              {Number(product.price).toLocaleString()} BDT
            </span>
          </div>

          <div className="mt-auto">
            <div className="w-full py-2 px-4 border border-[#0D3B31] text-[#0D3B31] rounded-md text-xs font-medium text-center transition-colors group-hover:bg-[#0D3B31] group-hover:text-white">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
