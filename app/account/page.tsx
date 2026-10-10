"use client";

import { useContext, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import { buttonVariants } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";

// Định dạng ngày giờ, trả về "—" nếu không có dữ liệu
function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function AccountPage() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const { favorites, favoritesLoading } = useFavorites();

    if (!auth) {
        throw new Error(
            "AccountPage must be used inside AuthProvider"
        );
    }

    const { user, loading } = auth;

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    // Still checking authentication
    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-600">Loading...</p>
            </main>
        );
    }

    // User is not authenticated
    if (!user) {
        return null;
    }

    // Chữ cái đầu của email để làm avatar
    const initial = user.email?.charAt(0).toUpperCase() ?? "?";

    // User is authenticated
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main
                data-testid="account-page"
                className="mx-auto max-w-7xl px-4 py-8"
            >
                <h1 className="mb-6 text-xl font-bold">My Account</h1>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Thẻ hồ sơ (chiếm 2 cột trên màn hình lớn) */}
                    <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
                                {initial}
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-gray-500">
                                    Welcome back
                                </p>
                                <p
                                    data-testid="account-email"
                                    className="truncate text-xl font-semibold"
                                >
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <hr className="my-6" />

                        <dl className="divide-y rounded-lg border text-sm">
                            <div className="flex justify-between gap-4 px-4 py-3">
                                <dt className="text-gray-500">Email</dt>
                                <dd className="truncate font-medium">
                                    {user.email}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4 px-4 py-3">
                                <dt className="text-gray-500">
                                    Account created
                                </dt>
                                <dd className="font-medium">
                                    {formatDate(user.created_at)}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4 px-4 py-3">
                                <dt className="text-gray-500">
                                    Last sign in
                                </dt>
                                <dd className="font-medium">
                                    {formatDate(user.last_sign_in_at)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {/* Thẻ thống kê + lối tắt */}
                    <aside className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                        <p className="text-sm text-gray-500">
                            Favorite products
                        </p>
                        <p className="mt-1 text-5xl font-bold">
                            {favoritesLoading ? "…" : favorites.length}
                        </p>

                        <div className="mt-8 flex flex-col gap-3">
                            <Link
                                href="/"
                                className={`${buttonVariants()} h-10! justify-center text-base!`}
                            >
                                Back to Store
                            </Link>

                            <Link
                                href="/favorites"
                                className={`${buttonVariants({
                                    variant: "outline",
                                })} h-10! justify-center border-gray-300! text-base!`}
                            >
                                View favorites
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}