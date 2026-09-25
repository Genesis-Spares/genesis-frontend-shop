import { formatKSh } from "@/libs/utils";

const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
    PENDING: { label: "Pending", cls: "bg-[#fff6e6] text-[#9a5b00]", dot: "bg-[#e89a2c]" },
    CONFIRMED: { label: "Confirmed", cls: "bg-[#eaf1fc] text-[#1f5fb8]", dot: "bg-[#2c6ecb]" },
    PROCESSING: { label: "Processing", cls: "bg-[#eaf1fc] text-[#1f5fb8]", dot: "bg-[#2c6ecb]" },
    SHIPPED: { label: "Shipped", cls: "bg-brand-wash text-brand-ink", dot: "bg-brand" },
    DELIVERED: { label: "Delivered", cls: "bg-stock-wash text-stock", dot: "bg-stock" },
    CANCELLED: { label: "Cancelled", cls: "bg-surface-2 text-mutedink", dot: "bg-faint" },
    REFUNDED: { label: "Refunded", cls: "bg-surface-2 text-mutedink", dot: "bg-faint" },
};

const PAYMENT: Record<string, { label: string; cls: string }> = {
    PAID: { label: "Paid", cls: "text-stock" },
    PENDING: { label: "Unpaid", cls: "text-[#9a5b00]" },
    FAILED: { label: "Failed", cls: "text-[#b23b32]" },
    REFUNDED: { label: "Refunded", cls: "text-mutedink" },
    PARTIALLY_REFUNDED: { label: "Part refunded", cls: "text-mutedink" },
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
    mpesa: "M-PESA",
    card: "Card",
    cod: "Pay on delivery",
};

/** Fulfilment steps shown on the order tracker, in order. */
export const TRACK_STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export function StatusBadge({ status }: { status: string }) {
    const s = STATUS[status] ?? { label: status, cls: "bg-surface-2 text-mutedink", dot: "bg-faint" };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${s.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
        </span>
    );
}

export function PaymentLabel({ status }: { status: string }) {
    const p = PAYMENT[status] ?? { label: status, cls: "text-mutedink" };
    return <span className={`font-semibold ${p.cls}`}>{p.label}</span>;
}

export const statusLabel = (s: string) => STATUS[s]?.label ?? s;

export const money = (v: string | number | null | undefined) => formatKSh(Number(v ?? 0));

export const orderDate = (iso: string, withTime = false) =>
    new Date(iso).toLocaleString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
