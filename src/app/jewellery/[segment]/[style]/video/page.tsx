"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import VideoStyleCard from "@/frontend/components/VideoStyleCard";
import Footer from "@/frontend/components/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function JewelleryVideoStylePage() {
  const params = useParams();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string>("Macro Shine");

  const videoStyles = [
    { title: "Macro Shine", image: "/golden-jewlary.jpg", desc: "Detailed focus on gemstone facets and light refraction." },
    { title: "Editorial Pan", image: "/elegant-woman-showcasing-silver-necklace-with-vibrant-amethyst-aquamarine-stones-set-against-deep-background-dramatic-effect.jpg", desc: "Cinematic horizontal scroll across the jewelry set." },
    { title: "Orbit 360", image: "/golden-jewlary.jpg", desc: "Full rotation to showcase piece symmetry and backs." },
    { title: "Soft Sway", image: "/indian-bride-9-2025-12-2fd0a5885b204639c8156089c6d2ebad-16x9.avif", desc: "Gentle vertical oscillation with depth of field shifts." },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Video Storyboard" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={7} />

        <div className="mt-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-bold text-[36px] leading-[45px] text-[#E2E2E8] tracking-[-0.9px]"
          >
            Motion Treatment
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-normal text-[16px] leading-[19px] text-[#C2C6D6] mt-2"
          >
            Select a cinematic motion preset for your Jewellery AI
          </motion.p>
        </div>

        {/* Video Animation Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {videoStyles.map((vs, idx) => (
            <VideoStyleCard
              key={idx}
              title={vs.title}
              image={vs.image}
              selected={selectedVideoStyle === vs.title}
              onClick={() => setSelectedVideoStyle(vs.title)}
            />
          ))}
        </div>

        {/* AI Custom Prompt Section */}
        <section className="mt-16 max-w-2xl">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button className="h-[36px] px-5 border border-[#424754] rounded-full hover:bg-white/5 transition-colors">
                <span className="font-semibold text-sm text-[#E2E2E8]">
                  Use AI Prompt
                </span>
              </button>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF6565]" />
                <span className="font-normal text-[12px] text-[#FF6565]">
                  Cinematic custom prompts may vary in precision
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-xl text-white">
                Motion Director
              </h2>
              <span className="font-semibold text-xs text-[#7C4DFF]">
                (PREMIUM)
              </span>
            </div>
          </div>

          <div className="relative group">
            <textarea
              className="w-full h-[95px] bg-black/30 border border-white/20 rounded-[12px] p-4 text-sm focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/30 resize-none shadow-inner"
              placeholder="Describe focus points, e.g. 'Slow zoom into the center emerald with diamond sparkle flares'..."
            />
          </div>
        </section>

        {/* Generate Button */}
        <div className="w-full mt-10 mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <Link href={`/jewellery/${segment}/${style}/video/result`}>
              <button className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_10px_30px_rgba(124,77,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center">
                <span className="font-bold text-lg text-white">
                  Generate Masterpiece Video
                </span>
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
