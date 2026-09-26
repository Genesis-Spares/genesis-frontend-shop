"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "genesis-shop-install-dismissed";
const SNOOZE_DAYS = 30;
const DELAY_MS = 12_000; // let people look around before asking

function isStandalone() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
}

function snoozed() {
    try {
        const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
        return Date.now() - t < SNOOZE_DAYS * 864e5;
    } catch {
        return false;
    }
}

/**
 * A small "Get the app" card at the bottom of the screen.
 * - Chrome/Edge/Android: uses the browser's install prompt.
 * - iPhone/iPad Safari (no install API): explains Share → Add to Home Screen.
 * Hidden when already installed, during checkout and sign-in, and for 30 days after "Not now".
 */
export default function InstallPrompt() {
    const pathname = usePathname();
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
    const [ios, setIos] = useState(false);
    const [eligible, setEligible] = useState(false); // decided after a short delay, in the browser
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const onPrompt = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
        };
        const onInstalled = () => setHidden(true);
        window.addEventListener("beforeinstallprompt", onPrompt);
        window.addEventListener("appinstalled", onInstalled);

        const t = setTimeout(() => {
            if (isStandalone() || snoozed()) return;
            const ua = navigator.userAgent;
            const iOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
            const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
            setIos(iOS && safari);
            setEligible(true);
        }, DELAY_MS);
        return () => {
            clearTimeout(t);
            window.removeEventListener("beforeinstallprompt", onPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    const dismiss = () => {
        setHidden(true);
        try {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
            /* private mode: hide for this visit only */
        }
    };

    const busyPage = pathname.startsWith("/checkout") || pathname.startsWith("/account/login") || pathname.startsWith("/account/register");
    if (hidden || !eligible || busyPage || (!deferred && !ios)) return null;

    return (
        <div
            role="dialog"
            aria-label="Install the Genesis app"
            className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-hairline bg-white p-3.5 shadow-[0_18px_40px_-12px_rgba(20,22,28,.35)] pb-[max(0.875rem,env(safe-area-inset-bottom))]"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 text-[13px] leading-snug text-mutedink">
                <p className="font-display text-[14.5px] font-extrabold text-carbon">Get the Genesis app</p>
                {deferred ? (
                    <>Faster checkout and order tracking from your home screen.</>
                ) : (
                    <>Tap <Share size={13} className="inline -translate-y-px" aria-label="Share" /> Share, then <b className="font-semibold text-carbon">Add to Home Screen</b>.</>
                )}
            </div>
            {deferred && (
                <button
                    type="button"
                    onClick={async () => {
                        await deferred.prompt();
                        const { outcome } = await deferred.userChoice;
                        setDeferred(null);
                        if (outcome === "dismissed") dismiss();
                        else setHidden(true);
                    }}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white transition hover:bg-brand-hover"
                >
                    <Download size={15} /> Install
                </button>
            )}
            <button type="button" onClick={dismiss} aria-label="Not now" className="-mr-1 shrink-0 rounded-lg p-1.5 text-faint hover:bg-surface hover:text-carbon">
                <X size={18} />
            </button>
        </div>
    );
}
