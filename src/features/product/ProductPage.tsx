'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    ChevronRight,
    Heart,
    Minus,
    Plus,
    ShoppingCart,
    Truck,
    ShieldCheck,
    Check,
    Package,
} from 'lucide-react'
import Topbar from '@/components/common/Topbar'
import MainHeader from '@/components/common/MainHeader'
import NavBar from '@/components/common/NavBar'
import Footer from '@/components/common/Footer'
import { useRouter } from 'next/navigation'
import ProductCard from '@/components/common/ProductCard'
import { useCart } from '@/features/cart/CartContext'
import { useWishlist } from '@/features/wishlist/WishlistContext'
import { formatKSh } from '@/libs/utils'
import type { CardProduct, ProductDetail } from '@/lib/api'
import ProductReviews from './ProductReviews'
import FitCheck from '@/features/vehicle/FitCheck'
import PartNumbers from './PartNumbers'

export default function ProductPage({ data, related }: { data?: ProductDetail; related?: CardProduct[] }) {
    const [qty, setQty] = useState(1)
    const [activeImg, setActiveImg] = useState(0)
    const [tab, setTab] = useState(0)
    const [added, setAdded] = useState(false)
    const { add, items: cartItems } = useCart()
    const wishlist = useWishlist()
    const router = useRouter()

    const p = data
    const saved = p ? wishlist.has(p.id) : false
    const toggleWishlist = async () => {
        if (!p) return
        const res = await wishlist.toggle({ id: p.id })
        if (res === "login") router.push(`/account/login?redirect=/products/${p.slug}`)
    }
    const rel = related ?? []
    const inStock = p ? p.stock !== 'Out of Stock' : false
    // how many more can go in the cart, given what's already there
    const inCart = p ? cartItems.find((i) => i.id === p.id)?.qty ?? 0 : 0
    const canAdd = p ? Math.max(0, (p.stockQty || 0) - inCart) : 0
    const atMax = qty >= canAdd
    const save = p && p.comparePrice && p.comparePrice > p.price ? p.comparePrice - p.price : 0
    // live figures once the reviews section has loaded (e.g. right after posting one)
    const [live, setLive] = useState<{ count: number; average: number } | null>(null)
    const onReviewStats = useCallback((count: number, average: number) => setLive({ count, average }), [])
    const reviewCount = live?.count ?? p?.reviews ?? 0
    const ratingValue = live?.average ?? p?.rating ?? 0
    const tabs = p ? ['Description', 'Specifications', `Reviews (${reviewCount})`] : []

    const addToCart = () => {
        if (!p) return
        add({ id: p.id, sku: p.sku, slug: p.slug, name: p.name, brand: p.brand, price: p.price, image: p.image, maxQty: p.stockQty }, Math.min(qty, Math.max(1, canAdd)))
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    if (!p) {
        return (
            <div className="min-h-screen bg-white">
                <Topbar />
                <MainHeader />
                <NavBar activeTab="Shop" />
                <main className="mx-auto flex max-w-[1400px] flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
                        <Package size={30} className="text-line-strong" />
                    </span>
                    <h1 className="font-display mt-5 text-2xl font-extrabold tracking-[-0.02em] text-carbon">Product unavailable</h1>
                    <p className="mt-2 max-w-md text-sm text-faint">We couldn&apos;t load this part. It may be out of the catalogue, or the store is temporarily unavailable.</p>
                    <Link href="/shop" className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-hover">Back to shop</Link>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Topbar />
            <MainHeader />
            <NavBar activeTab="Shop" />

            {/* breadcrumb */}
            <div className="border-b border-line">
                <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-3 text-[12.5px] text-faint sm:px-6">
                    <Link href="/" className="hover:text-brand">Home</Link>
                    <ChevronRight size={13} />
                    <Link href="/shop" className="hover:text-brand">Shop</Link>
                    <ChevronRight size={13} />
                    <span className="line-clamp-1 text-mutedink">{p.name}</span>
                </div>
            </div>

            <main className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-10 py-8 lg:grid-cols-2">
                    {/* gallery */}
                    <div>
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-hairline bg-surface">
                            {save > 0 && (
                                <span className="absolute left-4 top-4 z-10 rounded-md bg-carbon px-2.5 py-1 text-[11px] font-bold text-white">
                                    −{Math.round((save / (p.comparePrice || 1)) * 100)}%
                                </span>
                            )}
                            {p.images.length ? (
                                <Image src={p.images[activeImg]} alt={p.name} fill className="object-contain p-8" />
                            ) : (
                                <Package size={150} strokeWidth={1} className="text-line-strong" />
                            )}
                        </div>
                        {p.images.length > 1 && (
                            <div className="mt-3.5 flex gap-3">
                                {p.images.map((src, i) => (
                                    <button
                                        key={src + i}
                                        onClick={() => setActiveImg(i)}
                                        className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-surface transition ${activeImg === i ? 'border-brand ring-1 ring-brand' : 'border-hairline hover:border-line-strong'
                                            }`}
                                    >
                                        <Image src={src} alt="" fill className="object-contain p-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* info */}
                    <div>
                        <div className="font-mono text-xs font-semibold uppercase tracking-wide text-faint">
                            {p.brand ? `${p.brand} · ` : ''}{p.sku}
                        </div>
                        <h1 className="font-display mt-2.5 text-[29px] font-extrabold leading-[1.12] tracking-[-0.02em] text-carbon">
                            {p.name}
                        </h1>
                        {p.partNumbers.length > 0 && (() => {
                            const lead = p.partNumbers.find((n) => n.type === 'OE') ?? p.partNumbers[0]
                            const more = p.partNumbers.length - 1
                            return (
                                <p className="mt-2 text-[13px] text-mutedink">
                                    {lead.type === 'OE' ? 'OE' : lead.brand ?? 'Part no.'} <span className="font-mono font-semibold text-carbon">{lead.number}</span>
                                    {more > 0 && (
                                        <button type="button" onClick={() => { setTab(1); document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' }) }}
                                            className="ml-1.5 font-semibold text-brand-ink hover:underline">
                                            · +{more} cross-reference{more === 1 ? '' : 's'}
                                        </button>
                                    )}
                                </p>
                            )
                        })()}

                        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                            <span className="tracking-[1px]" aria-label={`${ratingValue || 0} out of 5 stars`}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i} className={i <= Math.round(ratingValue) ? 'text-[#f5a524]' : 'text-line-strong'}>★</span>
                                ))}
                            </span>
                            <span className="text-[13.5px] font-semibold text-mutedink">{ratingValue || '—'}</span>
                            <button type="button" onClick={() => { setTab(2); document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' }) }}
                                className="text-[13.5px] text-faint underline-offset-2 hover:text-brand-ink hover:underline">
                                · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                            </button>
                            {inStock ? (
                                <span className="ml-2 flex items-center gap-1.5 text-[13.5px] font-medium text-stock">
                                    <span className="h-1.5 w-1.5 rounded-full bg-stock" /> In stock{p.stockQty ? ` (${p.stockQty})` : ''}
                                </span>
                            ) : (
                                <span className="ml-2 text-[13.5px] font-medium text-brand-ink">Out of stock</span>
                            )}
                        </div>

                        {/* price box */}
                        <div className="mt-5 rounded-2xl border border-hairline bg-surface p-5">
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="font-display text-[34px] font-extrabold text-carbon tnum">
                                    {formatKSh(p.price)}
                                </span>
                                {save > 0 && (
                                    <>
                                        <span className="font-mono text-lg text-faint line-through tnum">{p.comparePrice!.toLocaleString()}</span>
                                        <span className="rounded-md bg-brand-wash px-2.5 py-1 text-[12.5px] font-bold text-brand-ink tnum">
                                            Save {save.toLocaleString()}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="mt-1.5 text-[12.5px] text-faint">Price incl. VAT</div>
                        </div>

                        {/* vehicle fit check */}
                        <FitCheck productName={p.name} isUniversal={p.isUniversal} fitments={p.fitments} legacyText={p.compatibility} />

                        {/* qty + actions */}
                        <div className="mt-5 flex flex-wrap items-stretch gap-3.5">
                            <div className="flex items-center overflow-hidden rounded-xl border border-line-strong">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    aria-label="Decrease"
                                    className="flex h-[54px] w-12 items-center justify-center bg-surface text-mutedink hover:text-carbon"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-12 text-center font-bold tnum">{qty}</span>
                                <button
                                    onClick={() => setQty(Math.min(qty + 1, Math.max(1, canAdd)))}
                                    disabled={atMax}
                                    aria-label="Increase"
                                    className="flex h-[54px] w-12 items-center justify-center bg-surface text-mutedink hover:text-carbon disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                onClick={addToCart}
                                disabled={!inStock || canAdd === 0}
                                className="flex h-[54px] min-w-[180px] flex-1 items-center justify-center gap-2.5 rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {added ? (<><Check size={20} /> Added to cart</>) : (<><ShoppingCart size={20} /> Add to Cart</>)}
                            </button>
                            <button
                                onClick={toggleWishlist}
                                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                                className="flex h-[54px] w-14 items-center justify-center rounded-xl border border-line-strong transition hover:border-brand hover:bg-brand-wash"
                            >
                                <Heart size={22} className={saved ? 'fill-brand text-brand' : 'text-mutedink'} />
                            </button>
                        </div>

                        {/* trust cards */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 rounded-xl border border-hairline p-3.5">
                                <Truck size={20} className="text-brand" />
                                <div className="text-[12.5px]">
                                    <div className="font-semibold text-carbon">Same-day dispatch</div>
                                    <div className="text-faint">Order before 2pm</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 rounded-xl border border-hairline p-3.5">
                                <ShieldCheck size={20} className="text-brand" />
                                <div className="text-[12.5px]">
                                    <div className="font-semibold text-carbon">Genuine &amp; warrantied</div>
                                    <div className="text-faint">Manufacturer-backed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* tabs */}
                <div id="product-tabs" className="mt-6 flex scroll-mt-28 gap-7 overflow-x-auto border-b border-hairline text-[14.5px] font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {tabs.map((t, i) => (
                        <button
                            key={t}
                            onClick={() => setTab(i)}
                            className={`whitespace-nowrap pb-3.5 transition-colors ${tab === i ? 'border-b-2 border-brand text-carbon' : 'text-faint hover:text-mutedink'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tab === 2 ? (
                    <div className="pt-6"><ProductReviews productId={p.id} slug={p.slug} onCountChange={onReviewStats} /></div>
                ) : (
                <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[1.3fr_1fr]">
                    <div className="max-w-[62ch] text-[14.5px] leading-[1.75] text-mutedink">
                        {tab === 0 && <p className="mt-0 whitespace-pre-line">{p.description || 'No description available for this part.'}</p>}
                        {tab === 1 && (
                            <div className="space-y-6">
                                {p.attributes.length ? (
                                    <p className="mt-0">Full technical specifications are listed in the panel on the right.</p>
                                ) : !p.partNumbers.length ? (
                                    <p className="mt-0">No specifications listed for this part.</p>
                                ) : null}
                                <PartNumbers numbers={p.partNumbers} />
                            </div>
                        )}
                    </div>
                    {p.attributes.length > 0 && (
                        <div className="rounded-2xl border border-hairline px-5 py-1.5">
                            {p.attributes.map((a) => (
                                <div
                                    key={a.name + a.value}
                                    className="flex items-center justify-between border-b border-line py-3.5 text-[13.5px] last:border-b-0"
                                >
                                    <span className="text-faint">{a.name}</span>
                                    <span className="font-semibold text-carbon">{a.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}

                {/* related */}
                {rel.length > 0 && (
                    <div className="py-11">
                        <h2 className="font-display mb-5 text-[22px] font-extrabold tracking-[-0.02em] text-carbon">
                            Frequently bought together
                        </h2>
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {rel.map((r) => (
                                <ProductCard key={r.id || r.sku} product={r} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
