import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { V } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
    title: "Privacy Policy — Genesis Investment",
    description: "How Genesis Investment collects, uses and protects your personal data under Kenya's Data Protection Act, 2019.",
};

export default function Page() {
    return (
        <LegalPage
            path="/privacy"
            crumb="Privacy Policy"
            title="Privacy Policy"
            intro="What personal data we collect when you shop with us, why, who we share it with, and the rights you have under Kenya's Data Protection Act, 2019."
            sections={[
                {
                    id: "who",
                    title: "Who we are",
                    body: (
                        <p><V>{LEGAL.legalName}</V>, trading as {LEGAL.tradingName}, of <V>{LEGAL.address}</V>, is the <strong>data controller</strong> for personal data collected through this website. We are registered with the Office of the Data Protection Commissioner (ODPC) under no. <V>{LEGAL.odpcRegistration}</V>. Our data protection contact is <V>{LEGAL.dpoName}</V>, reachable at <V>{LEGAL.privacyEmail}</V>.</p>
                    ),
                },
                {
                    id: "collect",
                    title: "What we collect",
                    body: (
                        <ul>
                            <li><strong>Account details</strong> — name, email address, phone number and password (stored only in encrypted, hashed form — we can&apos;t read it).</li>
                            <li><strong>Order details</strong> — the parts you buy, delivery address and nearest landmark, delivery option, payment method and payment status, and messages about your order.</li>
                            <li><strong>Cart and wishlist</strong> — the parts you save, kept with your account while you&apos;re signed in so you can pick up where you left off on any device.</li>
                            <li><strong>Enquiries</strong> — what you send us through the contact form, email, phone or WhatsApp.</li>
                            <li><strong>Security data</strong> — your IP address and browser type when you sign in, used to protect your account and detect misuse.</li>
                        </ul>
                    ),
                },
                {
                    id: "use",
                    title: "How we use it, and our legal basis",
                    body: (
                        <ul>
                            <li><strong>To process and deliver your orders</strong>, take payment, handle returns and warranty claims — necessary to perform our contract with you.</li>
                            <li><strong>To keep you updated</strong> about your order by email and SMS (confirmation, dispatch, delivery, cancellations, refunds) — part of performing the contract.</li>
                            <li><strong>To run your account</strong> — sign-in, verification codes, password resets and account security — contract and our legitimate interest in preventing fraud.</li>
                            <li><strong>To meet legal obligations</strong> — tax and accounting records required by the Kenya Revenue Authority.</li>
                            <li><strong>Marketing</strong> — we only send promotional messages if you&apos;ve opted in, and you can opt out at any time.</li>
                        </ul>
                    ),
                },
                {
                    id: "share",
                    title: "Who we share it with",
                    body: (
                        <>
                            <p>We never sell your personal data. We share only what&apos;s needed with service providers who process it on our behalf under contract:</p>
                            <ul>
                                <li><strong>Delivery partners</strong> ({LEGAL.couriers} and our riders) — your name, phone number and delivery address;</li>
                                <li><strong>Payment providers</strong> (M-Pesa, card processor) — to take and refund payments;</li>
                                <li><strong>Email and SMS providers</strong> — to send order and account messages;</li>
                                <li><strong>Hosting and IT providers</strong> — to run this website securely;</li>
                                <li><strong>Authorities</strong> — where the law requires it, such as the Kenya Revenue Authority or a court order.</li>
                            </ul>
                            <p>Some providers may store data outside Kenya. Where they do, we use providers that give appropriate safeguards for your data as required by the Data Protection Act, 2019.</p>
                        </>
                    ),
                },
                {
                    id: "retention",
                    title: "How long we keep it",
                    body: (
                        <ul>
                            <li>Order and payment records: <strong>7 years</strong>, as required for tax and accounting.</li>
                            <li>Account details, cart and wishlist: while your account is open, and deleted or anonymised within 90 days of you asking us to close it (except order records we must keep).</li>
                            <li>Sign-in security logs: up to 12 months.</li>
                            <li>Enquiries: up to 2 years after we&apos;ve resolved them.</li>
                        </ul>
                    ),
                },
                {
                    id: "rights",
                    title: "Your rights",
                    body: (
                        <>
                            <p>Under the Data Protection Act, 2019 you have the right to:</p>
                            <ul>
                                <li>be informed about how your data is used (this policy);</li>
                                <li>access the personal data we hold about you;</li>
                                <li>correct inaccurate or incomplete data — you can update most details yourself under <Link href="/account/profile">Profile &amp; settings</Link>;</li>
                                <li>have your data deleted, where we no longer need to keep it;</li>
                                <li>object to or restrict our use of your data, including for marketing;</li>
                                <li>receive your data in a portable format.</li>
                            </ul>
                            <p>To use any of these rights, email <V>{LEGAL.privacyEmail}</V>. We&apos;ll respond within the time the law requires. If you&apos;re unhappy with how we&apos;ve handled your data, you can complain to the Office of the Data Protection Commissioner at <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer">odpc.go.ke</a>.</p>
                        </>
                    ),
                },
                {
                    id: "storage",
                    title: "Cookies and browser storage",
                    body: (
                        <p>We don&apos;t use advertising or tracking cookies. Your browser stores a small amount of data that the site needs to work — your sign-in session and your cart — which you can clear at any time in your browser settings. If we add analytics in future, we&apos;ll update this policy and ask for your consent where required.</p>
                    ),
                },
                {
                    id: "security",
                    title: "How we protect it",
                    body: (
                        <p>We use encrypted connections, hashed passwords, verification codes, role-based access for our staff, and sign out every device when you reset your password. No system is perfectly secure, but if a breach affecting your data occurs we&apos;ll notify you and the ODPC as the law requires.</p>
                    ),
                },
                {
                    id: "changes",
                    title: "Changes to this policy",
                    body: (
                        <p>We may update this policy as our services change. The date at the top shows when it was last updated; for significant changes we&apos;ll also let you know by email.</p>
                    ),
                },
            ]}
        />
    );
}
