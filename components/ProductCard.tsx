import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
            className="overflow-hidden"
        >
            <img
                src={product.image}
                alt={product.name}
                data-testid="product-image"
                className="w-full h-56 object-contain bg-gray-100"
            />

            <CardHeader>
                <CardTitle data-testid="product-name">
                    {product.name}
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