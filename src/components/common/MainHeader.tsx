import Link from "next/link";
import Logo from "./Logo";
import CartCount from "./CartCount";
import WishlistCount from "./WishlistCount";
import AccountLink from "./AccountLink";
import { Suspense } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import SearchBar from "./SearchBar";

export default function MainHeader() {
    return (
        <div className="bg-white border-b border-line sticky top-0 z-40">
            <div className="max-w-[1400px] mx-auto flex items-center gap-6 px-4 sm:px-6 h-[78px]">
                <Link href="/"><Logo withMark /></Link>

                <Suspense fallback={<SearchPlaceholder className="hidden md:block" />}>
                    <SearchBar />
                </Suspense>

                <div className="flex items-center gap-5 sm:gap-6 ml-auto text-[#3d4552]">
                    <Link href="/wishlist" className="relative flex items-center gap-2 text-[13.5px] hover:text-brand transition-colors">
                        <span className="relative">
                            <Heart size={20} />
                            <WishlistCount />
                        </span>
                        <span className="hidden lg:inline">Wishlist</span>
                    </Link>
                    <Link href="/cart" className="relative flex items-center gap-2 text-[13.5px] hover:text-brand transition-colors">
                        <span className="relative">
                            <ShoppingCart size={20} />
                            <CartCount />
                        </span>
                        <span className="hidden lg:inline">Cart</span>
                    </Link>
                    <AccountLink />
                </div>
            </div>
            {/* phones: search gets its own row under the logo bar */}
            <div className="px-4 pb-3 md:hidden">
                <Suspense fallback={<SearchPlaceholder />}>
                    <SearchBar variant="mobile" />
                </Suspense>
            </div>
        </div>
    );
}

/** Same footprint as the search bar, shown while it hydrates. */
function SearchPlaceholder({ className = "" }: { className?: string }) {
    return <div className={`h-12 max-w-xl flex-1 rounded-xl border border-hairline bg-surface ${className}`} />;
}
