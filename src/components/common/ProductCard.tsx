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
        <div className="group flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-white transition-all duration-200 hover:-translate-y-[3px] hover:border-line-strong hover:shadow-[0_1px_2px_rgba(20,22,28,.04),0_18px_34px_-20px_rgba(20,22,28,.22)]">
            <Link href={href}>
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface p-6">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
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

            <div className="flex flex-1 flex-col gap-2 p-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-faint">
                        {product.sku}
                    </p>
                    <Link href={href}>
                        <h3 className="mt-0.5 line-clamp-1 font-semibold text-[#1b1e25] transition-colors group-hover:text-brand">
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

                <div className="mt-auto flex items-center justify-between pt-1">
                    <p className="font-display text-xl font-extrabold tracking-[-0.01em] text-carbon tnum">
                        {formatKSh(product.price)}
                    </p>
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-bold ${inStock
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
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-brand text-[13.5px] font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {added ? (
                            <><Check size={16} /> Added</>
                        ) : (
                            <><ShoppingCart size={16} /> Add to Cart</>
                        )}
                    </button>

                    <button
                        onClick={toggleWishlist}
                        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong transition hover:border-brand hover:bg-brand-wash"
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
