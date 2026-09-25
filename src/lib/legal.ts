/**
 * Business facts quoted in the legal pages (/terms, /privacy, /returns, /delivery).
 *
 * Values wrapped in [square brackets] are PLACEHOLDERS — they render highlighted
 * on the site until replaced. Fill every one in (and have a Kenyan advocate review
 * the pages) before launch.
 *
 * Commercial terms (fees, return window, warranty) must match what checkout and
 * the marketing pages promise — if you change them here, change them there too.
 */
export const LEGAL = {
    lastUpdated: "25 September 2026",

    // ── company ────────────────────────────────────────────
    tradingName: "Genesis Investment",
    legalName: "[Registered company name, e.g. Genesis Investment Limited]",
    registrationNo: "[Company registration no. (PVT-…)]",
    kraPin: "[KRA PIN]",
    address: "[Physical address, e.g. Plot no., Road], Industrial Area, Nairobi",
    postal: "[P.O. Box …-00100, Nairobi]",

    // ── contact (as shown in the site header/footer) ───────
    email: "info@genesisinvestment.co.ke",
    phone: "0720 123 456",
    whatsapp: "0720 123 456",
    hours: "Monday–Saturday, 8am–6pm",

    // ── data protection (Kenya Data Protection Act, 2019) ──
    privacyEmail: "[privacy@genesisinvestment.co.ke]",
    dpoName: "[Data Protection Officer name or role]",
    odpcRegistration: "[ODPC registration no. — register at odpc.go.ke]",

    // ── commercial terms (match checkout & marketing copy) ─
    returnDays: 7,
    maxWarrantyYears: 2,
    sameDayFee: 0,
    courierFee: 450,
    courierDays: "2–3 business days",
    sameDayCutoff: "[same-day order cut-off time, e.g. 2pm]",
    couriers: "G4S and Wells Fargo",
} as const;

/** True for values still waiting to be filled in. */
export const isPlaceholder = (v: string) => v.startsWith("[") || v.includes("[");
