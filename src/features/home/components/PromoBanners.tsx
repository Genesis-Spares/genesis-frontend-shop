'use client'

import Image from "next/image";
import { Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const bannerImages = [
    "https://synergyflow-lab.lovable.app/assets/promo-tyres-DoJw6JiJ.jpg",
    "https://synergyflow-lab.lovable.app/assets/promo-delivery-DPURsiQQ.jpg",
];

export default function PromoBanners() {
    return (
        <div className="bg-surface py-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Tyres Banner */}
                    <Card className="relative overflow-hidden rounded-2xl min-h-[220px] md:min-h-[280px] border-0 shadow-lg group hover:shadow-xl transition-shadow">
                        <Image
                            src={bannerImages[0]}
                            alt="Tyres Promotion"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#14161c]/90 via-[#14161c]/60 to-[#14161c]/20" />
                        <CardContent className="relative z-10 h-full p-8 flex flex-col justify-center">
                            <Badge className="w-fit bg-brand hover:bg-brand-hover text-white text-[11px] font-bold uppercase tracking-wide mb-3 border-0">
                                Special Offer
                            </Badge>
                            <h3 className="font-display text-white text-3xl md:text-4xl font-extrabold tracking-[-0.02em] leading-tight">
                                UP TO <span className="text-brand">20% OFF</span>
                            </h3>
                            <p className="text-[#c7cdd7] text-base mb-6 mt-1">
                                On Selected Tyres
                            </p>
                            <Button className="w-fit bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-2.5 rounded-lg">
                                SHOP TYRES
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Delivery Banner */}
                    <Card className="relative overflow-hidden rounded-2xl min-h-[220px] md:min-h-[280px] border-0 shadow-lg group hover:shadow-xl transition-shadow">
                        <Image
                            src={bannerImages[1]}
                            alt="Fast Delivery"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#14161c]/92 via-[#14161c]/72 to-[#14161c]/30" />
                        <CardContent className="relative z-10 h-full p-8 flex flex-col justify-center">
                            <h3 className="font-display text-white text-2xl md:text-3xl font-extrabold tracking-[-0.02em] leading-tight">
                                FAST DELIVERY
                            </h3>
                            <p className="font-display text-brand text-2xl md:text-3xl font-extrabold tracking-[-0.02em] leading-tight mb-1">
                                ACROSS KENYA
                            </p>
                            <p className="text-[#c7cdd7] text-base mb-6">
                                Your parts, delivered fast &amp; safe
                            </p>
                            <Button className="w-fit bg-white hover:bg-surface text-carbon font-semibold px-6 py-2.5 rounded-lg">
                                LEARN MORE
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Help Banner */}
                    <Card className="bg-carbon rounded-2xl min-h-[220px] md:min-h-[280px] border-0 shadow-lg flex items-center p-8">
                        <CardContent className="flex items-center justify-between w-full p-0">
                            <div className="flex-1">
                                <h3 className="font-display text-white text-2xl md:text-3xl font-extrabold tracking-[-0.02em] leading-tight">
                                    NEED HELP?
                                </h3>
                                <p className="text-[#9ba3af] text-base mt-2 mb-6 max-w-[200px]">
                                    Talk to our experts. We&apos;re here to help you find the right parts
                                </p>
                                <Button className="bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-2.5 rounded-lg">
                                    CONTACT US
                                </Button>
                            </div>
                            <div className="w-20 h-20 rounded-full border-2 border-brand/60 flex items-center justify-center shrink-0 ml-4 bg-brand/10">
                                <Headphones size={32} className="text-brand" />
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
