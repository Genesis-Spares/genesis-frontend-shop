'use client'

import { useState } from 'react'
import {
    Heart,
    Minus,
    Plus,
    ShoppingCart,
    ShieldCheck,
    ThumbsUp,
    Clock,
    CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ProductInfo() {
    const [quantity, setQuantity] = useState(1)

    return (
        <div>
            <span className="eyebrow">Filters</span>
            <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-carbon mt-1">Oil Filter</h1>
            <p className="mt-1 text-sm text-faint tnum">OF-1234</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="text-brand tracking-[1px]">★★★★★</span>
                <span className="text-faint">(128 Reviews)</span>
                <span className="flex items-center gap-1 font-semibold text-stock">
                    <CheckCircle size={15} /> In Stock
                </span>
            </div>

            <p className="mt-5 font-display text-3xl font-extrabold text-carbon tnum">KSh 850</p>

            <p className="mt-4 max-w-xl text-sm leading-6 text-mutedink">
                High quality oil filter designed to ensure optimal engine
                performance by removing contaminants and protecting your engine.
            </p>

            <div className="mt-5 space-y-3 text-sm text-[#3d4552]">
                <Feature icon={ShieldCheck} text="Premium quality filtration" />
                <Feature icon={ThumbsUp} text="Enhances engine performance" />
                <Feature icon={Clock} text="Longer engine life" />
                <Feature icon={CheckCircle} text="Easy installation" />
            </div>

            <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-medium text-carbon">Quantity:</span>

                <div className="flex items-center rounded-lg border border-line-strong">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2.5 text-mutedink hover:text-carbon"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="px-4 text-sm tnum">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2.5 text-mutedink hover:text-carbon"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <Button className="h-12 flex-1 bg-brand hover:bg-brand-hover text-white">
                    <ShoppingCart size={18} />
                    Add to Cart
                </Button>

                <Button variant="outline" size="icon" className="h-12 w-12">
                    <Heart size={20} />
                </Button>
            </div>

            <Button variant="outline" className="mt-3 h-12 w-full">
                Buy Now
            </Button>

            <Card className="mt-6 space-y-3 border-0 p-0 text-sm shadow-none ring-0">
                <Meta label="SKU:" value="OF-1234" />
                <Meta label="Category:" value="Filters" active />
                <Meta label="Brand:" value="Toyota" />
                <Meta label="Tags:" value="Oil Filter, Engine, Toyota" />
            </Card>
        </div>
    )
}

function Feature({ icon: Icon, text }: any) {
    return (
        <div className="flex items-center gap-2">
            <Icon size={17} className="text-brand" />
            <span>{text}</span>
        </div>
    )
}

function Meta({
    label,
    value,
    active,
}: {
    label: string
    value: string
    active?: boolean
}) {
    return (
        <div className="flex gap-3">
            <span className="w-20 text-faint">{label}</span>
            <span className={active ? 'text-brand-ink font-medium' : 'text-[#3d4552]'}>
                {value}
            </span>
        </div>
    )
}
