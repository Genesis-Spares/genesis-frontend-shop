'use client'

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Check } from "lucide-react";

import Stars from "@/components/common/Stars";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { formatKSh } from "@/libs/utils";

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [added, setAdded] = useState(false);
    const { add } = useCart();
    const wishlist = useWishlist();
    const router = useRouter();
    const wid = product.id || product.sku;
    const saved = wishlist.has(wid);

    const toggleWishlist = async () => {
        const res = await wishlist.toggle({ id: wid });
        if (res === "login") router.push(`/account/login?redirect=/products/${product.slug || product.sku}`);
    };

    const inStock = product.stock === "In Stock";
    const href = `/products/${product.slug || product.sku}`;

    const addToCart = () => {
        add(
            {
                id: product.id || product.sku,
                sku: product.sku,
                slug: product.slug || product.sku,
                name: product.name,
                brand: product.brand,
                price: Number(product.price) || 0,
                image: product.image || "",
            },
            1,
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
    };

    return (
        <div className="@container group flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-white transition-all duration-200 hover:-translate-y-[3px] hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)]">
            <Link href={href}>
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface p-4 @[14rem]:p-6">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-3 @[14rem]:p-5 transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : product.icon ? (
                        <product.icon
                            size={70}
                            className="text-line-strong"
                            strokeWidth={1.2}
                        />
                    ) : (
                        <ShoppingCart size={54} className="text-line-strong" strokeWidth={1} />
                    )}
                </div>
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-3 @[14rem]:p-4">
                <div>
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-faint">
                        {product.sku}
                    </p>
                    <Link href={href}>
                        <h3 className="mt-0.5 line-clamp-2 text-[14px] leading-snug font-semibold @[14rem]:line-clamp-1 @[14rem]:text-base text-[#1b1e25] transition-colors group-hover:text-brand">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <Stars rating={product.rating} />
                    <span className="text-[11px] text-faint">
                        ({product.reviews ?? product.rating})
                    </span>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pt-1">
                    <p className="whitespace-nowrap font-display text-[17px] font-extrabold tracking-[-0.01em] text-carbon tnum @[14rem]:text-xl">
                        {formatKSh(product.price)}
                    </p>
                    <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10.5px] font-bold ${inStock
                            ? "bg-stock-wash text-stock"
                            : "bg-brand-wash text-brand-ink"
                            }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-stock" : "bg-brand"
                                }`}
                        />
                        {product.stock}
                    </span>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={addToCart}
                        disabled={product.stock === "Out of Stock"}
                        className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-brand text-[13.5px] font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {added ? (
                            <><Check size={16} /> Added</>
                        ) : (
                            <><ShoppingCart size={16} /> Add<span className="hidden @[14rem]:inline">&nbsp;to Cart</span></>
                        )}
                    </button>

                    <button
                        onClick={toggleWishlist}
                        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong transition hover:border-brand hover:bg-brand-wash"
                    >
                        <Heart
                            size={18}
                            className={saved ? "fill-brand text-brand" : "text-faint"}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
