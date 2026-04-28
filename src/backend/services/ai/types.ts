/**
 * DIGITAL ATELIER — AI PIPELINE TYPES (v2.0)
 * Strong typing + extensibility + safer defaults
 */

// ── CORE ENUMS ─────────────────────────────────────────────

export type Hub = "Apparel" | "Jewellery" | "Accessories" | "Products";

export type Mode = "Virtual Try-On" | "AI Studio" | "VIDEO_GENERATION";

export type OutputStyle =
  | "Catalog"
  | "Premium"
  | "Social Media"
  | "Lifestyle";

export type Background =
  | "White Studio"
  | "Premium Studio"
  | "Saree Festival"
  | "Outdoor"
  | "Modern Office";

// Strongly typed views (better than string[])
export type OutputView =
  | "Front"
  | "Left"
  | "Right"
  | "Back"
  | "Close-up"
  | "Detail"
  | "Custom";

// Predefined motion styles
export type VideoStyle =
  | "Straight Walk"
  | "Slow Turn"
  | "Elegant Reveal"
  | "Fabric Flow"
  | "Custom";

// ── SHARED INPUTS ─────────────────────────────────────────

export interface SharedInputs {
  hub: Hub;
  mode?: Mode;

  productImageUrl: string;
  modelRefUrl?: string | null;

  outputStyle?: OutputStyle;
  background?: Background;

  aiNotes?: string | null;

  outputViews?: OutputView[];
  videoStyle?: VideoStyle;

  // 🔥 NEW: control flags (very useful in pipelines)
  strictIdentity?: boolean;   // default true for VTON
  highDetail?: boolean;       // boosts texture fidelity
}

// ── APPAREL ───────────────────────────────────────────────

export type Segment = "Ladies" | "Gents" | "Kids";

export type WearType = "Ethnic Wear" | "Western Wear" | "Custom";

export interface ApparelInputs extends SharedInputs {
  hub: "Apparel";

  segment?: Segment;
  wearType?: WearType;

  productType?: string; // e.g., Saree, Kurta, Dress
}

// ── JEWELLERY ─────────────────────────────────────────────

export type JewelleryGenre =
  | "Bridal"
  | "Fashion"
  | "Traditional / Vintage"
  | "Daily Wear / Minimal"
  | "Custom";

export interface JewelleryInputs extends SharedInputs {
  hub: "Jewellery";

  jewelleryGenre?: JewelleryGenre;
  jewelleryStyle?: string;
}

// ── ACCESSORIES ───────────────────────────────────────────

export type AccessoryType =
  | "Bags"
  | "Footwear"
  | "Watches"
  | "Eyewear"
  | "Belts"
  | "Scarves / Small Accessories"
  | "Custom";

export interface AccessoriesInputs extends SharedInputs {
  hub: "Accessories";

  accessoryType?: AccessoryType;
}

// ── PRODUCTS ──────────────────────────────────────────────

export type ProductFamily =
  | "Home Decor"
  | "Beauty / Cosmetics"
  | "Handicrafts"
  | "Packaged Products"
  | "Gifts / Lifestyle"
  | "Custom";

export interface ProductsInputs extends SharedInputs {
  hub: "Products";

  productFamily?: ProductFamily;
}

// ── DISCRIMINATED UNION (VERY IMPORTANT) ──────────────────

export type PromptInputs =
  | ApparelInputs
  | JewelleryInputs
  | AccessoriesInputs
  | ProductsInputs;