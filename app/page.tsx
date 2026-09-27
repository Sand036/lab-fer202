import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">
            My Store
          </h1>

          <div className="flex gap-3">
            <Link
              href="/login"
              className={buttonVariants()}
              data-testid="btn-login"
            >
              Login
            </Link>

            <Link
              href="/register"
              className={buttonVariants({ variant: "outline" })}
              data-testid="btn-register"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

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