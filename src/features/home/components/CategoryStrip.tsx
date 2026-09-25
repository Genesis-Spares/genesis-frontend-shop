'use client'

import { useEffect, useRef, useState } from 'react'
import {
    BatteryFull,
    Car,
    ChevronLeft,
    ChevronRight,
    Cog,
    Disc,
    Droplet,
    Filter as FilterIcon,
    MoveVertical,
    Wrench,
} from 'lucide-react'

const categories = [
    { name: 'Engine Parts', icon: Cog },
    { name: 'Brake System', icon: Disc },
    { name: 'Suspension', icon: MoveVertical },
    { name: 'Electrical', icon: BatteryFull },
    { name: 'Filters', icon: FilterIcon },
    { name: 'Body Parts', icon: Car },
    { name: 'Car Care', icon: Droplet },
    { name: 'Tools & Garage', icon: Wrench },
]

const SCROLL_AMOUNT = 280

export default function CategoriesStrip() {
    const trackRef = useRef<HTMLDivElement | null>(null)

    const [activeCategory, setActiveCategory] = useState('Body Parts')
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const updateArrows = () => {
        const el = trackRef.current
        if (!el) return

        setCanScrollLeft(el.scrollLeft > 5)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
    }

    useEffect(() => {
        updateArrows()

        const el = trackRef.current
        if (!el) return

        el.addEventListener('scroll', updateArrows, { passive: true })
        window.addEventListener('resize', updateArrows)

        return () => {
            el.removeEventListener('scroll', updateArrows)
            window.removeEventListener('resize', updateArrows)
        }
    }, [])

    const scroll = (direction: 1 | -1) => {
        trackRef.current?.scrollBy({
            left: direction * SCROLL_AMOUNT,
            behavior: 'smooth',
        })
    }

    return (
        <section className="bg-white border-b border-line">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-5 flex items-center gap-3">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll(-1)}
                    disabled={!canScrollLeft}
                    aria-label="Scroll left"
                    className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-faint transition hover:border-carbon hover:text-carbon disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Categories */}
                <div
                    ref={trackRef}
                    className="flex flex-1 gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {categories.map((category) => {
                        const Icon = category.icon
                        const isActive = activeCategory === category.name

                        return (
                            <button
                                key={category.name}
                                onClick={() => setActiveCategory(category.name)}
                                className={`group shrink-0 w-[150px] h-[128px] rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-3 ${isActive
                                    ? 'border-brand bg-brand-wash'
                                    : 'border-hairline bg-white hover:border-brand/40 hover:bg-brand-wash/50'
                                    }`}
                            >
                                <div
                                    className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-brand' : 'bg-surface'
                                        }`}
                                >
                                    <Icon
                                        size={24}
                                        strokeWidth={2.2}
                                        className={
                                            isActive
                                                ? 'text-white'
                                                : 'text-[#3d4552] group-hover:text-brand'
                                        }
                                    />
                                </div>

                                <span className="px-2 text-center text-[15px] font-semibold leading-tight text-carbon">
                                    {category.name}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll(1)}
                    disabled={!canScrollRight}
                    aria-label="Scroll right"
                    className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-faint transition hover:border-carbon hover:text-carbon disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </section>
    )
}
