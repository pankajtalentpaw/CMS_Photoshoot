export interface TaxonomyNode {
  title: string;
  image: string;
  leafNodes?: string[];
  fullWidth?: boolean;
  samples?: string[];
  recommendedViews?: string[];
}

export const TAXONOMY: Record<string, any> = {
  apparel: {
    segments: ["Ladies", "Gents", "Kids"],
    styles: {
      Ladies: [
        { 
          title: "Ethnic Wear", 
          image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", 
          leafNodes: ["Saree", "Kurti", "Kurta Set", "Salwar Suit", "Lehenga", "Dupatta Set", "Blouse", "Other"],
          samples: [
            "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg",
            "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg",
            "/assets/ladies/ethnic-wear/elegant-purple-gold-banarasi-silk-sari-with-intricate-weaving.jpg",
            "/assets/ladies/ethnic-wear/ethnic_wear_sample_4.png"
          ],
          recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"]
        },
        { 
          title: "Western Wear", 
          image: "/assets/ladies/western-wear/photo-beautiful-female-model.jpg", 
          leafNodes: ["Dress", "Top", "Shirt", "Blouse", "Skirt", "Co-ord Set", "Gown / Partywear", "Other"],
          samples: [
            "/assets/ladies/western-wear/photo-beautiful-female-model.jpg",
            "/hero_image.png"
          ],
          recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"]
        },
        { title: "Custom", image: "/hero_image.png", fullWidth: true, leafNodes: ["Custom Design", "Other"] }
      ],
      Gents: [
        { 
          title: "Ethnic Wear", 
          image: "/assets/men/ethnic-wear/elegant-indian-man-culture-character.jpg", 
          leafNodes: ["Kurta", "Sherwani", "Nehru Jacket", "Ethnic Set", "Other"],
          recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"]
        },
        { title: "Western Wear", image: "/assets/men/western-wear/men-fashion-editorial-outdoors.jpg", leafNodes: ["Shirt", "T-shirt", "Blazer", "Jacket", "Trousers", "Casual Set", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
        { title: "Custom", image: "/hero_image.png", fullWidth: true, leafNodes: ["Custom Design", "Other"] }
      ],
      Kids: [
        { title: "Ethnic Wear", image: "/hero_image.png", leafNodes: ["Kids Kurta Set", "Kids Lehenga", "Festive Set", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
        { title: "Western Wear", image: "/hero_image.png", leafNodes: ["Frock", "Shirt", "Top", "Bottomwear", "Partywear Set", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
        { title: "Custom", image: "/hero_image.png", fullWidth: true, leafNodes: ["Custom Design", "Other"] }
      ]
    }
  },
  jewellery: {
    segments: ["Bridal", "Fashion", "Traditional", "Daily Wear"],
    styles: {
      leafNodes: {
        Bridal: ["Full Set", "Choker Set", "Necklace Set", "Earrings", "Bangles", "Maang Tikka", "Other"],
        Fashion: ["Earrings", "Rings", "Bracelets", "Necklaces", "Office-wear Sets", "Other"],
        Traditional: ["Temple", "Kundan", "Antique Finish", "Polki-style", "Festive Sets", "Other"],
        Daily: ["Studs", "Thin Chains", "Light Bracelets", "Minimal Rings", "Other"],
        Custom: ["Open Prompt", "Unsupported Style", "Other"]
      },
      recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"]
    }
  },
  accessories: {
    styles: [
      { title: "Bags", image: "/assets/categories/handbag.png", leafNodes: ["Handbag", "Backpack", "Clutch", "Tote", "Sling Bag", "Briefcase", "Duffel", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Footwear", image: "/assets/categories/footwear.png", leafNodes: ["Sneakers", "Heels", "Boots", "Formal Shoes", "Loafers", "Sandals", "Flip Flops", "Other"], recommendedViews: ["Pair View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Watches", image: "/assets/categories/watch.png", leafNodes: ["Luxury", "Sports", "Smartwatch", "Vintage", "Minimalist", "Chronograph", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Eyewear", image: "/assets/categories/eyewear.png", leafNodes: ["Sunglasses", "Optical Frames", "Sport Glasses", "Reading Glasses", "Blue Light", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Belts", image: "/assets/categories/belts.png", leafNodes: ["Leather", "Fabric", "Formal", "Casual", "Braided", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Scarves / Small Accessories", image: "/assets/categories/scarves.png", leafNodes: ["Silk Scarf", "Woolen Muffler", "Bandana", "Stole", "Shawl", "Pins", "Gloves", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Custom / Other", image: "/assets/categories/custom_accessory.png", fullWidth: true, leafNodes: ["Custom Item", "Other"] }
    ]
  },
  products: {
    families: [
      { title: "Home Decor", image: "/assets/categories/home_decor.png", leafNodes: ["Vase", "Lamp", "Wall Art", "Cushion", "Rug", "Ornament", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Beauty / Cosmetics", image: "/assets/categories/beauty.png", leafNodes: ["Serum", "Cream", "Lipstick", "Perfume", "Facewash", "Oil", "Other"], recommendedViews: ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"] },
      { title: "Handicrafts", image: "/assets/categories/handicrafts.png", leafNodes: ["Woodwork", "Pottery", "Metalwork", "Textiles", "Bamboo", "Other"] },
      { title: "Packaged Products", image: "/assets/categories/packaged_products.png", leafNodes: ["Box", "Bottle", "Jar", "Pouch", "Tube", "Other"] },
      { title: "Gifts / Lifestyle", image: "/assets/categories/gifts.png", fullWidth: true, leafNodes: ["Gift Set", "Hamper", "Journal", "Accessory", "Other"] },
      { title: "Custom / Other", image: "/assets/categories/custom_product.png", fullWidth: true, leafNodes: ["Custom Product", "Other"] }
    ]
  }
};
