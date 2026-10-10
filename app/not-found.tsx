import Link from "next/link";
export default function NotFound() {
    return (
        <main
            data-testid="not-found"
            className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
        >
            <h1 className="text-4xl font-bold">404 - Page Not Found</h1>

            <p className="mt-4 text-gray-600">
                Sorry, the product you are looking for does not exist.
            </p>

            <Link
                href="/"
                className="mt-6 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
                Back to Store
            </Link>
        </main>
    );
}