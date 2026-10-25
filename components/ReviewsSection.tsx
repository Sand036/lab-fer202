"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { summarizeReviews } from "@/lib/reviews";
import { reviewSchema, type ReviewInput } from "@/lib/reviewSchema";

// Định dạng ngày cố định (UTC) để HTML server và client luôn giống nhau
function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

type EditReviewFormProps = {
    productId: number;
    initialRating: number;
    initialComment: string;
    onDone: () => void;
};

// Form sửa review của chính mình (dùng test ID riêng, khác form tạo mới)
function EditReviewForm({
    productId,
    initialRating,
    initialComment,
    onDone,
}: EditReviewFormProps) {
    const { updateReview } = useReviews();
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ReviewInput>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            product_id: productId,
            rating: initialRating,
            comment: initialComment,
        },
    });

    const onSubmit = async (values: ReviewInput) => {
        setServerError("");

        const { error } = await updateReview(values.rating, values.comment);

        if (error) {
            setServerError(error);
            return;
        }

        onDone();
    };

    return (
        <form
            data-testid="edit-review-form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="mt-3 space-y-4"
        >
            <div className="space-y-1.5">
                <label htmlFor="edit-rating" className="text-sm font-medium">
                    Rating
                </label>

                <select
                    id="edit-rating"
                    data-testid="input-edit-rating"
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
                        data-testid="error-edit-rating"
                        className="text-sm text-red-500"
                    >
                        {errors.rating.message}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="edit-comment" className="text-sm font-medium">
                    Comment
                </label>

                <textarea
                    id="edit-comment"
                    data-testid="input-edit-comment"
                    rows={4}
                    className="w-full rounded-md border px-3 py-2"
                    {...register("comment")}
                />

                {errors.comment && (
                    <p
                        data-testid="error-edit-comment"
                        className="text-sm text-red-500"
                    >
                        {errors.comment.message}
                    </p>
                )}
            </div>

            <div className="flex gap-3">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="btn-save-review"
                    className="h-10! px-5!"
                >
                    {isSubmitting ? "Saving..." : "Save"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onDone}
                    data-testid="btn-cancel-edit"
                    className="h-10! px-5!"
                >
                    Cancel
                </Button>
            </div>

            {serverError && (
                <p
                    data-testid="error-edit-review"
                    className="text-sm text-red-500"
                >
                    {serverError}
                </p>
            )}
        </form>
    );
}

type ReviewsSectionProps = {
    productId: number;
};

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
    const { user, loading } = useAuth();
    const { reviews, myReview, deleteReview } = useReviews();

    const [editing, setEditing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [actionError, setActionError] = useState("");

    // Điểm trung bình và số lượng tính từ danh sách trong context
    const { average, count } = summarizeReviews(reviews);

    // Xóa kiểu lạc quan (logic nằm trong ReviewsContext)
    const handleDelete = async () => {
        setActionError("");
        setSuccess(false);
        setEditing(false);

        const { error } = await deleteReview();

        if (error) {
            setActionError(error);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Tóm tắt: điểm trung bình và số lượng */}
            <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Average rating</p>

                <div className="mt-2 flex items-center gap-4">
                    {/* Chỉ chứa số thuần để script đọc được */}
                    <span
                        data-testid="rating-average"
                        className="text-5xl font-bold"
                    >
                        {average}
                    </span>

                    <div>
                        <StarRating value={average} className="text-xl" />
                        <p className="text-sm text-gray-500">out of 5</p>
                    </div>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                    <span data-testid="review-count" className="font-semibold">
                        {count}
                    </span>{" "}
                    {count === 1 ? "review" : "reviews"}
                </p>
            </aside>

            <div className="lg:col-span-2">
                {/* Khu vực hành động theo trạng thái đăng nhập */}
                {loading ? null : !user ? (
                    <p className="mb-6 rounded-2xl border bg-gray-50 px-6 py-4 text-sm text-gray-600">
                        <Link
                            href="/login"
                            data-testid="link-login-to-review"
                            className="font-semibold text-black underline"
                        >
                            Log in to write a review
                        </Link>
                    </p>
                ) : !myReview ? (
                    <ReviewForm
                        productId={productId}
                        onSuccess={() => setSuccess(true)}
                    />
                ) : null}

                {/* Thông báo thành công nằm ngoài form (form biến mất sau khi gửi) */}
                {success && (
                    <p
                        data-testid="review-success"
                        className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm text-green-700"
                    >
                        Thank you! Your review was submitted.
                    </p>
                )}

                {actionError && (
                    <p
                        data-testid="error-review-action"
                        className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600"
                    >
                        {actionError}
                    </p>
                )}

                {/* Danh sách đánh giá */}
                {count === 0 ? (
                    <p
                        data-testid="reviews-empty"
                        className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-500"
                    >
                        No reviews yet. Be the first to review this product.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {reviews.map((review) => {
                            const isMine = !!user && review.user_id === user.id;
                            const isEditing = isMine && editing;

                            return (
                                <li
                                    key={review.id}
                                    data-testid="review-item"
                                    className="rounded-2xl border bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span
                                                data-testid="review-author"
                                                className="font-semibold"
                                            >
                                                {review.author || "Anonymous"}
                                            </span>

                                            {isMine && (
                                                <span className="rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                                                    Your review
                                                </span>
                                            )}

                                            <span className="flex items-center gap-1.5 text-sm">
                                                <StarRating
                                                    value={review.rating}
                                                />
                                                <span>
                                                    <span
                                                        data-testid="review-rating"
                                                        className="font-medium"
                                                    >
                                                        {review.rating}
                                                    </span>
                                                    /5
                                                </span>
                                            </span>
                                        </div>

                                        <time
                                            dateTime={review.created_at}
                                            className="text-xs text-gray-500"
                                        >
                                            {formatDate(review.created_at)}
                                        </time>
                                    </div>

                                    {isEditing ? (
                                        <EditReviewForm
                                            productId={productId}
                                            initialRating={review.rating}
                                            initialComment={review.comment}
                                            onDone={() => setEditing(false)}
                                        />
                                    ) : (
                                        <p
                                            data-testid="review-comment"
                                            className="mt-3 whitespace-pre-wrap break-words leading-7 text-gray-700"
                                        >
                                            {review.comment}
                                        </p>
                                    )}

                                    {/* Chỉ hiện trên review của chính mình */}
                                    {isMine && !isEditing && (
                                        <div className="mt-4 flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                data-testid="btn-edit-review"
                                                className="h-9! px-4!"
                                                onClick={() => {
                                                    setActionError("");
                                                    setSuccess(false);
                                                    setEditing(true);
                                                }}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                data-testid="btn-delete-review"
                                                className="h-9! border-red-300! px-4! text-red-600!"
                                                onClick={handleDelete}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}