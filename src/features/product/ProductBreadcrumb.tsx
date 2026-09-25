import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function ProductBreadcrumb() {
    return (
        <div className="mb-6 flex items-center gap-2 text-[12.5px] text-faint">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="hover:text-brand">Shop</Link>
            <ChevronRight size={14} />
            <Link href="/shop/filters" className="hover:text-brand">Filters</Link>
            <ChevronRight size={14} />
            <span className="font-medium text-carbon">Oil Filter</span>
        </div>
    )
}
