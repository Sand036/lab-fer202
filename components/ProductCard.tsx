import Link from "next/link"; // MỚI
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import FavoriteButton from "@/components/FavoriteButton";

type Product = {
    id: number;
    name: string;
    image: string;
    description: string;
    price: number;
};

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Card
            data-testid="product-card"
            className="relative cursor-pointer overflow-hidden transition hover:shadow-md" // MỚI: hiệu ứng khi rê chuột
        >
            {/* Nút tim nằm trên lớp phủ của link (z-10) nên vẫn bấm được */}
            <FavoriteButton
                productId={product.id}
                className="absolute right-3 top-3 z-10"
            />

            <img
                src={product.image}
                alt={product.name}
                data-testid="product-image"
                className="w-full h-56 object-contain bg-gray-100"
            />

            <CardHeader>
                <CardTitle data-testid="product-name">
                    {/* MỚI: ::after phủ kín thẻ để cả thẻ bấm được */}
                    <Link
                        href={`/products/${product.id}`}
                        data-testid="link-detail"
                        className="after:absolute after:inset-0 after:content-['']"
                    >
                        {product.name}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <p
                    data-testid="product-description"
                    className="text-gray-600"
                >
                    {product.description}
                </p>

                <p
                    data-testid="product-price"
                    className="mt-4 text-xl font-bold"
                >
                    ${product.price.toFixed(2)}
                </p>
            </CardContent>
        </Card>
    );
}