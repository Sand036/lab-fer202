"use client";

import { useState, useContext } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthContext } from "@/contexts/AuthContext";

export default function RegisterPage() {
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error(
            "RegisterPage must be used inside AuthProvider"
        );
    }

    const { signUp } = auth;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] =
        useState("");
    const [confirmPasswordError, setConfirmPasswordError] =
        useState("");

    const [success, setSuccess] = useState("");
    const [authError, setAuthError] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setNameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setSuccess("");
        setAuthError("");

        let isValid = true;

        // Name validation
        if (name.trim() === "") {
            setNameError("Full name is required");
            isValid = false;
        }

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
        } else if (password.length < 6) {
            setPasswordError(
                "Password must be at least 6 characters"
            );
            isValid = false;
        }

        // Confirm password validation
        if (confirmPassword.trim() === "") {
            setConfirmPasswordError(
                "Confirm password is required"
            );
            isValid = false;
        } else if (confirmPassword !== password) {
            setConfirmPasswordError(
                "Passwords do not match"
            );
            isValid = false;
        }

        // Supabase registration
        if (isValid) {
            const { error } = await signUp(
                email,
                password
            );

            if (error) {
                setAuthError(error.message);
                return;
            }

            setSuccess("Registration successful");
        }
    };

    return (
        <main className="login-page">
            <div className="login-container">
                <h1>Register</h1>

                <p>
                    Create a new account to get started.
                </p>

                <form
                    data-testid="register-form"
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <Label htmlFor="name">
                            Full Name
                        </Label>

                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter your full name"
                            value={name}
                            data-testid="register-name"
                            onChange={(e) => {
                                setName(e.target.value);

                                if (
                                    e.target.value.trim() !== ""
                                ) {
                                    setNameError("");
                                }
                            }}
                        />

                        {nameError && (
                            <p
                                data-testid="error-name"
                                className="mt-1 text-sm text-red-500"
                            >
                                {nameError}
                            </p>
                        )}
                    </div>

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
                            data-testid="register-email"
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
                            data-testid="register-password"
                            onChange={(e) => {
                                setPassword(e.target.value);

                                if (
                                    e.target.value.trim() === ""
                                ) {
                                    return;
                                }

                                if (
                                    e.target.value.length >= 6
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

                    <div className="form-group">
                        <Label htmlFor="confirm-password">
                            Confirm Password
                        </Label>

                        <Input
                            type="password"
                            id="confirm-password"
                            name="confirm-password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            data-testid="register-confirm-password"
                            onChange={(e) => {
                                setConfirmPassword(
                                    e.target.value
                                );

                                if (
                                    e.target.value !== "" &&
                                    e.target.value === password
                                ) {
                                    setConfirmPasswordError("");
                                }
                            }}
                        />

                        {confirmPasswordError && (
                            <p
                                data-testid="error-confirm-password"
                                className="mt-1 text-sm text-red-500"
                            >
                                {confirmPasswordError}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        data-testid="register-submit"
                    >
                        Register
                    </Button>

                    {authError && (
                        <p
                            data-testid="error-auth"
                            className="mt-4 text-center text-sm text-red-500"
                        >
                            {authError}
                        </p>
                    )}

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