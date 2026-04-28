"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-inter">
      <FlowHeader title="Legal" />

      <main className="w-full max-w-4xl mx-auto pt-[120px] px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-manrope font-bold text-4xl md:text-5xl text-figma-gradient italic mb-8">
            Terms of Service
          </h1>

          <div className="space-y-12 text-[#9CA3AF] leading-relaxed">
            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                1. Terms
              </h2>
              <p>
                By accessing the website at <span className="text-[#8B5CF6]">clapstickmedia.com</span>, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                2. Use License
              </h2>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Clapstick Media's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Modify or copy the materials;</li>
                <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                <li>Attempt to decompile or reverse engineer any software contained on Clapstick Media's website;</li>
                <li>Remove any copyright or other proprietary notations from the materials; or</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
              <p className="mt-4">
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by Clapstick Media at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                3. Disclaimer
              </h2>
              <p>
                The materials on Clapstick Media's website are provided on an 'as is' basis. Clapstick Media makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p className="mt-4">
                Further, Clapstick Media does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                4. Limitations
              </h2>
              <p>
                In no event shall Clapstick Media or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Clapstick Media's website, even if Clapstick Media or a Clapstick Media authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                5. Accuracy of materials
              </h2>
              <p>
                The materials appearing on Clapstick Media's website could include technical, typographical, or photographic errors. Clapstick Media does not warrant that any of the materials on its website are accurate, complete or current. Clapstick Media may make changes to the materials contained on its website at any time without notice. However Clapstick Media does not make any commitment to update the materials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                6. Links
              </h2>
              <p>
                Clapstick Media has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Clapstick Media of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                7. Modifications
              </h2>
              <p>
                Clapstick Media may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                8. Governing Law
              </h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
