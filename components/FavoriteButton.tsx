"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";

type FavoriteButtonProps = {
    productId: number;
    className?: string;
};

export default function FavoriteButton({
    productId,
    className = "",
}: FavoriteButtonProps) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();

    // Chỉ coi là yêu thích khi đã đăng nhập
    const active = !!user && isFavorite(productId);

    async function handleClick(e: MouseEvent<HTMLButtonElement>) {
        // Chặn việc click lan ra thẻ <Link> bao quanh (nếu có)
        e.preventDefault();
        e.stopPropagation();

        // Chưa biết trạng thái đăng nhập -> chưa làm gì
        if (loading) return;

        // Chưa đăng nhập -> chuyển sang trang đăng nhập
        if (!user) {
            router.push("/login");
            return;
        }

        await toggleFavorite(productId);
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            data-testid="btn-favorite"
            aria-pressed={active ? "true" : "false"}
            aria-label={active ? "Remove from favorites" : "Add to favorites"}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow-sm transition hover:scale-110 ${className}`}
        >
            <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 ${active ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-500"
                    }`}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );
}