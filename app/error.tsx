"use client";

import { useEffect } from "react";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
    // Ghi lỗi ra console để dễ debug
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="container mx-auto max-w-4xl px-4 py-10">
            <div
                data-testid="error-boundary"
                className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6"
            >
                <h2 className="text-2xl font-bold text-red-700">
                    Something went wrong
                </h2>

                <p className="text-gray-600">
                    An unexpected error occurred. Please try again.
                </p>

                <button
                    type="button"
                    onClick={() => reset()}
                    data-testid="btn-retry"
                    className="rounded-md border px-4 py-2 hover:bg-white"
                >
                    Try again
                </button>
            </div>
        </main>
    );
}