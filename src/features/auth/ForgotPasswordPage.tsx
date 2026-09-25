'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, KeyRound, Lock, Mail } from "lucide-react";
import AuthShell from "./AuthShell";
import { AuthError, AuthField, OtpInput, PasswordField, SubmitButton } from "./AuthFields";
import { useAuth } from "./AuthContext";
import { authApi } from "@/lib/api";

// Mirrors ResetPasswordDto in the API gateway — keep in sync.
const RULES: { label: string; test: (pw: string) => boolean }[] = [
    { label: "8–32 characters", test: (pw) => pw.length >= 8 && pw.length <= 32 },
    { label: "An uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "A lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "A number", test: (pw) => /\d/.test(pw) },
    { label: "A symbol: @ $ ! % * ? &", test: (pw) => /[@$!%*?&]/.test(pw) },
];

const msg = (err: unknown, fallback: string) => (err instanceof Error && err.message) || fallback;

export default function ForgotPasswordPage() {
    const { login } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const redirect = params.get("redirect") || "/account";

    const [step, setStep] = useState<"email" | "reset">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);

    const rulesMet = RULES.every((r) => r.test(password));
    const matches = confirm.length > 0 && confirm === password;

    const requestCode = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setBusy(true); setError(null);
        try {
            await authApi.forgotPassword(email.trim());
            // same message whether or not the account exists (the API doesn't say)
            setNote(`If an account exists for ${email.trim()}, we've emailed it a 6-digit code.`);
            setCode("");
            setStep("reset");
        } catch (err) {
            setError(msg(err, "Couldn't send the code. Please try again."));
        } finally { setBusy(false); }
    };

    const reset = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true); setError(null);
        try {
            await authApi.resetPassword({ email: email.trim(), code, newPassword: password, confirmPassword: confirm });
        } catch (err) {
            setError(msg(err, "Invalid or expired code."));
            setBusy(false);
            return;
        }
        // password changed — sign straight in; otherwise send them to the login page
        try {
            await login(email.trim(), password);
            router.replace(redirect);
        } catch {
            router.replace(`/account/login?reset=1&redirect=${encodeURIComponent(redirect)}`);
        }
    };

    const backToLogin = (
        <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} className="inline-flex items-center gap-1.5 font-semibold text-mutedink transition hover:text-carbon">
            <ArrowLeft size={15} /> Back to sign in
        </Link>
    );

    if (step === "email") {
        return (
            <AuthShell
                eyebrow="Account recovery"
                title="Forgot your password?"
                subtitle="Enter the email you signed up with and we'll send you a code to reset it."
                footer={backToLogin}
            >
                <form onSubmit={requestCode}>
                    {error && <AuthError>{error}</AuthError>}
                    <AuthField id="email" label="Email address" icon={Mail} type="email" required autoComplete="email" autoFocus
                        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                    <div className="mt-7">
                        <SubmitButton busy={busy} busyLabel="Sending code…">
                            Send reset code <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                        </SubmitButton>
                    </div>
                </form>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            eyebrow="Account recovery"
            title="Set a new password"
            subtitle={<>Enter the code we sent to <span className="font-semibold text-carbon">{email.trim()}</span> and choose a new password.</>}
            footer={
                <button type="button" onClick={() => { setStep("email"); setError(null); }}
                    className="inline-flex items-center gap-1.5 font-semibold text-mutedink transition hover:text-carbon">
                    <ArrowLeft size={15} /> Use a different email
                </button>
            }
        >
            <form onSubmit={reset}>
                {error && <AuthError>{error}</AuthError>}
                {note && !error && (
                    <div className="mb-5 rounded-xl border border-[#cfe9dc] bg-stock-wash px-3.5 py-3 text-[13px] text-stock">{note}</div>
                )}

                <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-carbon"><KeyRound size={15} className="text-brand" /> 6-digit code</p>
                <OtpInput value={code} onChange={setCode} />
                <p className="mt-2 text-right text-[12.5px] text-mutedink">
                    Didn&apos;t get it?{" "}
                    <button type="button" onClick={() => requestCode()} disabled={busy} className="font-semibold text-brand-ink underline-offset-4 hover:underline disabled:opacity-50">
                        Resend code
                    </button>
                </p>

                <div className="mt-5 space-y-5">
                    <div>
                        <PasswordField id="new-password" label="New password" icon={Lock} required autoComplete="new-password"
                            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a new password" />
                        <ul className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2" aria-live="polite">
                            {RULES.map((r) => {
                                const ok = r.test(password);
                                return (
                                    <li key={r.label} className={`flex items-center gap-1.5 text-[12px] ${ok ? "text-stock" : "text-faint"}`}>
                                        <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${ok ? "bg-stock text-white" : "border border-line-strong"}`}>
                                            {ok && <Check size={9} strokeWidth={3.5} />}
                                        </span>
                                        {r.label}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <PasswordField id="confirm-password" label="Confirm new password" icon={Lock} required autoComplete="new-password"
                            value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" />
                        {confirm.length > 0 && !matches && <p className="mt-1.5 text-[12px] text-[#b23b32]">Passwords don&apos;t match yet.</p>}
                    </div>
                </div>

                <div className="mt-7">
                    <SubmitButton busy={busy} disabled={code.length < 6 || !rulesMet || !matches} busyLabel="Updating password…">
                        Reset password &amp; sign in
                    </SubmitButton>
                </div>
            </form>
        </AuthShell>
    );
}
