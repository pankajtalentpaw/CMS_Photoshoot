"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import BottomNav from "@/frontend/components/BottomNav";
import Hero from "@/frontend/components/Hero";
import CategoryCard from "@/frontend/components/CategoryCard";
import RecentlyVisited from "@/frontend/components/RecentlyVisited";
import Link from "next/link";
import { Shirt, Gem, Watch, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CardSkeleton } from "@/frontend/components/ui/Skeleton";

import ProductScroll from "@/frontend/components/ProductScroll";
import Footer from "@/frontend/components/Footer";

// Performance Optimization: Defer only truly browser-specific heavy components
const JewelleryOverlaySVG = dynamic(() => import("@/frontend/components/JewelleryOverlaySVG").then(mod => mod.JewelleryOverlaySVG), { ssr: false });

export default function Home() {
  const categories = [
    { title: "Apparel", icon: Shirt, image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", description: "High-fidelity model photos for Ethnic & Western wear." },
    { title: "Jewellery", icon: Gem, image: "/home_jewellery.png", description: "Studio-grade refractive renders for luxury pieces." },
    { title: "Accessories", icon: Watch, image: "/home_accessories.png", description: "Professional product shots for bags and footwear." },
    { title: "Products", icon: Package, image: "/home_products.png", description: "Clean, catalog-safe images for home and beauty." },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title=" " />
      
      <main className="w-full max-w-none mx-auto">
        {/* Hero Section */}
        <Hero />

        <section className="px-5 mb-10 w-full max-w-7xl mx-auto">
          <Link href="/virtual-try-on" className="w-full">
            <motion.div 
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
              whileTap={{ scale: 0.99 }}
              className="bg-gradient-to-r from-[#7C4DFF]/10 to-[#EC4899]/10 border border-[#7C4DFF]/20 rounded-[20px] p-5 flex items-center justify-between group transition-all cursor-pointer shadow-[0_0_20px_rgba(124,77,255,0.1)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#EC4899] flex items-center justify-center shadow-lg">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-roboto font-semibold text-white text-base">Virtual Try-On</h3>
                  <p className="font-roboto font-normal text-[#99A1AF] text-sm truncate max-w-[200px] sm:max-w-none">
                    Experience clothes virtually with our AI-powered fitting room
                  </p>
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#7C4DFF] group-hover:to-[#EC4899] transition-all group-hover:shadow-[0_0_15px_rgba(124,77,255,0.4)]">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          </Link>
        </section>

        {/* SaaS Rule 6.1: Recent branch shortcut */}
        <RecentlyVisited />

        {/* Creative Hubs Area */}
        <section className="px-5 mb-10 w-full max-w-7xl mx-auto">
          <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-5">
            Creative Hubs
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                href={
                  cat.title === "Apparel" ? "/apparel" : 
                  cat.title === "Jewellery" ? "/jewellery" : 
                  cat.title === "Accessories" ? "/accessories" :
                  cat.title === "Products" ? "/products" : "#"
                } 
                key={idx}
              >
                <CategoryCard 
                  title={cat.title} 
                  icon={cat.icon} 
                  image={cat.image} 
                  description={cat.description}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Projects Area (ProductScroll) */}
        <ProductScroll />

        {/* Desktop Footer (fills empty space) */}
        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>

      {/* Mobile Bottom Nav — Studio / Gallery / AI Lab / Profile */}
      <BottomNav />
    </div>
  );
}
