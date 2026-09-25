'use client'

import { useRef, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";

const inputCls =
    "peer h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-[14.5px] text-carbon shadow-[0_1px_2px_rgba(20,22,28,0.04)] outline-none transition placeholder:text-faint/80 hover:border-[#c9cdd6] focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:border-line disabled:bg-surface disabled:text-mutedink disabled:shadow-none";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: React.ReactNode;
    icon?: LucideIcon;
    trailing?: React.ReactNode;
};

export function AuthField({ label, hint, icon: Icon, trailing, id, className = "", ...rest }: InputProps) {
    return (
        <div className={className}>
            <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor={id} className="text-[13px] font-semibold text-carbon">{label}</label>
                {hint && <span className="text-[12px] text-faint">{hint}</span>}
            </div>
            <div className="relative">
                <input id={id} {...rest} className={`${inputCls} ${Icon ? "pl-11" : ""} ${trailing ? "pr-12" : ""}`} />
                {Icon && (
                    <Icon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint transition peer-focus:text-brand" />
                )}
                {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
            </div>
        </div>
    );
}

export function PasswordField(props: Omit<InputProps, "type" | "trailing">) {
    const [show, setShow] = useState(false);
    return (
        <AuthField
            {...props}
            type={show ? "text" : "password"}
            trailing={
                <button type="button" onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-carbon">
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
            }
        />
    );
}

/** 0–4 score from length and character variety. */
export function passwordScore(pw: string) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return Math.max(1, s);
}

const strength = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-[#d9534a]" },
    { label: "Fair", color: "bg-[#e89a2c]" },
    { label: "Good", color: "bg-[#5aa469]" },
    { label: "Strong", color: "bg-stock" },
];

export function PasswordStrength({ value }: { value: string }) {
    const score = passwordScore(value);
    return (
        <div className="mt-2.5" aria-live="polite">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? strength[score].color : "bg-line"}`} />
                ))}
            </div>
            <p className="mt-1.5 text-[12px] text-faint">
                {score ? <><span className="font-semibold text-mutedink">{strength[score].label}</span> · </> : null}
                Use 8+ characters with a mix of letters, numbers &amp; symbols.
            </p>
        </div>
    );
}

export function AuthError({ children }: { children: React.ReactNode }) {
    return (
        <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#f5c6c2] bg-[#fdf3f2] px-3.5 py-3 text-[13px] leading-snug text-[#b23b32] animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} className="mt-px shrink-0" />
            <span>{children}</span>
        </div>
    );
}

export function SubmitButton({ busy, disabled, busyLabel, children }: { busy: boolean; disabled?: boolean; busyLabel: string; children: React.ReactNode }) {
    return (
        <button type="submit" disabled={busy || disabled}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(228,83,31,0.65)] transition hover:bg-brand-hover hover:shadow-[0_10px_24px_-8px_rgba(228,83,31,0.75)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70">
            {busy ? <><Loader2 size={18} className="animate-spin" /> {busyLabel}</> : children}
        </button>
    );
}

/** Six single-digit boxes backed by one string value; supports paste & arrow keys. */
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

    // value is always contiguous: writes past the end land on the next free box
    const setAt = (i: number, digit: string) => {
        if (i < 0) return;
        const at = Math.min(i, value.length);
        onChange((value.slice(0, at) + digit + value.slice(at + 1)).slice(0, length));
        return at;
    };

    return (
        <div className="flex justify-between gap-2 sm:gap-2.5">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    aria-label={`Digit ${i + 1}`}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={value[i] ?? ""}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(-1);
                        if (!d) return;
                        focus((setAt(i, d) ?? i) + 1);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                            e.preventDefault();
                            if (value[i]) setAt(i, "");
                            else { setAt(i - 1, ""); focus(i - 1); }
                        }
                        if (e.key === "ArrowLeft") focus(i - 1);
                        if (e.key === "ArrowRight") focus(i + 1);
                    }}
                    onPaste={(e) => {
                        e.preventDefault();
                        const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
                        if (digits) { onChange(digits); focus(digits.length); }
                    }}
                    className="h-14 w-full min-w-0 rounded-xl border border-line-strong bg-white text-center font-mono text-[22px] font-semibold text-carbon shadow-[0_1px_2px_rgba(20,22,28,0.04)] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 sm:h-[60px]"
                />
            ))}
        </div>
    );
}
