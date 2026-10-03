"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthContext } from "@/contexts/AuthContext";

export default function AccountPage() {
    const auth = useContext(AuthContext);
    const router = useRouter();

    if (!auth) {
        throw new Error(
            "AccountPage must be used inside AuthProvider"
        );
    }

    const { user, loading } = auth;

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    // Still checking authentication
    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">
                    Loading...
                </p>
            </main>
        );
    }

    // User is not authenticated
    if (!user) {
        return null;
    }

    // User is authenticated
    return (
        <main
            data-testid="account-page"
            className="min-h-screen bg-gray-50 px-4 py-10"
        >
            <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
                <h1 className="text-3xl font-bold">
                    My Account
                </h1>

                <p className="mt-4 text-gray-600">
                    Welcome to your account.
                </p>

                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500">
                        Email
                    </p>

                    <p
                        data-testid="account-email"
                        className="mt-1 text-lg font-semibold"
                    >
                        {user.email}
                    </p>
                </div>
            </div>
        </main>
    );
}