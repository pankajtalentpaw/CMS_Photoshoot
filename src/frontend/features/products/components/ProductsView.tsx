"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import SegmentCard from "@/frontend/components/SegmentCard";
import Footer from "@/frontend/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { TAXONOMY } from "@/registry/taxonomy";

export default function ProductsPage() {
  const families = TAXONOMY.products.families;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Products" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={2} />

        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight text-[#E2E2E8] mb-4">
              General Products
            </h1>
            <p className="font-roboto font-normal text-base text-[#C2C6D6]">
              Choose the product family for your AI production
            </p>
          </motion.div>
        </section>

        <section className="mb-20">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {families.map((family: any, idx: number) => (
              <motion.div 
                key={idx} 
                className={`${family.fullWidth ? "col-span-2 lg:col-span-1" : "col-span-1"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/products/${family.title.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '')}`}>
                  <SegmentCard 
                    title={family.title} 
                    image={family.image} 
                    fullWidth={family.fullWidth} 
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
