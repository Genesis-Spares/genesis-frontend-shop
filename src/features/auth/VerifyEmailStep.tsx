'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import AuthShell from "./AuthShell";
import { AuthError, OtpInput, SubmitButton } from "./AuthFields";
import { useAuth } from "./AuthContext";

const msg = (err: unknown, fallback: string) => (err instanceof Error && err.message) || fallback;

/**
 * 6-digit email verification, shared by sign-up (right after registering) and
 * sign-in (when the account was never verified). On success it signs the
 * shopper in with the password they just typed and continues to `redirect`.
 */
export default function VerifyEmailStep({
    email,
    password,
    redirect,
    eyebrow,
    notice,
    onBack,
    backLabel,
}: {
    email: string;
    password: string;
    redirect: string;
    eyebrow: string;
    /** Context line shown above the code boxes, e.g. why the shopper landed here. */
    notice?: string;
    onBack: () => void;
    backLabel: string;
}) {
    const { verifyEmail, resendOtp, login } = useAuth();
    const router = useRouter();
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(notice ?? null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true); setError(null);
        try {
            await verifyEmail(email, code.trim());
        } catch (err) {
            setError(msg(err, "Invalid or expired code."));
            setBusy(false);
            return;
        }
        try {
            await login(email, password);
            router.replace(redirect);
        } catch {
            // verified, but auto sign-in failed — let them sign in manually
            router.replace(`/account/login?redirect=${encodeURIComponent(redirect)}`);
        }
    };

    const resend = async () => {
        setError(null);
        try { await resendOtp(email); setNote("A new code is on its way."); setCode(""); }
        catch (err) { setError(msg(err, "Couldn't resend the code.")); }
    };

    return (
        <AuthShell
            eyebrow={eyebrow}
            title="Check your inbox"
            subtitle={<>We sent a 6-digit code to <span className="font-semibold text-carbon">{email}</span>. Enter it below to activate your account.</>}
            footer={
                <button type="button" onClick={onBack}
                    className="inline-flex items-center gap-1.5 font-semibold text-mutedink transition hover:text-carbon">
                    <ArrowLeft size={15} /> {backLabel}
                </button>
            }
        >
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-wash text-brand">
                <MailCheck size={26} />
            </div>
            <form onSubmit={submit}>
                {error && <AuthError>{error}</AuthError>}
                {note && !error && (
                    <div className="mb-5 rounded-xl border border-[#cfe9dc] bg-stock-wash px-3.5 py-3 text-[13px] text-stock">{note}</div>
                )}
                <OtpInput value={code} onChange={setCode} />
                <div className="mt-7">
                    <SubmitButton busy={busy} disabled={code.length < 6} busyLabel="Verifying…">
                        <ShieldCheck size={18} /> Verify &amp; continue
                    </SubmitButton>
                </div>
                <p className="mt-5 text-center text-[13px] text-mutedink">
                    Didn&apos;t get it? Check spam, or{" "}
                    <button type="button" onClick={resend} className="font-semibold text-brand-ink underline-offset-4 hover:underline">
                        resend the code
                    </button>
                </p>
            </form>
        </AuthShell>
    );
}
