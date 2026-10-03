"use client";

import {
    createContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;

    signUp: (
        email: string,
        password: string
    ) => Promise<{
        error: Error | null;
    }>;

    signIn: (
        email: string,
        password: string
    ) => Promise<{
        error: Error | null;
    }>;

    signOut: () => Promise<{
        error: Error | null;
    }>;
};

export const AuthContext = createContext<
    AuthContextType | undefined
>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] =
        useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get current session when the app starts
        const getInitialSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getInitialSession();

        // Listen for authentication changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        // Clean up listener
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (
        email: string,
        password: string
    ) => {
        const { error } =
            await supabase.auth.signUp({
                email,
                password,
            });

        return { error };
    };

    const signIn = async (
        email: string,
        password: string
    ) => {
        const { error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        return { error };
    };

    const signOut = async () => {
        const { error } =
            await supabase.auth.signOut();

        return { error };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signUp,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}