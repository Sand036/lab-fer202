"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setEmailError("");
        setPasswordError("");
        setSuccess("");

        let isValid = true;

        // Validate email
        if (email.trim() === "") {
            setEmailError("Email is required");
            isValid = false;
        } else if (!email.includes("@")) {
            setEmailError("Please enter a valid email address");
            isValid = false;
        }

        // Validate password
        if (password.trim() === "") {
            setPasswordError("Password is required");
            isValid = false;
        }

        if (isValid) {
            setSuccess("Login successful (demo)");
        }
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

                                if (e.target.value.trim() !== "") {
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

                    <Button
                        type="submit"
                        className="w-full"
                        data-testid="login-submit"
                    >
                        Login
                    </Button>

                    {success && (
                        <p
                            data-testid="form-success"
                            className="mt-4 text-center text-sm text-green-600"
                        >
                            {success}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}