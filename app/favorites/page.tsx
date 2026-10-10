"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import Header from "@/components/Header";
import FavoriteButton from "@/components/FavoriteButton";
import { buttonVariants } from "@/components/ui/button";

export default function FavoritesPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { favorites, favoritesLoading } = useFavorites();

    // Chưa đăng nhập (và Auth đã kiểm tra xong) -> chuyển sang /login
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    // Đang kiểm tra session: chỉ hiện trạng thái chờ
    if (loading) {
        return (
            <main className="mx-auto max-w-7xl px-4 py-10">
                <p className="text-gray-500">Loading...</p>
            </main>
        );
    }

    // Chưa đăng nhập: không hiện gì trong lúc đang chuyển hướng
    if (!user) {
        return null;
    }

    // Đã đăng nhập nhưng danh sách yêu thích chưa tải xong -> tiếp tục chờ
    if (favoritesLoading) {
        return (
            <>
                <Header />
                <main className="mx-auto max-w-7xl px-4 py-10">
                    <p className="text-gray-500">Loading...</p>
                </main>
            </>
        );
    }

    // Tra ID yêu thích trong dữ liệu sản phẩm dùng chung
    const favoriteProducts = products.filter((product) =>
        favorites.includes(product.id)
    );

    return (
        <>
            <Header />

            <main
                data-testid="favorites-page"
                className="mx-auto max-w-7xl px-4 py-8"
            >
                <div className="mb-6 flex items-baseline justify-between gap-4">
                    <h1 className="text-xl font-bold">My Favorites</h1>
                    <p className="text-sm text-gray-500">
                        {favoriteProducts.length}{" "}
                        {favoriteProducts.length === 1 ? "item" : "items"}
                    </p>
                </div>

                {favoriteProducts.length === 0 ? (
                    <div
                        data-testid="favorites-empty"
                        className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center"
                    >
                        <p className="text-lg font-semibold">
                            You have no favorite products yet.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Press the heart on any product to save it here.
                        </p>
                        <Link
                            href="/"
                            className={`${buttonVariants()} mt-6 h-10! px-6! text-base!`}
                        >
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {favoriteProducts.map((product) => (
                            <li
                                key={product.id}
                                data-testid="favorite-item"
                                className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                            >
                                {/* Nút tim: bấm để bỏ yêu thích ngay tại trang này */}
                                <FavoriteButton
                                    productId={product.id}
                                    className="absolute right-3 top-3 z-10"
                                />

                                <Link href={`/products/${product.id}`}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-48 w-full bg-gray-100 object-contain"
                                    />
                                </Link>

                                <div className="space-y-1 p-5">
                                    <p className="text-xs text-gray-500">
                                        {product.category}
                                    </p>
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="block text-lg font-semibold hover:underline"
                                    >
                                        {product.name}
                                    </Link>
                                    <p className="text-lg font-bold">
                                        ${product.price.toFixed(2)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </>
    );
}