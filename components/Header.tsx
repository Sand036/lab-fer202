"use client";

import { useContext } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";


const bigButton = "h-10! px-6! text-base!";
const authButtonWidth = "w-32! justify-center";
export default function Header() {
    const auth = useContext(AuthContext);
    const { favorites, favoritesLoading } = useFavorites();

    if (!auth) {
        throw new Error(
            "Header must be used inside AuthProvider"
        );
    }

    const { user, loading, signOut } = auth;

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <Link href="/" className="text-3xl font-bold">
                    My Store
                </Link>

                {/* Authentication area */}
                {!loading && (
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <Link
                                    href="/login"
                                    className={`${buttonVariants()} ${bigButton} ${authButtonWidth}`}
                                    data-testid="btn-login"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className={`${buttonVariants({
                                        variant: "outline",
                                    })} ${bigButton} ${authButtonWidth} border-black!`}
                                    data-testid="btn-register"
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/favorites"
                                    className={`${buttonVariants({
                                        variant: "outline",
                                    })} ${bigButton} border-gray-300!`}
                                    data-testid="link-favorites"
                                >
                                    Favorites (
                                    <span data-testid="favorites-count">
                                        {favoritesLoading
                                            ? "…"
                                            : favorites.length}
                                    </span>
                                    )
                                </Link>

                                <Link
                                    href="/account"
                                    data-testid="user-email"
                                    className="inline-flex h-10 items-center rounded-lg border border-gray-300 px-4 text-sm font-medium transition hover:bg-gray-100"
                                >
                                    {user.email}
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={`${buttonVariants()} ${bigButton} ${authButtonWidth}`}
                                    data-testid="btn-logout"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}