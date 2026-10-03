"use client";

import { useContext } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { AuthContext } from "@/contexts/AuthContext";

export default function Header() {
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error(
            "Header must be used inside AuthProvider"
        );
    }

    const { user, loading, signOut } = auth;

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                {/* Logo / Store name */}
                <h1 className="text-2xl font-bold">
                    My Store
                </h1>

                {/* Authentication area */}
                {!loading && (
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <Link
                                    href="/login"
                                    className={buttonVariants()}
                                    data-testid="btn-login"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className={buttonVariants({
                                        variant: "outline",
                                    })}
                                    data-testid="btn-register"
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <span
                                    data-testid="user-email"
                                    className="text-sm font-medium"
                                >
                                    {user.email}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={buttonVariants({
                                        variant: "outline",
                                    })}
                                    data-testid="btn-logout"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}