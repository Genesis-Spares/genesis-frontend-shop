'use client'

import Link from "next/link";
import { Heart, LogIn } from "lucide-react";
import Topbar from "@/components/common/Topbar";
import MainHeader from "@/components/common/MainHeader";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import ProductCard from "@/components/common/ProductCard";
import { useWishlist } from "./WishlistContext";

export default function WishlistPage() {
    const { items, ready, needsLogin } = useWishlist();

    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar />

            <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
                <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-carbon">
                    Your Wishlist{" "}
                    {ready && !needsLogin && (
                        <span className="text-lg font-medium text-faint">({items.length})</span>
                    )}
                </h1>

                {!ready ? (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-72 animate-pulse rounded-[14px] border border-hairline bg-surface" />
                        ))}
                    </div>
                ) : needsLogin ? (
                    <div className="my-10 flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-16 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                            <Heart size={26} className="text-line-strong" />
                        </span>
                        <h2 className="font-display mt-5 text-xl font-extrabold text-carbon">Sign in to see your wishlist</h2>
                        <p className="mt-2 max-w-sm text-sm text-faint">
                            Save parts to your wishlist and find them on any device once you&apos;re signed in.
                        </p>
                        <Link
                            href="/account/login?redirect=/wishlist"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-hover"
                        >
                            <LogIn size={16} /> Sign in
                        </Link>
                    </div>
                ) : items.length === 0 ? (
                    <div className="my-10 flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-16 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                            <Heart size={26} className="text-line-strong" />
                        </span>
                        <h2 className="font-display mt-5 text-xl font-extrabold text-carbon">Your wishlist is empty</h2>
                        <p className="mt-2 max-w-sm text-sm text-faint">Tap the heart on any part to save it here.</p>
                        <Link href="/shop" className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-hover">
                            Browse parts
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
                        {items.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
