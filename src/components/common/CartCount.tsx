'use client'

import { useCart } from "@/features/cart/CartContext";

/** Small client badge for the header cart icon — reflects live cart count. */
export default function CartCount() {
    const { count, ready } = useCart();
    if (!ready || count === 0) return null;
    return (
        <span className="absolute -top-2 -right-2 bg-brand text-white text-[10.5px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center">
            {count > 99 ? "99+" : count}
        </span>
    );
}
