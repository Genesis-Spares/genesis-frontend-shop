'use client'

import { useWishlist } from "@/features/wishlist/WishlistContext";

export default function WishlistCount() {
    const { count, ready } = useWishlist();
    if (!ready || count === 0) return null;
    return (
        <span className="absolute -top-2 -right-2 bg-brand text-white text-[10.5px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center">
            {count > 99 ? "99+" : count}
        </span>
    );
}
