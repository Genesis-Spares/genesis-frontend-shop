import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { V } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
    title: "Terms & Conditions — Genesis Investment",
    description: "The terms that apply when you use the Genesis Investment website and buy spare parts from us.",
};

export default function Page() {
    return (
        <LegalPage
            path="/terms"
            crumb="Terms & Conditions"
            title="Terms & Conditions"
            intro="The agreement between you and Genesis Investment when you use this website and buy parts from us. Please read it before ordering."
            sections={[
                {
                    id: "about",
                    title: "About us and these terms",
                    body: (
                        <>
                            <p>This website is operated by <V>{LEGAL.legalName}</V> (&ldquo;{LEGAL.tradingName}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a company registered in Kenya under no. <V>{LEGAL.registrationNo}</V>, KRA PIN <V>{LEGAL.kraPin}</V>, of <V>{LEGAL.address}</V>, <V>{LEGAL.postal}</V>.</p>
                            <p>These terms apply to every order you place with us. By creating an account or placing an order you agree to them, together with our <Link href="/privacy">Privacy Policy</Link>, <Link href="/returns">Returns &amp; Refunds</Link> and <Link href="/delivery">Delivery Policy</Link>. Nothing in these terms limits your rights under the Consumer Protection Act, 2012 or other Kenyan law.</p>
                        </>
                    ),
                },
                {
                    id: "account",
                    title: "Your account",
                    body: (
                        <ul>
                            <li>You need an account to order. You must be 18 or older and give accurate details, including a phone number and delivery address we can reach.</li>
                            <li>Keep your password private — you&apos;re responsible for orders placed through your account. Tell us straight away if you think someone else has used it.</li>
                            <li>We may suspend accounts used for fraud, abuse or in breach of these terms.</li>
                        </ul>
                    ),
                },
                {
                    id: "fitment",
                    title: "Choosing the right part",
                    body: (
                        <>
                            <p>We work hard to publish accurate part numbers and vehicle fitment, but vehicles vary by year, engine, market and trim. <strong>Please check the part number or fitment against your vehicle, or ask us before ordering</strong> — our team will confirm fitment on request.</p>
                            <p>We recommend that parts are fitted by a qualified mechanic. We&apos;re not responsible for loss or damage caused by incorrect installation.</p>
                        </>
                    ),
                },
                {
                    id: "orders",
                    title: "Orders and acceptance",
                    body: (
                        <>
                            <p>When you place an order you&apos;re making an offer to buy. We accept it when we confirm the order by email — that&apos;s when the contract between us is formed. Stock is reserved for your order at that point.</p>
                            <p>We may decline or cancel an order — for example if a part is unavailable, a price or description was clearly wrong, or we suspect fraud. If we cancel, we&apos;ll tell you and refund anything you&apos;ve paid in full.</p>
                        </>
                    ),
                },
                {
                    id: "prices",
                    title: "Prices and payment",
                    body: (
                        <ul>
                            <li>Prices are in Kenya Shillings (KSh) and include VAT where applicable. Delivery fees are shown at checkout before you pay.</li>
                            <li>The price you pay is the price shown when you place the order. If a price is obviously wrong, we&apos;ll contact you before dispatch and you can cancel for a full refund.</li>
                            <li>We accept M-Pesa, debit and credit cards, and pay-on-delivery where offered. Card and M-Pesa payments are handled by our payment providers; we never see or store your full card details or M-Pesa PIN.</li>
                        </ul>
                    ),
                },
                {
                    id: "delivery",
                    title: "Delivery",
                    body: (
                        <p>We deliver across Kenya as set out in our <Link href="/delivery">Delivery Policy</Link>. Delivery times are estimates. Risk passes to you on delivery, and ownership once you&apos;ve paid in full.</p>
                    ),
                },
                {
                    id: "returns",
                    title: "Cancellations, returns and warranty",
                    body: (
                        <p>You can cancel before dispatch and return unfitted parts within {LEGAL.returnDays} days, and faulty parts are covered by warranty — see <Link href="/returns">Returns &amp; Refunds</Link> for the full details.</p>
                    ),
                },
                {
                    id: "liability",
                    title: "Our responsibility to you",
                    body: (
                        <>
                            <p>If we fail to meet these terms we&apos;re responsible for loss you suffer that is a foreseeable result of our failure, up to the value of the order concerned. We&apos;re not responsible for loss that wasn&apos;t foreseeable, for business losses (such as lost profit or vehicle downtime), or for loss caused by incorrect fitting, misuse, or events outside our reasonable control.</p>
                            <p>Nothing in these terms excludes liability for death or personal injury caused by our negligence, for fraud, or any other liability that can&apos;t be excluded under Kenyan law.</p>
                        </>
                    ),
                },
                {
                    id: "site",
                    title: "Using this website",
                    body: (
                        <ul>
                            <li>Content on this site — text, photos, logos and product data — belongs to us or our suppliers and may not be copied for commercial use without permission. Brand names belong to their respective manufacturers.</li>
                            <li>Don&apos;t misuse the site: no scraping, automated ordering, attempts to break security, or fraudulent orders.</li>
                            <li>We may update the site and these terms. The version that applies to your order is the one on the site when you place it.</li>
                        </ul>
                    ),
                },
                {
                    id: "law",
                    title: "Disputes and governing law",
                    body: (
                        <p>These terms are governed by the laws of Kenya. If you have a complaint, please contact us first at <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> — we aim to resolve it within 14 days. If we can&apos;t, the courts of Kenya have jurisdiction, and you may also contact the Competition Authority of Kenya about consumer matters.</p>
                    ),
                },
            ]}
        />
    );
}
