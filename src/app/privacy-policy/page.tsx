"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <div className="space-y-12 text-[#9CA3AF] leading-relaxed">
            <section>
              <p className="text-lg">
                This page informs you of our policies regarding the collection, use and disclosure of Personal Information. If anyone decides to use our Service, the clapstickmedia.com website (managed by SOFTC SYSTEMS LLP). If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                1. Information Collection & Usage
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold mb-2">Types Of Data We Collect</h3>
                  <p className="font-bold text-[#E5E7EB] text-sm uppercase mb-2">Contact Details</p>
                  <p>Your name, address, telephone number, email address.</p>
                </div>

                <div>
                  <p className="font-bold text-[#E5E7EB] text-sm uppercase mb-2">Device Information</p>
                  <p>Your IP address, login information, browser type and version, time zone setting, browser plug-in types, geolocation information about where you might be, operating system and version.</p>
                </div>

                <div>
                  <p className="font-bold text-[#E5E7EB] text-sm uppercase mb-2">Data on how you use our site</p>
                  <p>Your URL clickstreams (the path you take through our site), products viewed, page response times, download errors, how long you stay on our pages, what you do on those pages, how often, and other actions.</p>
                </div>

                <div>
                  <p className="font-bold text-[#E5E7EB] text-sm uppercase mb-2">What about particularly sensitive data?</p>
                  <p>We don't collect any "sensitive data" about you (e.g. racial or ethnic origin, political opinions, religious/philosophical beliefs, etc.). We also don't carry any financial data.</p>
                </div>

                <div>
                  <p className="font-bold text-[#E5E7EB] text-sm uppercase mb-2">What about children's data?</p>
                  <p>Clapstickmedia.com is a business site and our site and content are not specifically directed towards children under 13 years of age. We do not target children, and we do not knowingly collect any personal details from any person under 13 years of age.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                How and why we use your data
              </h2>
              <p className="mb-6">Data protection law means that we can only use your data for certain reasons and where we have a legal basis to do so. Here are the reasons for which we process your data:</p>
              
              <ul className="space-y-4 list-none">
                <li>
                  <strong className="text-white block mb-1">Keeping Clapstick Media running</strong>
                  Managing your account, providing access to software, and billing support.
                </li>
                <li>
                  <strong className="text-white block mb-1">Improving Clapstick Media</strong>
                  Testing features, interacting with feedback platforms and questionnaires, managing landing pages, heat-mapping our site, traffic optimization and data analysis and research, including profiling and the use of machine learning and other techniques over your data and in some cases using third parties to do so.
                </li>
                <li>
                  <strong className="text-white block mb-1">Customer support</strong>
                  Notifying you of any changes to our service, solving issues via the live chat support, phone or email, including any bug fixing.
                </li>
                <li>
                  <strong className="text-white block mb-1">Marketing purposes (with your consent)</strong>
                  Sending you emails and messages about new products and features, and services. You may choose to unsubscribe from any of these relevant communications by following the unsubscribe link or instructions provided in any email we send you.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                2. Your Rights & Privacy Choices
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold mb-2">Your privacy choices and rights</h3>
                  <p className="mb-2 italic">You can choose not to provide us with personal data.</p>
                  <p>If you choose to do this, you can continue to use the website and browse its pages, but we will not be able to process transactions without a personal data.</p>
                  <p className="mt-2 text-sm italic">You can turn off cookies in your browser by changing its settings.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Your rights</h3>
                  <p>You can exercise your rights by sending an email to <span className="text-[#8B5CF6]">hello@clapstickmedia.com</span></p>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-sm">
                    <li>The right to access information we hold about you</li>
                    <li>The right to rectify inaccurate or incomplete supplementary information about you</li>
                    <li>The right to restriction of data processing</li>
                    <li>The right to erasure of data processing</li>
                    <li>The right to object to processing of data where it is done for direct marketing</li>
                    <li>The right to data portability (and to have the data sent to another data provider in a structured format)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-manrope font-bold text-white mb-6 uppercase tracking-wider">
                3. Security & Legal Policies
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold mb-2">Security</h3>
                  <p>The security of your Personal Information is important to us, and we strive to implement and maintain reasonable, commercially acceptable security procedures and practices appropriate to the nature of the information we store, in order to protect it from unauthorized access, destruction, use, modification, or disclosure.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Third parties</h3>
                  <p>Your information may be shared with third party sites that help us track applications, communicate with customers, process financial data. We partner with third parties whose policies follow the high standards held by modern law. We are not responsible for the privacy practices of any third party apps or websites mentioned in this privacy policy or sent to you via email etc. The use of this data is shared only with your primary consent according to the policy and security good practice mandated by high privacy policy.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Cookies</h3>
                  <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our service.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Changes To This Privacy Policy</h3>
                  <p>This Privacy Policy is effective as of Dec 2024 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page. We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
