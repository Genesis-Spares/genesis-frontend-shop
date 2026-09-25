'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const images = [
    '/products/oil-filter-1.png',
    '/products/oil-filter-2.png',
    '/products/oil-filter-3.png',
    '/products/battery.png',
]

export default function ProductGallery() {
    const [active, setActive] = useState(images[0])

    return (
        <div>
            <div className="relative flex h-[520px] items-center justify-center rounded-2xl border border-hairline bg-surface">
                <Image
                    src={active}
                    alt="Oil Filter"
                    width={520}
                    height={520}
                    className="object-contain"
                />

                <button className="absolute left-4 rounded-full border border-line-strong bg-white p-2 text-mutedink hover:text-carbon hover:border-carbon transition">
                    <ChevronLeft size={24} />
                </button>

                <button className="absolute right-4 rounded-full border border-line-strong bg-white p-2 text-mutedink hover:text-carbon hover:border-carbon transition">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((image) => (
                    <button
                        key={image}
                        onClick={() => setActive(image)}
                        className={`flex h-24 items-center justify-center rounded-xl border bg-white p-2 transition ${active === image
                            ? 'border-brand ring-1 ring-brand'
                            : 'border-hairline hover:border-line-strong'
                            }`}
                    >
                        <Image
                            src={image}
                            alt="Product thumbnail"
                            width={90}
                            height={90}
                            className="object-contain"
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}
