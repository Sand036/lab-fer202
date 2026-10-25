"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import type { Review } from "@/lib/reviews";

// Các cột lấy về khi sửa review
const REVIEW_COLUMNS =
    "id, user_id, product_id, rating, comment, author, created_at";

// Các hành động mà reducer xử lý
type Action =
    | { type: "SET"; payload: Review[] } // nạp toàn bộ danh sách
    | { type: "ADD"; payload: Review } // thêm một review
    | { type: "UPDATE"; payload: Review } // thay một review theo id
    | { type: "REMOVE"; payload: number }; // xóa một review theo id

type SubmitResult = { error: string | null };

type ReviewsContextType = {
    reviews: Review[];
    myReview: Review | null;
    submitReview: (rating: number, comment: string) => Promise<SubmitResult>;
    updateReview: (rating: number, comment: string) => Promise<SubmitResult>;
    deleteReview: () => Promise<SubmitResult>;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(
    undefined
);

// Mới nhất trước (cùng thời điểm thì id lớn hơn trước)
function sortNewestFirst(list: Review[]): Review[] {
    return [...list].sort((a, b) => {
        const diff =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return diff !== 0 ? diff : b.id - a.id;
    });
}

function reviewsReducer(state: Review[], action: Action): Review[] {
    switch (action.type) {
        case "SET":
            return sortNewestFirst(action.payload);
        case "ADD":
            // Tránh trùng id, rồi xếp lại mới nhất trước
            return sortNewestFirst([
                action.payload,
                ...state.filter((item) => item.id !== action.payload.id),
            ]);
        case "UPDATE":
            return state.map((item) =>
                item.id === action.payload.id ? action.payload : item
            );
        case "REMOVE":
            return state.filter((item) => item.id !== action.payload);
        default:
            return state;
    }
}

type ReviewsProviderProps = {
    productId: number;
    initialReviews: Review[]; // dữ liệu đọc ở server, truyền xuống qua props
    children: ReactNode;
};

export function ReviewsProvider({
    productId,
    initialReviews,
    children,
}: ReviewsProviderProps) {
    const router = useRouter();
    const { user } = useAuth();

    // Trạng thái đầu lấy từ dữ liệu server
    const [reviews, dispatch] = useReducer(
        reviewsReducer,
        initialReviews,
        (initial) => sortNewestFirst(initial)
    );

    // Trang chi tiết là trang tĩnh nên có thể cũ (sau khi sửa/xóa).
    // Khi hiện ra, nạp lại danh sách mới nhất từ API đọc.
    useEffect(() => {
        let active = true;

        fetch(`/api/products/${productId}/reviews`, { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (active && data && Array.isArray(data.reviews)) {
                    dispatch({ type: "SET", payload: data.reviews as Review[] });
                }
            })
            .catch(() => {
                // Lỗi mạng: giữ nguyên dữ liệu từ server
            });

        return () => {
            active = false;
        };
    }, [productId]);

    // Review của người đang đăng nhập (nếu có)
    const myReview = useMemo(
        () =>
            user ? reviews.find((item) => item.user_id === user.id) ?? null : null,
        [reviews, user]
    );

    // Gửi review mới qua API (có kiểm tra token, zod và RLS ở server)
    const submitReview = useCallback(
        async (rating: number, comment: string): Promise<SubmitResult> => {
            if (!user) {
                return { error: "You must be logged in to review" };
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                return { error: "You must be logged in to review" };
            }

            let res: Response;
            try {
                res = await fetch("/api/reviews", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ product_id: productId, rating, comment }),
                });
            } catch {
                return { error: "Network error. Please try again." };
            }

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                return { error: data?.error ?? "Failed to submit review" };
            }

            // API không trả user_id, nên bổ sung từ người dùng hiện tại
            dispatch({
                type: "ADD",
                payload: { ...(data as Review), user_id: user.id },
            });

            // Yêu cầu server render lại trang
            router.refresh();

            return { error: null };
        },
        [productId, router, user]
    );

    // Sửa review của chính mình (RLS chỉ cho sửa dòng của mình)
    const updateReview = useCallback(
        async (rating: number, comment: string): Promise<SubmitResult> => {
            if (!user || !myReview) {
                return { error: "No review to update" };
            }

            const { data, error } = await supabase
                .from("reviews")
                .update({ rating, comment })
                .eq("id", myReview.id)
                .select(REVIEW_COLUMNS)
                .single();

            if (error) {
                return { error: error.message };
            }

            dispatch({ type: "UPDATE", payload: data as Review });
            return { error: null };
        },
        [myReview, user]
    );

    // Xóa review của chính mình, kiểu lạc quan: bỏ khỏi giao diện trước,
    // nếu Supabase báo lỗi thì thêm lại (rollback)
    const deleteReview = useCallback(async (): Promise<SubmitResult> => {
        if (!user || !myReview) {
            return { error: "No review to delete" };
        }

        const target = myReview;

        dispatch({ type: "REMOVE", payload: target.id });

        const { error } = await supabase
            .from("reviews")
            .delete()
            .eq("id", target.id)
            .eq("user_id", user.id);

        if (error) {
            dispatch({ type: "ADD", payload: target }); // hoàn tác
            return { error: error.message };
        }

        return { error: null };
    }, [myReview, user]);

    return (
        <ReviewsContext.Provider
            value={{ reviews, myReview, submitReview, updateReview, deleteReview }}
        >
            {children}
        </ReviewsContext.Provider>
    );
}

// Hook tiện dụng cho các component trong khu vực đánh giá
export function useReviews() {
    const context = useContext(ReviewsContext);
    if (!context) {
        throw new Error("useReviews must be used within ReviewsProvider");
    }
    return context;
}