import Link from "next/link";
import Image from "next/image";
import { TrendingUp, ArrowRight, Package, Disc, CircleDot, BatteryFull, Droplet, Filter as FilterIcon, Wrench } from "lucide-react";
import Stars from "@/components/common/Stars";
import { formatKSh } from "@/libs/utils";

type Row = {
    rank: number;
    name: string;
    price: number;
    rating: number;
    reviews: number;
    sold: string;
    slug?: string;
    image?: string;
    icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};


function fromProducts(products: any[]): Row[] {
    return products.slice(0, 6).map((p, i) => ({
        rank: i + 1,
        name: p.name,
        price: Number(p.price) || 0,
        rating: Number(p.rating) || 0,
        reviews: Number(p.reviews) || 0,
        sold: `${p.reviews || 0}`,
        slug: p.slug || p.sku,
        image: p.image || "",
    }));
}

export default function BestSellers({ products }: { products?: any[] }) {
    if (!products || !products.length) return null;
    const top = fromProducts(products);
    const [hero, ...rest] = top;
    const HeroIcon = hero.icon ?? Package;
    const heroHref = hero.slug ? `/products/${hero.slug}` : "/shop";

    return (
        <section className="bg-surface">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <span className="eyebrow flex items-center gap-1.5">
                            <TrendingUp size={13} /> Trending this month
                        </span>
                        <h2 className="font-display mt-2 text-[27px] font-extrabold tracking-[-0.02em] text-carbon">Best Sellers</h2>
                    </div>
                    <Link href="/shop" className="text-[13.5px] font-semibold text-brand-ink flex items-center gap-1 hover:gap-2 transition-all">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.15fr]">
                    {/* #1 hero */}
                    <Link
                        href={heroHref}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white p-7 transition hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)]"
                    >
                        <span className="absolute right-6 top-6 font-display text-6xl font-black text-surface-2">01</span>
                        <span className="w-fit rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                            #1 Best Seller
                        </span>
                        <div className="relative my-6 flex h-[120px] items-center justify-center">
                            {hero.image ? (
                                <Image src={hero.image} alt={hero.name} width={160} height={120} className="h-[120px] w-auto object-contain" />
                            ) : (
                                <HeroIcon size={120} strokeWidth={0.9} className="text-line-strong" />
                            )}
                        </div>
                        <h3 className="font-display line-clamp-2 text-2xl font-extrabold tracking-[-0.01em] text-carbon">{hero.name}</h3>
                        <div className="mt-3 flex items-center gap-2.5">
                            <Stars rating={hero.rating} />
                            <span className="text-[12px] text-faint">{hero.rating} · {hero.reviews} reviews</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="font-display text-2xl font-extrabold text-carbon tnum">{formatKSh(hero.price)}</span>
                            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-ink group-hover:gap-2.5 transition-all">
                                Shop now <ArrowRight size={15} />
                            </span>
                        </div>
                    </Link>

                    {/* ranked list */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {rest.map((p) => {
                            const Icon = p.icon ?? Package;
                            return (
                                <Link
                                    key={p.rank}
                                    href={p.slug ? `/products/${p.slug}` : "/shop"}
                                    className="group flex items-center gap-4 rounded-2xl border border-hairline bg-white p-4 transition hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_12px_24px_-16px_rgba(20,22,28,.22)]"
                                >
                                    <span className="font-display w-6 shrink-0 text-center text-2xl font-black text-line-strong">
                                        {p.rank}
                                    </span>
                                    <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface">
                                        {p.image ? (
                                            <Image src={p.image} alt={p.name} width={64} height={64} className="h-full w-full object-contain p-1.5" />
                                        ) : (
                                            <Icon size={34} strokeWidth={1.2} className="text-line-strong" />
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="line-clamp-2 text-[13px] font-semibold leading-tight text-[#1b1e25] transition-colors group-hover:text-brand">
                                            {p.name}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className="text-[11px] text-brand">★</span>
                                            <span className="text-[11px] text-faint">{p.rating} · {p.reviews} reviews</span>
                                        </div>
                                        <div className="mt-1 font-display text-[15px] font-extrabold text-carbon tnum">
                                            {formatKSh(p.price)}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
