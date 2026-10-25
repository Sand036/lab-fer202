type StarRatingProps = {
    value: number;
    className?: string;
};

// Vẽ tối đa 5 ngôi sao theo điểm (làm tròn). Chỉ để trang trí, nên ẩn khỏi trình đọc màn hình.
export default function StarRating({
    value,
    className = "",
}: StarRatingProps) {
    const filled = Math.max(0, Math.min(5, Math.round(value)));

    return (
        <span
            aria-hidden="true"
            className={`tracking-wider text-amber-500 ${className}`}
        >
            {"★".repeat(filled)}
            <span className="text-gray-300">
                {"★".repeat(5 - filled)}
            </span>
        </span>
    );
}