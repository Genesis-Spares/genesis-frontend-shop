import { Menu } from "lucide-react";
import Link from "next/link";

export default function NavBar({ activeTab = "Home" }: { activeTab?: string }) {
    const links = ["Home", "Shop", "About Us", "Services", "Brands", "Special Offers", "Contact Us"];

    const getSlug = (link: string) => {
        if (link === "Home") return "/";
        return `/${link.toLowerCase().replace(/\s+/g, "-")}`;
    };

    return (
        <div className="bg-white border-b border-line">
            <div className="max-w-[1400px] mx-auto flex items-center gap-8 px-4 sm:px-6">
                <button className="bg-carbon hover:bg-carbon-soft transition-colors text-white text-[13.5px] font-bold px-5 py-3 rounded-xl my-2.5 flex items-center gap-2">
                    <Menu size={16} /> ALL CATEGORIES
                </button>
                <nav className="hidden md:flex items-center gap-7 text-[13.5px] text-[#3d4552] font-medium">
                    {links.map((l) => (
                        <Link
                            key={l}
                            href={getSlug(l)}
                            className={`py-4 border-b-2 transition-colors ${l === activeTab
                                ? "text-carbon border-brand font-semibold"
                                : l === "Special Offers"
                                    ? "text-brand-ink font-semibold border-transparent hover:border-brand"
                                    : "border-transparent hover:text-carbon hover:border-line-strong"
                                }`}
                        >
                            {l}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
