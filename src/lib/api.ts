/**
 * Storefront API client.
 *
 * Talks to the Genesis backend's PUBLIC storefront surface
 * (api-gateway → /api/storefront/*), which needs no auth. All calls are
 * resilient: if the backend is unreachable or returns an error, helpers
 * return null / [] so pages can fall back to placeholder content instead of
 * crashing the render.
 */

export const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:11000/api";

/**
 * Server-rendered pages may need a different address than browsers (e.g. the
 * gateway's name inside a Docker network); set API_INTERNAL_URL for that.
 */
const SERVER_API_BASE = process.env.API_INTERNAL_URL?.replace(/\/$/, "") || API_BASE;

// ---------- backend shapes ----------
export interface ApiImage {
    url: string;
    alt?: string;
    isPrimary?: boolean;
    order?: number;
}

export interface ApiFitment {
    make: string;
    model: string;
    yearFrom?: number | null;
    yearTo?: number | null;
    engine?: string | null;
    notes?: string | null;
}

export interface ApiPartNumber {
    number: string;
    normalized?: string;
    type: "OE" | "MANUFACTURER" | "AFTERMARKET";
    brand?: string | null;
}

export interface ApiProduct {
    id: string;
    sku: string;
    name: string;
    slug: string;
    description?: string | null;
    brand?: string | null;
    price: number | string;
    comparePrice?: number | string | null;
    stockQty: number;
    minStockQty?: number | null;
    isInStock: boolean;
    isActive: boolean;
    categoryId?: string | null;
    compatibility?: string | null;
    isUniversal?: boolean;
    fitments?: ApiFitment[];
    partNumbers?: ApiPartNumber[];
    tags?: string[];
    metaKeywords?: string[];
    images?: ApiImage[];
    attributes?: { name: string; value: string }[];
    averageRating?: number;
    reviewCount?: number;
    createdAt?: string;
}

export interface ApiCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
    parentId?: string | null;
    children?: ApiCategory[];
    productCount?: number;
}

export interface Paginated<T> {
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ProductQuery {
    search?: string;
    categoryId?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: "price" | "name" | "createdAt" | "popularity" | "rating";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
    /** vehicle finder: parts that fit (plus universal parts) */
    make?: string;
    model?: string;
    year?: number;
}

// ---------- low-level fetch ----------
export async function getJSON<T>(
    path: string,
    params?: Record<string, unknown>,
    revalidate = 60,
): Promise<T | null> {
    let url = `${typeof window === "undefined" ? SERVER_API_BASE : API_BASE}${path}`;
    if (params) {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
        }
        const s = qs.toString();
        if (s) url += `?${s}`;
    }
    try {
        const res = await fetch(url, { next: { revalidate } });
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        // backend down / network error — caller falls back to placeholders
        return null;
    }
}

// Some services wrap payloads; normalize `{data, meta}` vs a bare array/object.
function asList<T>(res: Paginated<T> | T[] | { data?: T[] } | null): {
    items: T[];
    meta?: Paginated<T>["meta"];
} {
    if (!res) return { items: [] };
    if (Array.isArray(res)) return { items: res };
    if ("data" in res && Array.isArray((res as Paginated<T>).data)) {
        return { items: (res as Paginated<T>).data, meta: (res as Paginated<T>).meta };
    }
    return { items: [] };
}

// ---------- public API ----------
export const storefront = {
    async listProducts(query?: ProductQuery) {
        const res = await getJSON<Paginated<ApiProduct>>("/storefront/products", query as Record<string, unknown>);
        return asList<ApiProduct>(res);
    },
    async productBySlug(slug: string) {
        return getJSON<ApiProduct>(`/storefront/products/slug/${encodeURIComponent(slug)}`);
    },
    async productById(id: string) {
        return getJSON<ApiProduct>(`/storefront/products/${encodeURIComponent(id)}`);
    },
    async search(q: string, limit = 20) {
        const res = await getJSON<Paginated<ApiProduct> | ApiProduct[]>("/storefront/products/search", { q, limit });
        return asList<ApiProduct>(res).items;
    },
    async byCategory(categoryId: string, page = 1, limit = 20) {
        const res = await getJSON<Paginated<ApiProduct>>(`/storefront/products/category/${categoryId}`, { page, limit });
        return asList<ApiProduct>(res);
    },
    async categories() {
        const res = await getJSON<ApiCategory[] | Paginated<ApiCategory>>("/storefront/categories");
        return asList<ApiCategory>(res).items;
    },
    async categoryTree() {
        const res = await getJSON<ApiCategory[]>("/storefront/categories/tree");
        return Array.isArray(res) ? res : asList<ApiCategory>(res).items;
    },
};

// ---------- UI mapping ----------
export interface CardProduct {
    id: string;
    sku: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    comparePrice?: number;
    stock: "In Stock" | "Low Stock" | "Out of Stock";
    rating: number;
    reviews: number;
    image: string;
}

const LOW_STOCK_THRESHOLD = 10;

/** Map a backend product onto the shape the storefront cards/pages expect. */
export function toCard(p: ApiProduct): CardProduct {
    const primary = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];
    const stockQty = Number(p.stockQty ?? 0);
    const stock: CardProduct["stock"] =
        !p.isInStock || stockQty <= 0
            ? "Out of Stock"
            : stockQty <= (p.minStockQty || LOW_STOCK_THRESHOLD)
                ? "Low Stock"
                : "In Stock";
    return {
        id: p.id,
        sku: p.sku,
        slug: p.slug || p.sku,
        name: p.name,
        brand: p.brand ?? "",
        price: Number(p.price),
        comparePrice: p.comparePrice != null ? Number(p.comparePrice) : undefined,
        stock,
        rating: Math.round((p.averageRating ?? 0) * 10) / 10,
        reviews: p.reviewCount ?? 0,
        image: primary?.url ?? "",
    };
}

export interface ProductDetail extends CardProduct {
    description: string;
    stockQty: number;
    images: string[];
    attributes: { name: string; value: string }[];
    tags: string[];
    compatibility: string;
    isUniversal: boolean;
    fitments: ApiFitment[];
    partNumbers: ApiPartNumber[];
}

/** Map a backend product onto the full product-detail shape. */
export function toDetail(p: ApiProduct): ProductDetail {
    const card = toCard(p);
    const images = (p.images ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((i) => i.url)
        .filter(Boolean);
    return {
        ...card,
        description: p.description ?? "",
        stockQty: Number(p.stockQty ?? 0),
        images: images.length ? images : card.image ? [card.image] : [],
        attributes: p.attributes ?? [],
        tags: p.tags ?? [],
        compatibility: p.compatibility ?? "",
        isUniversal: !!p.isUniversal,
        fitments: p.fitments ?? [],
        partNumbers: p.partNumbers ?? [],
    };
}

// ============================================================
// Auth + authenticated requests (shopper accounts, wishlist)
// ============================================================

export interface AuthUser {
    id?: string;
    sub?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    permissions?: string[];
    emailVerified?: boolean;
    phone?: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

/** Thrown by apiCall — carries the HTTP status and the backend's machine-readable `error` code. */
export class ApiError extends Error {
    constructor(message: string, public status: number, public code?: string) {
        super(message);
        this.name = "ApiError";
    }
}

async function apiCall<T>(
    path: string,
    opts: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: opts.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        cache: "no-store",
    });
    let data: any = null;
    try {
        data = await res.json();
    } catch {
        /* empty body */
    }
    if (!res.ok) {
        const msg = data?.message
            ? Array.isArray(data.message)
                ? data.message.join(", ")
                : data.message
            : `Request failed (${res.status})`;
        throw new ApiError(msg, res.status, typeof data?.error === "string" ? data.error : undefined);
    }
    return data as T;
}

export const authApi = {
    register: (body: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
        apiCall<any>("/auth/register", { method: "POST", body }),
    verifyEmail: (email: string, code: string) =>
        apiCall<any>("/auth/verify-email", { method: "POST", body: { email, code, type: "REGISTER" } }),
    resendOtp: (email: string) =>
        apiCall<any>("/auth/resend-otp", { method: "POST", body: { email, type: "REGISTER" } }),
    login: (email: string, password: string) =>
        apiCall<Tokens>("/auth/login", { method: "POST", body: { email, password } }),
    refresh: (refreshToken: string) =>
        apiCall<Tokens>("/auth/refresh", { method: "POST", body: { refreshToken } }),
    me: (token: string) => apiCall<AuthUser>("/me", { token }),
    forgotPassword: (email: string) =>
        apiCall<any>("/auth/forgot-password", { method: "POST", body: { email } }),
    resetPassword: (body: { email: string; code: string; newPassword: string; confirmPassword: string }) =>
        apiCall<any>("/auth/reset-password", { method: "POST", body }),
};

export { apiCall };

// ---------- wishlist (authenticated) ----------
export const wishlistApi = {
    async get(token: string) {
        const res = await apiCall<Paginated<ApiProduct> | ApiProduct[] | { data?: ApiProduct[] }>("/wishlist", { token });
        return asList<ApiProduct>(res as any).items;
    },
    add: (token: string, productId: string) =>
        apiCall<any>("/wishlist", { method: "POST", body: { productId }, token }),
    remove: (token: string, productId: string) =>
        apiCall<any>(`/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE", token }),
    clear: (token: string) => apiCall<any>("/wishlist", { method: "DELETE", token }),
};

// ---------- account profile (self-service) ----------
export const profileApi = {
    get: (token: string) => apiCall<AuthUser>("/users/me/profile", { token }),
    update: (token: string, body: { firstName?: string; lastName?: string; phone?: string }) =>
        apiCall<any>("/users/me/profile", { method: "PATCH", body, token }),
};

// ---------- flash sale (public) ----------
export interface FlashSalePayload {
    active: boolean;
    title: string;
    endsAt: string | null;
    products: CardProduct[];
}

export async function getFlashSale(): Promise<FlashSalePayload> {
    const res = await getJSON<{ active?: boolean; title?: string; endsAt?: string | null; products?: ApiProduct[] }>(
        "/storefront/flash-sale",
        undefined,
        30,
    );
    if (!res) return { active: false, title: "Flash Deals", endsAt: null, products: [] };
    return {
        active: !!res.active,
        title: res.title || "Flash Deals",
        endsAt: res.endsAt ?? null,
        products: (res.products ?? []).map(toCard),
    };
}

// ---------- orders (shopper, authenticated) ----------
// Money fields are Postgres decimals and arrive as strings — wrap in Number().
export interface ApiOrderItem {
    id: string;
    productId: string;
    sku: string;
    name: string;
    image?: string | null;
    unitPrice: string | number;
    quantity: number;
    subtotal: string | number;
}

export interface ApiOrderAddress {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    country: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
}

export interface ApiOrder {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod?: string | null;
    currency: string;
    subtotal: string | number;
    shippingAmount: string | number;
    discountAmount: string | number;
    taxAmount?: string | number;
    taxRate?: string | number | null;
    total: string | number;
    deliveryZoneName?: string | null;
    /** unpaid M-Pesa orders are cancelled after this */
    paymentDueAt?: string | null;
    payments?: { id: string; status: PaymentView["status"]; amount: string | number; receiptNumber?: string | null; createdAt: string; paidAt?: string | null }[];
    customerNote?: string | null;
    shippingAddress: ApiOrderAddress;
    trackingNumber?: string | null;
    trackingCarrier?: string | null;
    estimatedDeliveryAt?: string | null;
    createdAt: string;
    items: ApiOrderItem[];
    // customer-visible entries only — the gateway strips internal ones
    statusHistory?: {
        id: string;
        type?: "STATUS" | "TRACKING" | "PAYMENT" | "UPDATE";
        status: string;
        note?: string | null;
        location?: string | null;
        createdAt: string;
    }[];
}

export interface CheckoutBody {
    items: { productId: string; quantity: number }[];
    fullName: string;
    phone: string;
    address: string;
    city: string;
    landmark?: string;
    /** the drop-off pin (GPS or map) */
    latitude?: number;
    longitude?: number;
    paymentMethod: "mpesa" | "cod";
    note?: string;
}

/** One M-Pesa prompt, as the shopper sees it. */
export interface PaymentView {
    id: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    amount: number;
    currency: string;
    phone: string;
    receiptNumber?: string | null;
    message?: string | null;
    createdAt: string;
    paidAt?: string | null;
}

export interface PaymentStatus {
    orderId: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod?: string | null;
    total: number;
    paymentDueAt?: string | null;
    payment: PaymentView | null;
    canRetry: boolean;
}

export const orderApi = {
    /** M-Pesa orders come back PENDING with the prompt just sent in `payment`. */
    place: (token: string, body: CheckoutBody) =>
        apiCall<ApiOrder & { payment: PaymentView | null }>("/me/orders", { method: "POST", body, token }),
    paymentStatus: (token: string, id: string) =>
        apiCall<PaymentStatus>(`/me/orders/${encodeURIComponent(id)}/payment`, { token }),
    /** Re-send the M-Pesa prompt, optionally to another phone. */
    pay: (token: string, id: string, phone?: string) =>
        apiCall<{ payment: PaymentView | null; paid: boolean }>(`/me/orders/${encodeURIComponent(id)}/pay`, { method: "POST", body: { phone }, token }),
    async list(token: string, page = 1, limit = 20) {
        const res = await apiCall<Paginated<ApiOrder>>(`/me/orders?page=${page}&limit=${limit}`, { token });
        return asList<ApiOrder>(res);
    },
    get: (token: string, id: string) => apiCall<ApiOrder>(`/me/orders/${encodeURIComponent(id)}`, { token }),
};

// ---------- saved delivery addresses (authenticated) ----------
export interface SavedAddress {
    id: string;
    label: string;
    line1: string;
    line2?: string | null;
    city: string;
    country: string;
    phone?: string | null;
    isDefault: boolean;
    latitude?: number | null;
    longitude?: number | null;
    deliveryInstructions?: string | null;
}

export interface SavedAddressInput {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
    latitude?: number;
    longitude?: number;
    deliveryInstructions?: string;
}

export const addressesApi = {
    list: (token: string) => apiCall<SavedAddress[]>("/customers/me/addresses", { token }),
    create: (token: string, body: SavedAddressInput) =>
        apiCall<SavedAddress>("/customers/me/addresses", { method: "POST", body: { country: "Kenya", ...body }, token }),
    update: (token: string, id: string, body: Partial<SavedAddressInput>) =>
        apiCall<SavedAddress>(`/customers/me/addresses/${encodeURIComponent(id)}`, { method: "PUT", body, token }),
    remove: (token: string, id: string) =>
        apiCall<{ success: boolean }>(`/customers/me/addresses/${encodeURIComponent(id)}`, { method: "DELETE", token }),
};

// ---------- delivery zones, VAT & quotes (public) ----------
export interface DeliveryZone {
    id: string;
    name: string;
    description?: string | null;
    cities: string[];
    isDefault: boolean;
    fee: number;
    perKgFee: number;
    includedKg: number;
    freeAbove: number | null;
    minDays: number;
    maxDays: number;
    allowsCod: boolean;
}

export interface DeliveryZones {
    vatRate: number;
    vatOnShipping: boolean;
    zones: DeliveryZone[];
}

export interface Quote {
    zone: { id: string; name: string; minDays: number; maxDays: number; allowsCod: boolean };
    currency: string;
    subtotal: number;
    shipping: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    weightKg: number;
    freeDeliveryAbove: number | null;
    amountToFreeDelivery: number | null;
}

export const checkoutApi = {
    zones: () => apiCall<DeliveryZones>("/checkout/delivery-zones"),
    quote: (city: string, items: { productId: string; quantity: number }[]) =>
        apiCall<Quote>("/checkout/quote", { method: "POST", body: { city, items } }),
};

/** "0–1" → "Same day or next business day", "2–4" → "2–4 business days". */
export function deliveryEta(z: { minDays: number; maxDays: number }) {
    if (z.maxDays <= 0) return "Same day";
    if (z.minDays <= 0) return z.maxDays === 1 ? "Same day or next business day" : `Same day – ${z.maxDays} business days`;
    if (z.minDays === z.maxDays) return `${z.minDays} business day${z.minDays === 1 ? "" : "s"}`;
    return `${z.minDays}–${z.maxDays} business days`;
}

/** Every town the zones list, title-cased and sorted — for the town picker. */
export function townNames(zones: DeliveryZone[]) {
    const title = (c: string) => c.replace(/\b\w/g, (m) => m.toUpperCase());
    return [...new Set(zones.flatMap((z) => z.cities))].map(title).sort((a, b) => a.localeCompare(b));
}

// ---------- cart sync (authenticated) ----------
export interface ServerCart {
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        product: { id: string; sku: string; name: string; slug: string; brand?: string | null; image?: string | null; stockQty: number; isActive: boolean; isInStock: boolean };
    }[];
    itemCount: number;
    subtotal: number;
}

export const cartApi = {
    get: (token: string) => apiCall<ServerCart>("/cart", { token }),
    replace: (token: string, items: { productId: string; quantity: number }[]) =>
        apiCall<ServerCart>("/cart", { method: "PUT", body: { items }, token }),
};

// ---------- contact form (public; token optional — links the message to the account) ----------
export const CONTACT_TOPICS = [
    "Parts enquiry",
    "Fitment question",
    "Order / delivery",
    "Trade account",
    "Returns & warranty",
    "Something else",
] as const;

export interface ContactBody {
    name: string;
    email: string;
    phone?: string;
    topic: (typeof CONTACT_TOPICS)[number];
    message: string;
    orderNumber?: string;
    website?: string; // honeypot — always empty for humans
}

export const contactApi = {
    send: (body: ContactBody, token?: string | null) =>
        apiCall<{ success: boolean; reference: string }>("/messages", { method: "POST", body, token }),
};

// ---------- product reviews ----------
export interface ProductReview {
    id: string;
    rating: number;
    title?: string | null;
    content?: string | null;
    userName: string;
    vehicle?: string | null;
    fitted?: boolean | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    status?: "PUBLISHED" | "HIDDEN"; // only on the shopper's own review
}

export interface ReviewSummary {
    average: number;
    count: number;
    distribution: { star: number; count: number }[];
    fitRate: number | null;
    fitAnswers: number;
}

export interface ReviewPage {
    data: ProductReview[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    summary: ReviewSummary;
}

export interface ReviewInput {
    rating: number;
    title?: string;
    content?: string;
    vehicle?: string;
    fitted?: boolean;
    firstName?: string;
    lastName?: string;
}

export const reviewsApi = {
    /** public — no cache so a new review shows immediately */
    list: (productId: string, page = 1, sort: "recent" | "highest" | "lowest" = "recent", limit = 5) =>
        apiCall<ReviewPage>(`/storefront/products/${productId}/reviews?page=${page}&limit=${limit}&sort=${sort}`),
    eligibility: (token: string, productId: string) =>
        apiCall<{ canReview: boolean; reason: "EXISTING" | "PURCHASED" | "NOT_PURCHASED"; review: ProductReview | null }>(
            `/me/reviews/${productId}/eligibility`, { token }),
    save: (token: string, productId: string, body: ReviewInput) =>
        apiCall<ProductReview>(`/me/reviews/${productId}`, { method: "PUT", body, token }),
    remove: (token: string, productId: string) =>
        apiCall<{ success: boolean }>(`/me/reviews/${productId}`, { method: "DELETE", token }),
};

// ---------- vehicle finder (public) ----------
export interface Vehicle {
    make: string;
    model: string;
    year?: number;
}

export const vehiclesApi = {
    makes: () => apiCall<{ make: string; parts: number }[]>("/storefront/vehicles/makes"),
    models: (make: string) => apiCall<{ model: string; parts: number }[]>(`/storefront/vehicles/models?make=${encodeURIComponent(make)}`),
    years: (make: string, model: string) =>
        apiCall<number[]>(`/storefront/vehicles/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`),
};

export const vehicleLabel = (v: Vehicle) => [v.year, v.make, v.model].filter(Boolean).join(" ");

/** Does a product fit this vehicle? "universal" | true | false | null (no fitment data). */
export function fitsVehicle(p: { isUniversal?: boolean; fitments?: ApiFitment[] }, v: Vehicle): "universal" | boolean | null {
    if (p.isUniversal) return "universal";
    if (!p.fitments?.length) return null;
    const eq = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
    return p.fitments.some((f) =>
        eq(f.make, v.make) && eq(f.model, v.model) &&
        (!v.year || ((f.yearFrom == null || f.yearFrom <= v.year) && (f.yearTo == null || f.yearTo >= v.year))),
    );
}

/** "04465-12592" → "0446512592" (same rule as the backend). */
export const normalizePartNumber = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** The part number a search term matched, if any — for "Matches OE 04465-12592" hints. */
export function matchedPartNumber(p: { partNumbers?: ApiPartNumber[] }, term: string): ApiPartNumber | undefined {
    const words = term.split(/\s+/).map(normalizePartNumber).filter((w) => w.length >= 3);
    if (!words.length || !p.partNumbers?.length) return undefined;
    return p.partNumbers.find((n) => words.some((w) => (n.normalized ?? normalizePartNumber(n.number)).includes(w)));
}

export const PART_TYPE_LABEL: Record<ApiPartNumber["type"], string> = {
    OE: "OE",
    MANUFACTURER: "Manufacturer",
    AFTERMARKET: "Aftermarket",
};

// ---------- cancellations & returns (authenticated) ----------
export type ReturnReason = "WRONG_PART" | "DOESNT_FIT" | "DAMAGED" | "FAULTY" | "NOT_AS_DESCRIBED" | "CHANGED_MIND";
export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED";

export interface ReturnRequest {
    id: string;
    rmaNumber: string;
    orderId: string;
    orderNumber?: string;
    status: ReturnStatus;
    reason: ReturnReason;
    reasonLabel: string;
    details?: string | null;
    photos: string[];
    resolution: "REFUND" | "EXCHANGE";
    instructions?: string | null;
    rejectReason?: string | null;
    refundAmount?: number | null;
    createdAt: string;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    receivedAt?: string | null;
    refundedAt?: string | null;
    items: { id: string; orderItemId: string; name: string; sku: string; quantity: number; unitPrice: string | number }[];
}

export interface ReturnEligibility {
    canCancel: boolean;
    canReturn: boolean;
    reason: string | null;
    deadline: string | null;
    windowDays: number;
    items: { orderItemId: string; productId: string; name: string; sku: string; image?: string | null; ordered: number; returnable: number; unitPrice: number }[];
    returns: ReturnRequest[];
}

export const returnsApi = {
    eligibility: (token: string, orderId: string) => apiCall<ReturnEligibility>(`/me/orders/${orderId}/returns`, { token }),
    create: (token: string, orderId: string, body: { items: { orderItemId: string; quantity: number }[]; reason: ReturnReason; details?: string; photos?: string[]; resolution?: "REFUND" | "EXCHANGE" }) =>
        apiCall<ReturnRequest>(`/me/orders/${orderId}/returns`, { method: "POST", body, token }),
    cancelOrder: (token: string, orderId: string, reason?: string) =>
        apiCall<{ success: boolean }>(`/me/orders/${orderId}/cancel`, { method: "POST", body: { reason }, token }),
    mine: (token: string) => apiCall<ReturnRequest[]>("/me/returns", { token }),
};

/** Photo upload for returns — straight to Cloudinary with the public unsigned preset. */
export const photoUpload = {
    enabled: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET),
    async upload(file: File): Promise<string> {
        if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
        if (file.size > 5 * 1024 * 1024) throw new Error("Photos must be 5 MB or smaller.");
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);
        form.append("folder", "returns");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: form });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.secure_url) throw new Error(data?.error?.message || "Upload failed. Please try again.");
        return data.secure_url as string;
    },
};
