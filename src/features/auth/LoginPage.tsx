'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import AuthShell from "./AuthShell";
import { AuthError, AuthField, PasswordField, SubmitButton } from "./AuthFields";
import { useAuth } from "./AuthContext";
import VerifyEmailStep from "./VerifyEmailStep";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
    const { login, user, ready } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const redirect = params.get("redirect") || "/account";
    const justReset = params.get("reset") === "1";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // set when the account exists but was never verified — swaps in the OTP screen
    const [needsVerify, setNeedsVerify] = useState(false);

    // already signed in → bounce to redirect target
    useEffect(() => {
        if (ready && user) router.replace(redirect);
    }, [ready, user, redirect, router]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await login(email, password);
            router.replace(redirect);
        } catch (err: unknown) {
            if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
                // the backend has already emailed a fresh code
                setNeedsVerify(true);
                return;
            }
            setError((err instanceof Error && err.message) || "Login failed. Check your email and password.");
        } finally {
            setBusy(false);
        }
    };

    if (needsVerify) {
        return (
            <VerifyEmailStep
                email={email}
                password={password}
                redirect={redirect}
                eyebrow="Verify your email"
                notice="Your account isn't verified yet. We've just emailed you a new code."
                onBack={() => { setNeedsVerify(false); setPassword(""); }}
                backLabel="Back to sign in"
            />
        );
    }

    return (
        <AuthShell
            eyebrow="Sign in"
            title="Welcome back"
            subtitle="Sign in to track orders, reorder parts and check out faster."
            footer={
                <>
                    New to Genesis?{" "}
                    <Link href={`/account/register?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-brand-ink underline-offset-4 hover:underline">
                        Create an account
                    </Link>
                </>
            }
        >
            <form onSubmit={submit}>
                {justReset && !error && (
                    <div className="mb-5 rounded-xl border border-[#cfe9dc] bg-stock-wash px-3.5 py-3 text-[13px] text-stock">
                        Password updated. Sign in with your new password.
                    </div>
                )}
                {error && <AuthError>{error}</AuthError>}
                <div className="space-y-5">
                    <AuthField id="email" label="Email address" icon={Mail} type="email" required autoComplete="email"
                        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                    <div>
                        <PasswordField id="password" label="Password" icon={Lock} required autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                        <div className="mt-2 flex justify-end">
                            <Link href={`/account/forgot?redirect=${encodeURIComponent(redirect)}`} className="text-[12.5px] font-semibold text-brand-ink underline-offset-4 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-7">
                    <SubmitButton busy={busy} busyLabel="Signing in…">
                        Sign in <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                    </SubmitButton>
                </div>
            </form>
        </AuthShell>
    );
}
