
import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
    const category =
        searchParams.get("category")?.trim().toLowerCase() ?? "";

    let filteredProducts = products;

    if (q) {
        filteredProducts = filteredProducts.filter(
            (product) =>
                product.name.toLowerCase().includes(q) ||
                product.description.toLowerCase().includes(q)
        );
    }

    if (category) {
        filteredProducts = filteredProducts.filter(
            (product) => product.category.toLowerCase() === category
        );
    }

    return NextResponse.json(filteredProducts);
}