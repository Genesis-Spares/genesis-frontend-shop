'use client'

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, Phone } from "lucide-react";
import AuthShell from "./AuthShell";
import { AuthError, AuthField, PasswordField, PasswordStrength, SubmitButton } from "./AuthFields";
import { useAuth } from "./AuthContext";
import VerifyEmailStep from "./VerifyEmailStep";

export default function RegisterPage() {
    const { register } = useAuth();
    const params = useSearchParams();
    const redirect = params.get("redirect") || "/account";

    const [step, setStep] = useState<"form" | "verify">("form");
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true); setError(null);
        try {
            await register(form);
            setStep("verify");
        } catch (err: unknown) {
            setError((err instanceof Error && err.message) || "Registration failed.");
        } finally { setBusy(false); }
    };

    if (step === "verify") {
        return (
            <VerifyEmailStep
                email={form.email}
                password={form.password}
                redirect={redirect}
                eyebrow="Step 2 of 2"
                onBack={() => setStep("form")}
                backLabel="Use a different email"
            />
        );
    }

    return (
        <AuthShell
            eyebrow="Create account"
            title="Join Genesis"
            subtitle="Save your vehicles and wishlist, track orders and check out in seconds."
            footer={
                <>Already have an account?{" "}
                    <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-brand-ink underline-offset-4 hover:underline">Sign in</Link>
                </>
            }
        >
            <form onSubmit={submitForm}>
                {error && <AuthError>{error}</AuthError>}
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-3">
                        <AuthField id="fn" label="First name" required autoComplete="given-name" value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
                        <AuthField id="ln" label="Last name" required autoComplete="family-name" value={form.lastName} onChange={set("lastName")} placeholder="Wanjiku" />
                    </div>
                    <AuthField id="em" label="Email address" icon={Mail} type="email" required autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
                    <AuthField id="ph" label="Phone" hint="Optional" icon={Phone} type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} placeholder="+254 7XX XXX XXX" />
                    <div>
                        <PasswordField id="pw" label="Password" icon={Lock} required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="Create a password" />
                        <PasswordStrength value={form.password} />
                    </div>
                </div>
                <div className="mt-7">
                    <SubmitButton busy={busy} busyLabel="Creating account…">
                        Create account <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                    </SubmitButton>
                </div>
                <p className="mt-4 text-center text-[12px] leading-relaxed text-faint">
                    By creating an account you agree to our{" "}
                    <Link href="/terms" target="_blank" className="font-medium text-mutedink underline underline-offset-2 hover:text-carbon">Terms</Link> and{" "}
                    <Link href="/privacy" target="_blank" className="font-medium text-mutedink underline underline-offset-2 hover:text-carbon">Privacy Policy</Link>.
                </p>
            </form>
        </AuthShell>
    );
}
