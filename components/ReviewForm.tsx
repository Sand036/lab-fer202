"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { useReviews } from "@/contexts/ReviewsContext";
import { reviewSchema, type ReviewInput } from "@/lib/reviewSchema";

type ReviewFormProps = {
    productId: number;
    onSuccess: () => void;
};

// Form viết đánh giá mới: react-hook-form + schema zod DÙNG CHUNG với API
export default function ReviewForm({
    productId,
    onSuccess,
}: ReviewFormProps) {
    const { submitReview } = useReviews();
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ReviewInput>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { product_id: productId, comment: "" },
    });

    const onSubmit = async (values: ReviewInput) => {
        setServerError("");

        const { error } = await submitReview(values.rating, values.comment);

        if (error) {
            // Ví dụ lỗi 409: "You already reviewed this product"
            setServerError(error);
            return;
        }

        onSuccess();
    };

    return (
        <form
            data-testid="review-form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="mb-6 space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
        >
            <h3 className="text-lg font-semibold">Write a review</h3>

            {/* Số sao */}
            <div className="space-y-1.5">
                <label htmlFor="review-rating" className="text-sm font-medium">
                    Rating
                </label>

                <select
                    id="review-rating"
                    data-testid="input-rating"
                    defaultValue=""
                    className="h-11 w-full rounded-md border bg-white px-3"
                    {...register("rating", { valueAsNumber: true })}
                >
                    <option value="">Select a rating</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                </select>

                {errors.rating && (
                    <p
                        data-testid="error-rating"
                        className="text-sm text-red-500"
                    >
                        {errors.rating.message}
                    </p>
                )}
            </div>

            {/* Nội dung */}
            <div className="space-y-1.5">
                <label htmlFor="review-comment" className="text-sm font-medium">
                    Comment
                </label>

                <textarea
                    id="review-comment"
                    data-testid="input-comment"
                    rows={4}
                    placeholder="Share your experience with this product"
                    className="w-full rounded-md border px-3 py-2"
                    {...register("comment")}
                />

                {errors.comment && (
                    <p
                        data-testid="error-comment"
                        className="text-sm text-red-500"
                    >
                        {errors.comment.message}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="btn-submit-review"
                className="h-11! px-6! text-base!"
            >
                {isSubmitting ? "Submitting..." : "Submit review"}
            </Button>

            {/* Lỗi từ server (ví dụ 409) */}
            {serverError && (
                <p
                    data-testid="error-review"
                    className="text-sm text-red-500"
                >
                    {serverError}
                </p>
            )}
        </form>
    );
}