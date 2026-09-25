import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { V } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
    title: "Returns & Refunds — Genesis Investment",
    description: `Return unfitted parts within ${LEGAL.returnDays} days. How returns, exchanges, warranty claims and refunds work at Genesis Investment.`,
};

export default function Page() {
    return (
        <LegalPage
            path="/returns"
            crumb="Returns & Refunds"
            title="Returns & Refunds"
            intro={`Ordered the wrong part, or it doesn't fit? Return unfitted parts within ${LEGAL.returnDays} days — here's exactly how it works.`}
            sections={[
                {
                    id: "window",
                    title: "Our return promise",
                    body: (
                        <>
                            <p>You can return most parts within <strong>{LEGAL.returnDays} days of delivery</strong> for an exchange or a full refund, as long as the part is:</p>
                            <ul>
                                <li><strong>Unfitted</strong> — not installed, bolted on, wired in, filled or run on a vehicle;</li>
                                <li>In its <strong>original, undamaged packaging</strong> with all labels, seals, accessories and paperwork;</li>
                                <li>Accompanied by your <strong>order number</strong> (it&apos;s in your confirmation email and under <Link href="/account/orders">My orders</Link>).</li>
                            </ul>
                            <p>If we sent the wrong part, or the part doesn&apos;t fit the vehicle you gave us when ordering, we&apos;ll exchange or refund it with no quibbles and we cover the return delivery.</p>
                        </>
                    ),
                },
                {
                    id: "exclusions",
                    title: "Items we can't take back",
                    body: (
                        <>
                            <p>For safety and hygiene reasons, and because some parts can&apos;t be resold once used, we can&apos;t accept returns of:</p>
                            <ul>
                                <li>Parts that have been fitted, installed or used — including parts removed after fitting;</li>
                                <li>Electrical and electronic parts (sensors, ECUs, modules, bulbs) once the sealed packaging is opened, unless faulty;</li>
                                <li>Fluids, oils, lubricants and chemicals once opened;</li>
                                <li>Special-order or custom-sourced parts, which we&apos;ll tell you about before you pay;</li>
                                <li>Parts damaged by incorrect installation, accident, misuse or normal wear.</li>
                            </ul>
                            <p>None of this affects your rights if a part is <strong>faulty or not as described</strong> — see Warranty below.</p>
                        </>
                    ),
                },
                {
                    id: "how",
                    title: "How to return a part",
                    body: (
                        <ol>
                            <li>Contact us within {LEGAL.returnDays} days on <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> or WhatsApp {LEGAL.whatsapp} with your order number, the part, and the reason (photos help).</li>
                            <li>We&apos;ll confirm the return and tell you how to send it back — drop-off at our Industrial Area counter, or collection/courier for orders outside Nairobi.</li>
                            <li>Once we receive the part we inspect it, usually within 2 business days, and email you the outcome.</li>
                        </ol>
                    ),
                },
                {
                    id: "refunds",
                    title: "Refunds",
                    body: (
                        <>
                            <p>Approved refunds go back to the <strong>original payment method</strong>:</p>
                            <ul>
                                <li><strong>M-Pesa</strong> — to the number that paid, usually within 1–3 business days of approval;</li>
                                <li><strong>Card</strong> — to the same card; your bank may take 5–10 business days to show it;</li>
                                <li><strong>Pay on delivery</strong> — by M-Pesa to the phone number on the order.</li>
                            </ul>
                            <p>We refund the price of the returned part. The original delivery fee is refunded when the return is our fault (wrong, faulty or non-fitting part), and for cancelled orders that hadn&apos;t shipped. For change-of-mind returns the customer covers the return delivery.</p>
                            <p>We&apos;ll email you when your refund has been issued.</p>
                        </>
                    ),
                },
                {
                    id: "cancellations",
                    title: "Cancelling an order",
                    body: (
                        <p>You can cancel free of charge any time before your order is dispatched — contact us with your order number. Paid orders are refunded in full as above. Once an order has shipped it can no longer be cancelled, but you can return it under this policy.</p>
                    ),
                },
                {
                    id: "warranty",
                    title: "Warranty and faulty parts",
                    body: (
                        <>
                            <p>We sell genuine and OEM parts, many of which carry a manufacturer&apos;s warranty of up to <strong>{LEGAL.maxWarrantyYears} years</strong>. The warranty period for each part is shown on the product page or its packaging.</p>
                            <p>If a part is faulty, tell us as soon as you notice. We&apos;ll arrange inspection with the manufacturer or supplier and then repair, replace or refund the part. Warranties don&apos;t cover wear and tear, incorrect fitting, accident, misuse, or use on a vehicle the part wasn&apos;t specified for. Keep your order confirmation as proof of purchase.</p>
                            <p>These promises are in addition to your rights under the Consumer Protection Act, 2012, which are not affected.</p>
                        </>
                    ),
                },
                {
                    id: "business",
                    title: "Who you're dealing with",
                    body: (
                        <p>{LEGAL.tradingName} is a trading name of <V>{LEGAL.legalName}</V>, registration no. <V>{LEGAL.registrationNo}</V>, <V>{LEGAL.address}</V>.</p>
                    ),
                },
            ]}
        />
    );
}
