'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function ShopHero() {
    return (
        <section className="bg-carbon px-4 sm:px-6">
            <div className="mx-auto max-w-[1400px]">
                <div className="relative h-[200px] w-full overflow-hidden">
                    <Image
                        src="/spare-parts-hero.png"
                        alt="Automotive spare parts"
                        fill
                        priority
                        className="object-cover object-center"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#14161c] via-[#14161c]/75 to-[#14161c]/10 z-10" />
                    <div
                        className="absolute inset-0 z-10 opacity-70"
                        style={{ background: "radial-gradient(circle at 82% 40%, rgba(228,83,31,0.20), transparent 55%)" }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex h-full flex-col justify-center px-6 sm:px-8">
                        <span className="eyebrow text-brand mb-2">Genesis Investment</span>
                        <h1 className="font-display max-w-[460px] text-2xl font-extrabold uppercase leading-tight tracking-[-0.02em] text-white sm:text-3xl">
                            Quality Spare Parts <br />
                            For{' '}
                            <span className="text-brand">
                                Every Journey
                            </span>
                        </h1>

                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-white">
                            <Link href="/" className="hover:text-brand">
                                Home
                            </Link>
                            <ChevronRight size={14} className="text-[#9ba3af]" />
                            <span className="text-[#c7cdd7]">Shop</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
