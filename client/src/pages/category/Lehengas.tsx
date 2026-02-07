import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import bannerImg from "@assets/images/banner.jpg";

export default function Lehengas() {
  const { data: products, isLoading } = useProducts({ category: "Lehenga" });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="relative h-[40vh] w-full overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-white text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Lehengas</h1>
          <p className="text-lg max-w-2xl opacity-90">Make your special day unforgettable with our stunning bridal and festive lehenga designs.</p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
