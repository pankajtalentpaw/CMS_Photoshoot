import type { Metadata } from "next";
import { Inter, Roboto, Manrope } from "next/font/google";
import { Providers } from "@/frontend/components/Providers";
import "./globals.css";

const fontInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fontRoboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const fontManrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Atelier | AI Fashion Studio",
  description: "Advanced AI-powered ethnic wear product generation for modern brands.",
  keywords: ["AI Fashion", "SaaS", "Ethnic Wear", "Next.js", "MongoDB", "NextAuth"],
  authors: [{ name: "Digital Atelier" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontInter.variable} ${fontRoboto.variable} ${fontManrope.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
