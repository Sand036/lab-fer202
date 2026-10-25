import { createClient } from "@supabase/supabase-js";

// Một dòng trong bảng reviews
export type Review = {
    id: number;
    user_id: string;
    product_id: number;
    rating: number;
    comment: string;
    author: string;
    created_at: string;
};

// Kết quả tổng hợp trả về cho API và trang chi tiết
export type ReviewSummary = {
    average: number;
    count: number;
    reviews: Review[];
};

const REVIEW_COLUMNS =
    "id, user_id, product_id, rating, comment, author, created_at";

// Client Supabase dùng anon key, không lưu phiên (chạy ở phía server)
export function createAnonClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

// Tính điểm trung bình (làm tròn 1 chữ số thập phân) và số lượng
export function summarizeReviews(reviews: Review[]): ReviewSummary {
    const count = reviews.length;

    if (count === 0) {
        return { average: 0, count: 0, reviews };
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = Math.round((total / count) * 10) / 10;

    return { average, count, reviews };
}

// Lấy toàn bộ đánh giá của một sản phẩm, mới nhất trước
export async function getProductReviews(
    productId: number
): Promise<ReviewSummary> {
    const supabase = createAnonClient();

    const { data, error } = await supabase
        .from("reviews")
        .select(REVIEW_COLUMNS)
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

    if (error) {
        throw new Error(`Failed to load reviews: ${error.message}`);
    }

    return summarizeReviews((data ?? []) as Review[]);
}

// Client Supabase mang token của người dùng -> RLS áp dụng theo đúng người đó.
// Dùng để ghi dữ liệu. TUYỆT ĐỐI không dùng service_role.
export function createUserClient(token: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
    });
}