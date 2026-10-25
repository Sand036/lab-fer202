import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { getProductReviews } from "@/lib/reviews";

// Luôn đọc dữ liệu mới từ database, không cache kết quả
export const dynamic = "force-dynamic";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
    const { id } = await params;

    // Tìm sản phẩm; id không phải số nguyên hoặc không có trong danh sách -> 404
    const productId = Number(id);
    const product = Number.isInteger(productId)
        ? products.find((item) => item.id === productId)
        : undefined;

    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
        const summary = await getProductReviews(product.id);
        return NextResponse.json(summary, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to load reviews" },
            { status: 500 }
        );
    }
}