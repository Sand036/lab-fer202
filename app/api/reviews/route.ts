import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { products } from "@/data/products";
import { reviewSchema } from "@/lib/reviewSchema";
import { createAnonClient, createUserClient } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// Lấy token từ header "Authorization: Bearer <token>"
function getBearerToken(request: Request): string | null {
    const header = request.headers.get("authorization");
    if (!header) return null;

    const match = header.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
}

function unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
    // 1. Xác thực: phải có token và Supabase phải chấp nhận token đó
    const token = getBearerToken(request);
    if (!token) {
        return unauthorized();
    }

    const { data: userData, error: authError } =
        await createAnonClient().auth.getUser(token);

    if (authError || !userData.user) {
        return unauthorized();
    }

    // 2. Đọc body: nếu không phải JSON -> 400
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {
                error: "Invalid input",
                issues: [{ path: [], message: "Request body must be valid JSON" }],
            },
            { status: 400 }
        );
    }

    // 3. Kiểm tra dữ liệu bằng schema zod dùng chung với form
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {
                error: "Invalid input",
                issues: parsed.error.issues.map((issue) => ({
                    path: issue.path.map(String),
                    message: issue.message,
                })),
            },
            { status: 400 }
        );
    }

    const { product_id, rating, comment } = parsed.data;

    // 4. Sản phẩm phải tồn tại
    const productExists = products.some((item) => item.id === product_id);
    if (!productExists) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 5. Ghi vào database bằng client mang token của user (RLS áp dụng).
    //    Chỉ gửi 3 trường; user_id và author do database tự điền.
    const supabase = createUserClient(token);

    const { data, error } = await supabase
        .from("reviews")
        .insert({ product_id, rating, comment })
        .select("id, product_id, rating, comment, author, created_at")
        .single();

    if (error) {
        // 23505 = vi phạm UNIQUE (user_id, product_id): đã đánh giá rồi
        if (error.code === "23505") {
            return NextResponse.json(
                { error: "You already reviewed this product" },
                { status: 409 }
            );
        }

        console.error("Failed to insert review:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }

    // 6. Làm mới trang chi tiết đã được dựng sẵn
    revalidatePath(`/products/${product_id}`);

    return NextResponse.json(data, { status: 201 });
}