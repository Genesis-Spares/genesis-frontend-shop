'use client'

import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

const HERO_IMAGE = "https://synergyflow-lab.lovable.app/assets/hero-parts-CaDMkyy7.jpg";

const slides = [
    {
        image: HERO_IMAGE,
        badge: "New stock landed",
        headingTop: "Quality Spare Parts",
        headingAccent: "Every Journey",
        description:
            "Genuine parts. Unmatched performance. Fast delivery across Kenya — from brake systems to batteries, we keep you moving.",
    },
    {
        image: HERO_IMAGE,
        badge: "Best sellers restocked",
        headingTop: "Genuine Parts,",
        headingAccent: "Zero Guesswork",
        description:
            "Every part is sourced and verified for fit. Search by make and model and get it delivered wherever you are in Kenya.",
    },
    {
        image: HERO_IMAGE,
        badge: "Special offer",
        headingTop: "Save More On",
        headingAccent: "Tyres & Batteries",
        description:
            "Up to 20% off selected tyres and batteries this month. Fast fitting and nationwide delivery included.",
    },
];

const AUTO_ADVANCE_MS = 5500;

export default function Hero() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActive((i) => (i + 1) % slides.length);
        }, AUTO_ADVANCE_MS);
        return () => clearInterval(timer);
    }, []);

    const features = [
        { icon: ShieldCheck, title: "100% Genuine", sub: "Quality Parts" },
        { icon: Truck, title: "Fast Delivery", sub: "Across Kenya" },
        { icon: RotateCcw, title: "Easy Returns", sub: "7 Days Policy" },
    ];

    const slide = slides[active];

    return (
        <div className="relative bg-carbon overflow-hidden min-h-[640px] flex items-center">
            {/* backdrop: rotating hero photo with dark garage-tone overlay */}
            <div className="absolute inset-0">
                {slides.map((s, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
                        style={{
                            backgroundImage: `url('${s.image}')`,
                            opacity: i === active ? 1 : 0,
                        }}
                    />
                ))}

                <div className="absolute inset-0 bg-gradient-to-br from-[#14161c]/85 via-[#14161c]/70 to-[#0e0f14]/90" />
                <div
                    className="absolute inset-0 opacity-70"
                    style={{
                        background: "radial-gradient(circle at 78% 42%, rgba(228,83,31,0.20), transparent 55%)",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#14161c] via-[#14161c]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14161c] via-transparent to-[#14161c]/40" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 md:py-20 relative w-full">
                <div className="max-w-2xl">
                    <span
                        key={`badge-${active}`}
                        className="inline-flex items-center gap-2 bg-brand/10 border border-brand/40 text-brand text-xs font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full mb-6 animate-[fadeIn_0.6s_ease]"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand" /> {slide.badge}
                    </span>

                    <h1
                        key={`heading-${active}`}
                        className="font-display text-5xl sm:text-6xl font-extrabold tracking-[-0.03em] leading-[1.03] text-white animate-[fadeIn_0.6s_ease]"
                    >
                        {slide.headingTop}
                        <br />
                        <span className="text-brand">{slide.headingAccent}</span>
                    </h1>

                    <p
                        key={`desc-${active}`}
                        className="text-[#c7cdd7] mt-6 text-lg max-w-xl leading-relaxed animate-[fadeIn_0.6s_ease]"
                    >
                        {slide.description}
                    </p>

                    <div className="grid grid-cols-3 gap-3 mt-9 max-w-lg">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-4 flex flex-col items-start gap-2.5"
                            >
                                <span className="w-9 h-9 rounded-lg bg-brand/15 flex items-center justify-center">
                                    <f.icon size={17} className="text-brand" />
                                </span>
                                <div className="text-sm text-white font-semibold leading-tight">{f.title}</div>
                                <div className="text-xs text-[#9ba3af] leading-tight">{f.sub}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 mt-9">
                        <button className="bg-brand hover:bg-brand-hover transition-colors text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2">
                            SHOP NOW <ArrowRight size={16} />
                        </button>
                        <button className="border border-white/25 hover:border-white/50 transition-colors text-white font-semibold px-6 py-3.5 rounded-xl">
                            Browse Categories
                        </button>
                    </div>
                </div>
            </div>

            {/* slide indicator dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-brand" : "w-1.5 bg-white/40 hover:bg-white/60"
                            }`}
                    />
                ))}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
