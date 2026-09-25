import { MapPin, Phone, MessageCircle } from "lucide-react";

export default function TopBar() {
    return (
        <div className="bg-carbon text-[#aeb6c2] text-[12.5px]">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-6 h-10">
                <div className="hidden sm:flex items-center gap-6">
                    <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand" /> Delivering Across Kenya
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-brand" /> Call Us: 0720 123 456
                    </span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 ml-auto">
                    <a href="#" className="flex items-center gap-1.5 text-[#c7cdd7] hover:text-white transition-colors">
                        <MessageCircle size={13} className="text-brand" /> WhatsApp Us
                    </a>
                    <a href="#" className="hidden sm:flex items-center gap-1.5 text-[#c7cdd7] hover:text-white transition-colors">
                        Track Order
                    </a>
                    <a href="#" className="hidden sm:flex items-center gap-1.5 text-[#c7cdd7] hover:text-white transition-colors">
                        Help Center
                    </a>
                    <a href="#" className="text-brand font-semibold hover:text-white transition-colors">
                        Admin
                    </a>
                </div>
            </div>
        </div>
    );
}
