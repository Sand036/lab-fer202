import { z } from "zod";

// Schema DUY NHẤT cho đánh giá sản phẩm.
// Được import ở cả API route (server) và form đánh giá (client).
export const reviewSchema = z.object({
    // Mã sản phẩm: số nguyên dương
    product_id: z
        .number({ error: "Product is required" })
        .int("Product id must be an integer")
        .positive("Product id must be positive"),

    // Số sao: số nguyên từ 1 đến 5
    rating: z
        .number({ error: "Please select a rating" })
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),

    // Nội dung: cắt khoảng trắng hai đầu, dài 1 đến 500 ký tự
    comment: z
        .string({ error: "Comment is required" })
        .trim()
        .min(1, "Comment is required")
        .max(500, "Comment must be at most 500 characters"),
});

// Kiểu dữ liệu suy ra từ schema, dùng cho form và API
export type ReviewInput = z.infer<typeof reviewSchema>;