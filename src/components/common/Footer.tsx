import Link from "next/link";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"
import Logo from "./Logo";

export default function Footer() {
    const cols: { title: string; links: [string, string][] }[] = [
        {
            title: "QUICK LINKS",
            links: [["Home", "/"], ["Shop", "/shop"], ["About Us", "/about-us"], ["Services", "/services"], ["Contact Us", "/contact-us"]],
        },
        {
            title: "CUSTOMER SERVICE",
            links: [["Track Order", "/account/orders"], ["Returns & Refunds", "/returns"], ["Delivery Policy", "/delivery"], ["Terms & Conditions", "/terms"], ["Privacy Policy", "/privacy"]],
        },
        {
            title: "MY ACCOUNT",
            links: [["Login / Register", "/account/login"], ["My Orders", "/account/orders"], ["Wishlist", "/wishlist"], ["Account Settings", "/account/profile"]],
        },
    ];

    return (
        <footer className="bg-carbon text-[#9ba3af] pt-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] gap-8 pb-10">
                <div>
                    <Logo dark withMark />
                    <p className="text-[13px] mt-4 leading-relaxed max-w-[230px]">
                        Your trusted partner for quality motor vehicle spare parts, delivered across Kenya.
                    </p>
                    <div className="flex items-center gap-3 mt-5">
                        {[FaFacebookF, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-9 h-9 rounded-full bg-carbon-soft flex items-center justify-center hover:bg-brand transition-colors"
                            >
                                <Icon size={14} className="text-white" />
                            </a>
                        ))}
                    </div>
                </div>

                {cols.map((c) => (
                    <div key={c.title}>
                        <h5 className="text-[#e7e9ee] text-[13.5px] font-semibold mb-4">{c.title}</h5>
                        <ul className="space-y-2.5 text-[13px]">
                            {c.links.map(([label, href]) => (
                                <li key={label}>
                                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h5 className="text-[#e7e9ee] text-[13.5px] font-semibold mb-4">CONTACT US</h5>
                    <ul className="space-y-3 text-[13px]">
                        <li className="flex items-center gap-2"><Phone size={13} className="text-brand" /> 0720 123 456</li>
                        <li className="flex items-center gap-2"><Phone size={13} className="text-brand" /> 0711 987 654</li>
                        <li className="flex items-center gap-2"><MessageCircle size={13} className="text-brand" /> info@genesisinvestment.co.ke</li>
                        <li className="flex items-center gap-2"><MapPin size={13} className="text-brand" /> Nairobi, Kenya</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-[#262a33] py-5">
                <p className="text-center text-[12px] text-[#727a87]">
                    © {new Date().getFullYear()} Genesis Investment. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
