'use client'

import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

export default function AccountLink() {
    const { user, ready } = useAuth();
    const name = user ? user.firstName || user.email?.split("@")[0] : null;
    return (
        <Link
            href={user ? "/account" : "/account/login"}
            className="flex items-center gap-2 text-sm text-[#3d4552] hover:text-brand transition-colors"
        >
            <User size={20} />
            <span className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold text-carbon">{user ? "My Account" : "Account"}</span>
                <span className="text-[11px] text-faint">
                    {ready ? (name ? `Hi, ${name}` : "Login / Register") : " "}
                </span>
            </span>
        </Link>
    );
}
