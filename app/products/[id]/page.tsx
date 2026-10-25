import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import FavoriteButton from "@/components/FavoriteButton";
import ReviewsSection from "@/components/ReviewsSection"; // MỚI
import { buttonVariants } from "@/components/ui/button";
import { ReviewsProvider } from "@/contexts/ReviewsContext"; // MỚI
import { getProductReviews } from "@/lib/reviews";

// Chỉ các id trong generateStaticParams mới tồn tại, id khác là 404 thật
export const dynamicParams = false;

type ProductDetailPageProps = {
    params: Promise<{ id: string }>;
};

type Product = (typeof products)[number];

export async function generateStaticParams() {
    return products.map((product) => ({
        id: String(product.id),
    }));
}

export async function generateMetadata({
    params,
}: ProductDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = products.find((item) => item.id === Number(id));

    if (!product) {
        return {
            title: "Product Not Found | My Store",
        };
    }

    return {
        title: `${product.name} | My Store`,
        description: product.description,
    };
}

export default async function ProductDetailPage({
    params,
}: ProductDetailPageProps) {
    const { id } = await params;

    const product: Product | undefined = products.find(
        (item) => item.id === Number(id)
    );

    if (!product) {
        notFound();
    }

    // Đọc đánh giá trên server bằng anon key, rồi truyền xuống qua props
    const { reviews } = await getProductReviews(product.id);

    // Sản phẩm liên quan: bỏ sản phẩm hiện tại, ưu tiên cùng danh mục, lấy tối đa 3
    const related = products
        .filter((item) => item.id !== product.id)
        .sort(
            (a, b) =>
                Number(b.category === product.category) -
                Number(a.category === product.category)
        )
        .slice(0, 3);

    return (
        <>
            <Header />

            <main className="mx-auto max-w-7xl px-4 py-8">
                {/* Đường dẫn điều hướng */}
                <nav
                    aria-label="Breadcrumb"
                    className="mb-6 text-sm text-gray-500"
                >
                    <Link href="/" className="hover:text-black hover:underline">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <Link
                        href={`/?category=${encodeURIComponent(product.category)}`}
                        className="hover:text-black hover:underline"
                    >
                        {product.category}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div
                    data-testid="product-detail"
                    className="grid gap-8 md:grid-cols-2"
                >
                    {/* Cột trái: ảnh */}
                    <div className="flex items-center justify-center rounded-2xl border bg-gray-100 p-6">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-80 w-full object-contain md:h-96"
                        />
                    </div>

                    {/* Cột phải: thông tin */}
                    <div className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                        <p
                            data-testid="detail-category"
                            className="mb-4 inline-block w-fit rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-600"
                        >
                            Category: {product.category}
                        </p>

                        <h1
                            data-testid="detail-name"
                            className="text-3xl font-bold"
                        >
                            {product.name}
                        </h1>

                        <p
                            data-testid="detail-price"
                            className="mt-3 text-3xl font-semibold"
                        >
                            ${product.price.toFixed(2)}
                        </p>

                        <hr className="my-6" />

                        <p
                            data-testid="detail-description"
                            className="leading-7 text-gray-600"
                        >
                            {product.description}
                        </p>

                        {/* Bảng chi tiết nhỏ, chỉ dùng dữ liệu có thật */}
                        <dl className="mt-6 divide-y rounded-lg border text-sm">
                            <div className="flex justify-between px-4 py-3">
                                <dt className="text-gray-500">Category</dt>
                                <dd className="font-medium">
                                    {product.category}
                                </dd>
                            </div>
                            <div className="flex justify-between px-4 py-3">
                                <dt className="text-gray-500">Product ID</dt>
                                <dd className="font-medium">#{product.id}</dd>
                            </div>
                        </dl>

                        {/* Nút hành động */}
                        <div className="mt-8 flex items-center gap-3">
                            <Link
                                href="/"
                                data-testid="link-back"
                                className={`${buttonVariants()} h-10! px-6! text-base!`}
                            >
                                Back to Store
                            </Link>

                            {/* Client Component được nhúng vào Server Component */}
                            <FavoriteButton productId={product.id} />
                        </div>
                    </div>
                </div>

                {/* MỚI: khu vực đánh giá. Provider bọc CHỈ phần này, không bọc cả app */}
                <section id="reviews" className="mt-14">
                    <h2 className="mb-6 text-xl font-bold">
                        Customer reviews
                    </h2>

                    <ReviewsProvider
                        productId={product.id}
                        initialReviews={reviews}
                    >
                        <ReviewsSection productId={product.id} />
                    </ReviewsProvider>
                </section>

                {/* Sản phẩm liên quan */}
                {related.length > 0 && (
                    <section className="mt-14">
                        <h2 className="mb-6 text-xl font-bold">
                            You may also like
                        </h2>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}