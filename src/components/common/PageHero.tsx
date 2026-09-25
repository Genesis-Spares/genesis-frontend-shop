import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
    eyebrow: string;
    title: React.ReactNode;
    subtitle?: string;
    crumb: string;
    align?: "left" | "center";
}

export default function PageHero({ eyebrow, title, subtitle, crumb, align = "left" }: PageHeroProps) {
    return (
        <section className="relative overflow-hidden bg-carbon">
            {/* orange glow + faint grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{ background: "radial-gradient(circle at 80% 30%, rgba(228,83,31,0.22), transparent 55%)" }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />
            <div className={`relative mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-20 ${align === "center" ? "text-center" : ""}`}>
                <div className={`flex items-center gap-2 text-[12.5px] text-[#9ba3af] ${align === "center" ? "justify-center" : ""}`}>
                    <Link href="/" className="hover:text-brand">Home</Link>
                    <ChevronRight size={13} />
                    <span className="text-[#c7cdd7]">{crumb}</span>
                </div>
                <span className="eyebrow text-brand mt-5 block">{eyebrow}</span>
                <h1 className={`font-display mt-2 text-4xl font-extrabold tracking-[-0.03em] leading-[1.04] text-white sm:text-5xl ${align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"}`}>
                    {title}
                </h1>
                {subtitle && (
                    <p className={`mt-5 text-lg leading-relaxed text-[#c7cdd7] ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    );
}
