"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function RefundPolicyPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-inter">
      <FlowHeader title="Legal" />

      <main className="w-full max-w-4xl mx-auto pt-[140px] px-6 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back to Home Link */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[#8B5CF6] hover:text-[#7C3AED] transition-colors group text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="font-manrope font-bold text-4xl md:text-5xl text-white mb-8"
          >
            Cancellation & Refund Policy
          </motion.h1>

          <motion.div variants={itemVariants} className="text-[#9CA3AF] leading-relaxed mb-12">
            <p className="text-lg">
              This policy governs all cancellations, withdrawals, and refund requests related to services provided by Clapstick Media (managed by TSTK VENTURES LLP) ("CM"), including but not limited to AI-generated content, video production, social media services, digital marketing, and design deliverables.
            </p>
          </motion.div>

          <div className="space-y-12 text-[#9CA3AF] leading-relaxed">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6">
                1. General Policy on Cancellations and Refunds
              </h2>
              <div className="space-y-4">
                <p>
                  <span className="text-white font-semibold">1.1</span> All purchases and service agreements are non-refundable by default once a project has commenced, as time, resources, and planning are invested from the outset.
                </p>
                <p>
                  <span className="text-white font-semibold">1.2</span> If a cancellation request is submitted before any work has begun, CM may consider a partial refund at its sole discretion, after deducting administrative or consulting charges.
                </p>
                <p>
                  <span className="text-white font-semibold">1.3</span> Any third-party costs (e.g., talent, software, paid tools) engaged on behalf of the client are non-refundable under any circumstances.
                </p>
                <p>
                  <span className="text-white font-semibold">1.4</span> <span className="text-white font-semibold">Client Assurance Clause:</span> All payments made to CM are covered under a delivery guarantee. We assure clients that every accepted and paid-for order will be executed. Our team works hand in hand with clients to resolve any hiccups, clarify scope, and ensure fulfillment.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6">
                2. Refunds for Pre-Paid & Subscription-Based Services
              </h2>
              <div className="space-y-4">
                <p>
                  <span className="text-white font-semibold">2.1</span> For monthly or recurring services (such as social media retainers or weekly reel subscriptions), cancellations must be submitted at least 7 working days prior to the next billing cycle.
                </p>
                <p>
                  <span className="text-white font-semibold">2.2</span> Any ongoing service cycle will be non-refundable, even if partially delivered.
                </p>
                <p>
                  <span className="text-white font-semibold">2.3</span> Refunds are not applicable for unused services or delays caused by the client (e.g., non-responsiveness or late approvals).
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6">
                3. Readymade / AI-Powered Services
              </h2>
              <div className="space-y-4">
                <p>
                  <span className="text-white font-semibold">3.1</span> For services like AI-generated reels, creatives, or express packages, cancellations are not accepted once the order is confirmed due to automated workflows and time-bound delivery.
                </p>
                <p>
                  <span className="text-white font-semibold">3.2</span> If CM is unable to deliver the AI-powered content due to technical issues (e.g., tool outages, API errors), a full refund of the amount paid will be issued.
                </p>
                <p>
                  <span className="text-white font-semibold">3.3</span> For orders exceeding INR 50,000, where significant work may already be underway at the time of disruption, the refund amount (if any) shall be determined at CM's sole discretion. Such services are considered fully indemnified, and CM shall not be liable for the full project cost.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6">
                4. Client-Initiated Cancellation
              </h2>
              <div className="space-y-4">
                <p>
                  <span className="text-white font-semibold">4.1</span> Cancellation of custom or retainer projects by the client does not entitle them to any refund unless explicitly agreed in writing in the project contract.
                </p>
                <p>
                  <span className="text-white font-semibold">4.2</span> Where applicable, CM may agree to an exit clause or termination window before project commencement. In absence of such terms, all work initiated is chargeable in full.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6">
                5. Company-Initiated Cancellation
              </h2>
              <div className="space-y-4">
                <p>
                  <span className="text-white font-semibold">5.1</span> CM reserves the right to cancel a service without notice if the client:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Breaches CM's Terms & Conditions</li>
                  <li>Is abusive or uncooperative</li>
                  <li>Delays beyond reasonable limits</li>
                  <li>Provides false or misleading information</li>
                  <li>Requests unlawful or unethical content</li>
                </ul>
                <p>
                  <span className="text-white font-semibold">5.2</span> In such cases, no refund will be provided. All work completed until the date of termination is considered billable and delivered.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6">
                6. Refund Process (Where Applicable)
              </h2>
              <div className="space-y-4">
                <p>
                  <span className="text-white font-semibold">6.1</span> If approved, refunds are processed to the original payment method within 7-14 business days.
                </p>
                <p>
                  <span className="text-white font-semibold">6.2</span> Applicable deductions (e.g., transaction charges, taxes, third-party commissions) may be applied before the refund is initiated.
                </p>
                <p>
                  <span className="text-white font-semibold">6.3</span> No interest or compensation will be applicable for processing delays beyond the stated window.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6">
                7. Contact for Clarification
              </h2>
              <p className="mb-4">
                For cancellation or refund-related queries, please email:
              </p>
              <a 
                href="mailto:hello@clapstickmedia.com" 
                className="inline-flex items-center gap-3 text-[#8B5CF6] hover:text-[#7C3AED] transition-all group font-medium"
              >
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center group-hover:bg-[#8B5CF6]/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                hello@clapstickmedia.com
              </a>
            </motion.section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
