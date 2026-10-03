"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthContext } from "@/contexts/AuthContext";

export default function LoginPage() {
    const auth = useContext(AuthContext);

    const router = useRouter();

    if (!auth) {
        throw new Error(
            "LoginPage must be used inside AuthProvider"
        );
    }

    const { signIn } = auth;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [authError, setAuthError] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setEmailError("");
        setPasswordError("");
        setAuthError("");

        let isValid = true;

        // Email validation
        if (email.trim() === "") {
            setEmailError("Email is required");
            isValid = false;
        } else if (!email.includes("@")) {
            setEmailError(
                "Please enter a valid email address"
            );
            isValid = false;
        }

        // Password validation
        if (password.trim() === "") {
            setPasswordError("Password is required");
            isValid = false;
        }

        // Stop if client-side validation fails
        if (!isValid) {
            return;
        }

        // Real Supabase login
        const { error } = await signIn(
            email,
            password
        );

        // Supabase authentication error
        if (error) {
            setAuthError(error.message);
            return;
        }

        // Login successful
        router.replace("/");
    };

    return (
        <main className="login-page">
            <div className="login-container">
                <h1>Login</h1>

                <p>
                    Welcome back! Please login to your account.
                </p>

                <form
                    data-testid="login-form"
                    noValidate
                    onSubmit={handleSubmit}
                >
                    {/* Email */}
                    <div className="form-group">
                        <Label htmlFor="email">
                            Email
                        </Label>

                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            data-testid="login-email"
                            onChange={(e) => {
                                setEmail(e.target.value);

                                if (
                                    e.target.value.trim() !== "" &&
                                    e.target.value.includes("@")
                                ) {
                                    setEmailError("");
                                }
                            }}
                        />

                        {emailError && (
                            <p
                                data-testid="error-email"
                                className="mt-1 text-sm text-red-500"
                            >
                                {emailError}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <Label htmlFor="password">
                            Password
                        </Label>

                        <Input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={password}
                            data-testid="login-password"
                            onChange={(e) => {
                                setPassword(e.target.value);

                                if (
                                    e.target.value.trim() !== ""
                                ) {
                                    setPasswordError("");
                                }
                            }}
                        />

                        {passwordError && (
                            <p
                                data-testid="error-password"
                                className="mt-1 text-sm text-red-500"
                            >
                                {passwordError}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        data-testid="login-submit"
                    >
                        Login
                    </Button>

                    {/* Supabase error */}
                    {authError && (
                        <p
                            data-testid="error-auth"
                            className="mt-4 text-center text-sm text-red-500"
                        >
                            {authError}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}