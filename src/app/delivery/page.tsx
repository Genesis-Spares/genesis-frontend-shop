import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { V } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";
import { deliveryEta, getJSON, type DeliveryZone, type DeliveryZones } from "@/lib/api";

export const metadata: Metadata = {
    title: "Delivery Policy — Genesis Investment",
    description: "Same-day delivery in Nairobi and countrywide courier across Kenya. Fees, timings, tracking and pay-on-delivery.",
};

const ksh = (n: number) => (n === 0 ? "Free" : `KSh ${n.toLocaleString("en-KE")}`);
const title = (c: string) => c.replace(/\b\w/g, (m) => m.toUpperCase());

function where(z: DeliveryZone) {
    if (z.description) return z.description;
    if (!z.cities.length) return "All other towns";
    const shown = z.cities.slice(0, 6).map(title).join(", ");
    return z.cities.length > 6 ? `${shown} and more` : shown;
}

function fee(z: DeliveryZone) {
    const extras = [
        z.perKgFee > 0 ? `+ KSh ${z.perKgFee.toLocaleString("en-KE")} per kg over ${z.includedKg} kg` : null,
        z.freeAbove != null ? `free on orders over KSh ${z.freeAbove.toLocaleString("en-KE")}` : null,
    ].filter(Boolean);
    return (
        <>
            {ksh(z.fee)}
            {extras.map((e) => <span key={e} className="block text-[12.5px] text-faint">{e}</span>)}
        </>
    );
}

export default async function Page() {
    // live from the zone table the checkout prices with; static fallback if the API is down
    const live = await getJSON<DeliveryZones>("/checkout/delivery-zones", undefined, 300);
    const zones = live?.zones ?? [];
    const cod = zones.filter((z) => z.allowsCod).map((z) => z.name);

    return (
        <LegalPage
            path="/delivery"
            crumb="Delivery Policy"
            title="Delivery Policy"
            intro="Same-day in Nairobi, 2–3 business days countrywide — with tracking from our counter to your door."
            sections={[
                {
                    id: "options",
                    title: "Delivery options and fees",
                    body: (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
                                <thead>
                                    <tr className="border-b-2 border-line text-[12px] uppercase tracking-wide text-faint">
                                        <th className="py-2 pr-4 font-semibold">Option</th><th className="py-2 pr-4 font-semibold">Where</th><th className="py-2 pr-4 font-semibold">When</th><th className="py-2 font-semibold">Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {zones.length ? zones.map((z) => (
                                        <tr key={z.id} className="border-b border-line">
                                            <td className="py-3 pr-4 font-semibold text-carbon">{z.name}</td>
                                            <td className="py-3 pr-4">{where(z)}</td>
                                            <td className="py-3 pr-4">
                                                {deliveryEta(z)}
                                                {z.minDays === 0 && <> for orders confirmed before <V>{LEGAL.sameDayCutoff}</V></>}
                                            </td>
                                            <td className="py-3">{fee(z)}</td>
                                        </tr>
                                    )) : (
                                        <>
                                            <tr className="border-b border-line">
                                                <td className="py-3 pr-4 font-semibold text-carbon">Same-day delivery</td>
                                                <td className="py-3 pr-4">Nairobi</td>
                                                <td className="py-3 pr-4">Same day for orders confirmed before <V>{LEGAL.sameDayCutoff}</V>, otherwise next business day</td>
                                                <td className="py-3">{ksh(LEGAL.sameDayFee)}</td>
                                            </tr>
                                            <tr className="border-b border-line">
                                                <td className="py-3 pr-4 font-semibold text-carbon">Countrywide courier</td>
                                                <td className="py-3 pr-4">All counties via {LEGAL.couriers}</td>
                                                <td className="py-3 pr-4">{LEGAL.courierDays} after dispatch</td>
                                                <td className="py-3">{ksh(LEGAL.courierFee)}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                            <p className="mt-3">Your town decides the delivery option. The fee for your order — and VAT{live ? ` at ${live.vatRate}%` : ""}, which is added to the price of your parts{live?.vatOnShipping === false ? "" : " and delivery"} — is shown at checkout before you pay. Business days are Monday to Saturday, excluding public holidays.</p>
                        </div>
                    ),
                },
                {
                    id: "tracking",
                    title: "Tracking your order",
                    body: (
                        <p>We email you when your order is confirmed and again when it ships, with the courier or rider and tracking number. You can follow every step — including location updates — under <Link href="/account/orders">My orders</Link>.</p>
                    ),
                },
                {
                    id: "cod",
                    title: "Pay on delivery",
                    body: (
                        <p>Pay on delivery (cash or card on arrival) is available for {cod.length ? cod.join(", ") : "same-day orders within Nairobi"}. Please have the exact order total ready; the rider will confirm payment before handing over the parts. Orders that can&apos;t be paid for on arrival are returned to us and may be cancelled.</p>
                    ),
                },
                {
                    id: "receiving",
                    title: "Receiving your parts",
                    body: (
                        <ul>
                            <li>Someone must be available at the delivery address to receive the order. If no one is available, the courier will contact you to rearrange; repeated failed deliveries may be charged the delivery fee again.</li>
                            <li>Please check the package before signing. If it&apos;s visibly damaged, note it on the delivery slip or refuse it, and tell us within 24 hours with photos.</li>
                            <li>Risk in the parts passes to you on delivery; ownership passes once the order is paid in full.</li>
                        </ul>
                    ),
                },
                {
                    id: "delays",
                    title: "Delays",
                    body: (
                        <p>Delivery times are estimates. Occasionally weather, road conditions, courier delays or stock issues may hold an order up — if so we&apos;ll tell you, and you can cancel for a full refund if the order hasn&apos;t shipped. See our <Link href="/returns">Returns &amp; Refunds</Link> policy for returns and cancellations.</p>
                    ),
                },
            ]}
        />
    );
}
