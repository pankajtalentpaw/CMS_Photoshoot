"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface ProductCardProps {
  title: string;
  image: string;
}

const ProductCard = ({ title, image }: ProductCardProps) => {
  return (
    <div className="flex-none w-[131px] lg:w-[200px] h-[194px] lg:h-[300px] relative group overflow-hidden cursor-pointer">
      {/* Image Container (Rectangle 5/6/7) */}
      <div className="w-[131px] lg:w-[200px] h-[169px] lg:h-[260px] relative rounded-[5px] lg:rounded-[15px] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
         loading="lazy" />
      </div>
      
      {/* Label (Red Saree/Gold Necklace/etc) - Roboto 13px, 500 weight */}
      <div className="absolute left-0 right-0 bottom-0 h-[25px] lg:h-[40px] flex items-center justify-center">
        <span className="font-roboto font-medium text-[13px] lg:text-[16px] leading-[15px] text-center text-white">
          {title}
        </span>
      </div>
    </div>
  );
};

const ProductScroll = () => {
  const products = [
    { title: "Leather Handbag", image: "/assets/categories/handbag.png" },
    { title: "Designer Heels", image: "/assets/categories/footwear.png" },
    { title: "Luxury Chrono", image: "/assets/categories/watch.png" },
    { title: "Premium Eyewear", image: "/assets/categories/eyewear.png" },
    { title: "Home Aesthetics", image: "/assets/categories/home_decor.png" },
    { title: "Beauty Kit", image: "/assets/categories/beauty.png" },
  ];

  return (
    <section className="w-full px-5 mt-10 mb-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
          Recent Projects
        </h2>
        
        {/* View All Button (Frame 3) */}
        <button className="flex items-center justify-center px-[10px] py-[5px] h-6 bg-black/30 shadow-[2px_2px_2px_rgba(0,0,0,0.54)] rounded-full group cursor-pointer">
          <span className="font-roboto font-medium text-[12px] leading-[14px] text-center uppercase text-figma-gradient group-hover:scale-105 transition-transform">
            View All
          </span>
        </button>
      </div>

      {/* Responsive Projects Area (Frame 2 logic) */}
      {/* Mobile: Horizontal Scroll | Desktop: Grid */}
      <div className="flex lg:grid lg:grid-cols-4 xl:grid-cols-6 items-center gap-[15px] h-scroll recent-scroll pb-4">
        {products.map((product, idx) => (
          <ProductCard key={idx} title={product.title} image={product.image} />
        ))}
      </div>
    </section>
  );
};

export default ProductScroll;
