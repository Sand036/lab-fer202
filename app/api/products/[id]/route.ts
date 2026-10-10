
import { NextResponse } from "next/server";
import { products } from "@/data/products";

type ProductApiContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _request: Request,
    { params }: ProductApiContext
) {
    const { id } = await params;

    const product = products.find(
        (item) => item.id === Number(id)
    );

    if (!product) {
        return NextResponse.json(
            { error: "Not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(product);
}