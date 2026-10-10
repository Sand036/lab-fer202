import { products } from "@/data/products";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const params = await searchParams;

  const q = (params.q ?? "").trim().toLowerCase();
  const category = (params.category ?? "").trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q);

    const matchesCategory =
      !category || product.category.toLowerCase() === category;

    return matchesQuery && matchesCategory;
  });

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  return (
    <>
      <Header />

      {/* MỚI: dùng cùng khung max-w-7xl với Header để hai phần thẳng hàng */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* MỚI: đổi "My Store" thành "Products" để không bị lặp với Header */}
        <h1 className="mb-6 text-2xl font-bold">Products</h1>

        <form
          method="get"
          action="/"
          className="mb-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search products..."
            data-testid="search-input"
            className="min-w-0 flex-1 rounded-md border px-3 py-2"
          />

          <select
            name="category"
            defaultValue={params.category ?? ""}
            data-testid="category-select"
            className="rounded-md border px-3 py-2"
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="submit"
            data-testid="btn-search"
            className="rounded-md bg-black px-5 py-2 text-white hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        {filteredProducts.length > 0 ? (
          <div
            data-testid="product-list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p data-testid="no-results" className="py-8 text-gray-500">
            No products found.
          </p>
        )}
      </main>
    </>
  );
}