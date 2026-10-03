import Header from "@/components/Header";

import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Product Section */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-8 text-3xl font-bold">
          Products
        </h2>

        <div
          data-testid="product-list"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>
    </main>
  );
}