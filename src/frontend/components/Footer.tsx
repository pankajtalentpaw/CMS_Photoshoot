"use client";

import BrandLogo from "@/frontend/components/BrandLogo";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-black border-t border-white/10 pt-12 pb-10 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-10">
          <div className="flex flex-col gap-4">
            <BrandLogo />
            <p className="font-inter text-sm text-[#D1D5DB] max-w-xs">
              A high-fidelity design ecosystem for modern engineers and creative enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-roboto font-bold text-white mb-4 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="flex flex-col gap-2 font-inter text-sm text-[#D1D5DB]">
                <li><Link href="/" className="hover:text-white transition-colors">Studio</Link></li>
                <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                <li><Link href="/ai-lab" className="hover:text-white transition-colors">AI Lab</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-roboto font-bold text-white mb-4 uppercase text-xs tracking-widest">Support</h4>
              <ul className="flex flex-col gap-2 font-inter text-sm text-[#D1D5DB]">
                <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Community</li>
              </ul>
            </div>
            <div>
              <h4 className="font-roboto font-bold text-white mb-4 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="flex flex-col gap-2 font-inter text-sm text-[#D1D5DB]">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom divider + copyright */}
        <div className="border-t border-[#2F2751] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-inter text-xs text-[#D1D5DB]">
            © 2026 Digital Atelier. All rights reserved.
          </p>
          <p className="font-inter text-xs text-[#D1D5DB]">
            Powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
