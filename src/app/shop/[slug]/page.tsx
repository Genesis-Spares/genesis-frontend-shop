import ProductPage from "@/features/product/ProductPage";
import { storefront, toDetail, toCard } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // The card links use slug; fall back to id lookup if slug misses.
    const apiProduct = (await storefront.productBySlug(slug)) ?? (await storefront.productById(slug));
    if (!apiProduct) {
        // Backend offline or product missing — render the placeholder detail.
        return <ProductPage />;
    }

    const data = toDetail(apiProduct);

    let related = undefined;
    if (apiProduct.categoryId) {
        const rel = await storefront.byCategory(apiProduct.categoryId, 1, 5);
        related = rel.items.filter((r) => r.id !== apiProduct.id).slice(0, 4).map(toCard);
    }

    return <ProductPage data={data} related={related} />;
}
