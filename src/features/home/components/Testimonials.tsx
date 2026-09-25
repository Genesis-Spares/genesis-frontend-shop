import { Quote, Star } from "lucide-react";

const reviews = [
    {
        quote: "Ordered brake discs at 11am, they were at my garage in Industrial Area by 2pm. Genuine Bosch, correct fitment, no drama. This is how parts should work.",
        name: "David Kamau",
        role: "Owner, Kamau Auto Garage",
        initials: "DK",
        rating: 5,
    },
    {
        quote: "We run a 40-vehicle fleet and Genesis is the only supplier that gets the part right the first time. The trade account and credit terms save us hours every week.",
        name: "Aisha Mohamed",
        role: "Fleet Manager, SwiftLogistics",
        initials: "AM",
        rating: 5,
    },
    {
        quote: "I wasn't sure which filter my Fielder needed — sent them the reg number and they matched it instantly. Delivered to Nakuru in two days. Highly recommend.",
        name: "Peter Otieno",
        role: "Verified customer",
        initials: "PO",
        rating: 5,
    },
];

export default function Testimonials() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
                <div className="mb-9 max-w-2xl">
                    <span className="eyebrow">What customers say</span>
                    <h2 className="font-display mt-2 text-[30px] font-extrabold tracking-[-0.02em] text-carbon">
                        Trusted by drivers, garages and fleets
                    </h2>
                    <div className="mt-3 flex items-center gap-2.5">
                        <div className="flex text-brand">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-carbon">4.8 / 5</span>
                        <span className="text-sm text-faint">from 2,450+ reviews</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {reviews.map((r) => (
                        <figure key={r.name} className="flex flex-col rounded-2xl border border-hairline bg-white p-7">
                            <Quote size={28} className="text-brand" fill="currentColor" />
                            <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-mutedink">
                                &ldquo;{r.quote}&rdquo;
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-carbon font-display text-sm font-bold text-brand">
                                    {r.initials}
                                </span>
                                <div>
                                    <div className="text-sm font-semibold text-carbon">{r.name}</div>
                                    <div className="text-[12px] text-faint">{r.role}</div>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
