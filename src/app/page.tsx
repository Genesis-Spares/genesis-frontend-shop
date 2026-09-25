import {
    TopBar,
    MainHeader,
    Hero,
    CategoriesStrip,
    FlashDeals,
    FeaturedProducts,
    ShopByVehicle,
    BestSellers,
    PromoBanners,
    BrandStrip,
    Testimonials,
    WhyChooseUs,
    Newsletter,
} from "@/features/home"
import NavBar from "@/components/common/NavBar"
import Footer from "@/components/common/Footer"
import { storefront, toCard, getFlashSale } from "@/lib/api"

export default async function HomePage() {
    // Server-side fetch of catalog feeds + the admin-controlled flash sale.
    // Empty results simply hide the corresponding section.
    const [featuredRes, bestRes, flash] = await Promise.all([
        storefront.listProducts({ limit: 6, sortBy: "popularity", sortOrder: "desc" }),
        storefront.listProducts({ limit: 6, sortBy: "rating", sortOrder: "desc" }),
        getFlashSale(),
    ])

    const featured = featuredRes.items.map(toCard)
    const best = bestRes.items.map(toCard)

    return (
        <div className="font-sans antialiased">
            <TopBar />
            <MainHeader />
            <NavBar />
            <Hero />
            <CategoriesStrip />
            <FlashDeals active={flash.active} title={flash.title} endsAt={flash.endsAt} deals={flash.products} />
            <FeaturedProducts products={featured.length ? featured : undefined} />
            <ShopByVehicle />
            <BestSellers products={best.length ? best : undefined} />
            <PromoBanners />
            <BrandStrip />
            <Testimonials />
            <WhyChooseUs />
            <Newsletter />
            <Footer />
        </div>
    )
}
