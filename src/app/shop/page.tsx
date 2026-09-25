import ProductsPage from "@/features/shop/ProductsPage";
import { storefront, toCard, type ProductQuery } from "@/lib/api";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
    return Array.isArray(v) ? v[0] : v;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
    const sp = await searchParams;

    const page = Number(str(sp.page)) || 1;
    const query: ProductQuery = {
        page,
        limit: 12,
        search: str(sp.search) || undefined,
        categoryId: str(sp.categoryId) || undefined,
        brand: str(sp.brand) || undefined,
        minPrice: str(sp.minPrice) ? Number(str(sp.minPrice)) : undefined,
        maxPrice: str(sp.maxPrice) ? Number(str(sp.maxPrice)) : undefined,
        inStock: str(sp.inStock) === "true" ? true : undefined,
        sortBy: (str(sp.sortBy) as ProductQuery["sortBy"]) || undefined,
        sortOrder: (str(sp.sortOrder) as ProductQuery["sortOrder"]) || undefined,
        // vehicle finder — make alone, or make + model (+ year)
        make: str(sp.make) || undefined,
        model: str(sp.make) && str(sp.model) ? str(sp.model) : undefined,
        year: str(sp.make) && str(sp.model) && Number(str(sp.year)) ? Number(str(sp.year)) : undefined,
    };

    const [list, categories] = await Promise.all([
        storefront.listProducts(query),
        storefront.categories(),
    ]);

    const products = list.items.map(toCard);

    return (
        <ProductsPage
            products={products}
            meta={list.meta}
            categories={categories}
            query={{
                search: query.search,
                make: query.make,
                model: query.model,
                year: query.year,
                categoryId: query.categoryId,
                brand: query.brand,
                minPrice: query.minPrice,
                maxPrice: query.maxPrice,
                inStock: query.inStock,
                sortBy: query.sortBy,
                page,
            }}
        />
    );
}
