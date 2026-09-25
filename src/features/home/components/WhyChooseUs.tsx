
import { ShieldCheck, Truck, RotateCcw, Star, Cog, Package, Headphones, Lock } from "lucide-react";
import Stars from "@/components/common/Stars";


const whyChoose = [
    { title: "Wide Range of Parts", desc: "Thousands of parts for all car makes & models", icon: Cog },
    { title: "Best Prices", desc: "Competitive prices guaranteed", icon: Package },
    { title: "Trusted Quality", desc: "We only sell genuine and quality parts", icon: ShieldCheck },
    { title: "Customer Support", desc: "24/7 support ready to assist you", icon: Headphones },
];

const trustBadges = [
    { label: "Secure Payments", desc: "Safe & secure checkout", icon: Lock },
    { label: "7 Days Returns", desc: "Easy returns policy", icon: RotateCcw },
    { label: "Genuine Parts", desc: "100% authentic products", icon: ShieldCheck },
    { label: "Nationwide Delivery", desc: "Across Kenya", icon: Truck },
];


export default function WhyChooseUs() {
    return (
        <div className="bg-white border-t border-line">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                <div>
                    <span className="eyebrow">The Genesis promise</span>
                    <h3 className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-carbon mt-1 mb-7">
                        Why Choose Genesis Investment?
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {whyChoose.map((w) => (
                            <div key={w.title} className="flex flex-col items-start gap-2">
                                <span className="w-12 h-12 rounded-xl bg-brand-wash flex items-center justify-center">
                                    <w.icon size={20} className="text-brand" />
                                </span>
                                <h4 className="text-sm font-semibold text-carbon mt-1">{w.title}</h4>
                                <p className="text-xs text-faint leading-snug">{w.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-hairline rounded-2xl p-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-ink mb-3">Trusted by thousands</h4>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-3xl font-extrabold text-carbon tnum">4.8</span>
                        <Stars rating={4.8} />
                    </div>
                    <p className="text-xs text-faint mb-4">Based on 2,450+ Reviews</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-mutedink">
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-carbon">Google</span>
                            <span className="tnum">4.8/5</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-carbon">Facebook</span>
                            <span className="tnum">4.7/5</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-carbon flex items-center gap-1"><Star size={12} className="text-brand" />Trustpilot</span>
                            <span className="tnum">4.8/5</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface border-t border-line">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {trustBadges.map((t) => (
                        <div key={t.label} className="flex items-center gap-3">
                            <t.icon size={20} className="text-brand shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-carbon">{t.label}</p>
                                <p className="text-[11px] text-faint">{t.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
