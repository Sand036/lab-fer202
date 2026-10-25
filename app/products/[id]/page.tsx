import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import FavoriteButton from "@/components/FavoriteButton";
import StarRating from "@/components/StarRating"; // MỚI
import { buttonVariants } from "@/components/ui/button";
import { getProductReviews } from "@/lib/reviews"; // MỚI

// MỚI: chỉ các id trong generateStaticParams mới tồn tại, id khác là 404 thật
export const dynamicParams = false;

type ProductDetailPageProps = {
    params: Promise<{ id: string }>;
};

type Product = (typeof products)[number];

// MỚI: định dạng ngày cố định (UTC) để HTML luôn giống nhau
function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

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

    // MỚI: đọc đánh giá trên server bằng anon key
    const { average, count, reviews } = await getProductReviews(product.id);

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
                                className={`${buttonVariants()} h-10! px-6! text-base!`}
                            >
                                Back to Store
                            </Link>

                            {/* Client Component được nhúng vào Server Component */}
                            <FavoriteButton productId={product.id} />
                        </div>
                    </div>
                </div>

                {/* MỚI: khối đánh giá, được render sẵn trong HTML của server */}
                <section id="reviews" className="mt-14">
                    <h2 className="mb-6 text-xl font-bold">
                        Customer reviews
                    </h2>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Tổng hợp: điểm trung bình và số lượng */}
                        <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Average rating
                            </p>

                            <div className="mt-2 flex items-center gap-4">
                                {/* Chỉ chứa số thuần để script đọc được */}
                                <span
                                    data-testid="rating-average"
                                    className="text-5xl font-bold"
                                >
                                    {average}
                                </span>

                                <div>
                                    <StarRating
                                        value={average}
                                        className="text-xl"
                                    />
                                    <p className="text-sm text-gray-500">
                                        out of 5
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-gray-600">
                                <span
                                    data-testid="review-count"
                                    className="font-semibold"
                                >
                                    {count}
                                </span>{" "}
                                {count === 1 ? "review" : "reviews"}
                            </p>
                        </aside>

                        {/* Danh sách đánh giá (Bước 8 sẽ thêm form phía trên) */}
                        <div className="lg:col-span-2">
                            {count === 0 ? (
                                <p
                                    data-testid="reviews-empty"
                                    className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500"
                                >
                                    No reviews yet. Be the first to review this
                                    product.
                                </p>
                            ) : (
                                <ul className="space-y-4">
                                    {reviews.map((review) => (
                                        <li
                                            key={review.id}
                                            data-testid="review-item"
                                            className="rounded-2xl border bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        data-testid="review-author"
                                                        className="font-semibold"
                                                    >
                                                        {review.author ||
                                                            "Anonymous"}
                                                    </span>

                                                    <span className="flex items-center gap-1.5 text-sm">
                                                        <StarRating
                                                            value={
                                                                review.rating
                                                            }
                                                        />
                                                        <span>
                                                            <span
                                                                data-testid="review-rating"
                                                                className="font-medium"
                                                            >
                                                                {review.rating}
                                                            </span>
                                                            /5
                                                        </span>
                                                    </span>
                                                </div>

                                                <time
                                                    dateTime={
                                                        review.created_at
                                                    }
                                                    className="text-xs text-gray-500"
                                                >
                                                    {formatDate(
                                                        review.created_at
                                                    )}
                                                </time>
                                            </div>

                                            <p
                                                data-testid="review-comment"
                                                className="mt-3 whitespace-pre-wrap break-words leading-7 text-gray-700"
                                            >
                                                {review.comment}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
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