// Re-export shim — all logic has moved to hubs/VirtualTryOn/index.ts
export {
  VTON_IDENTITY_LOCK,
  VTON_NEGATIVE_PROMPT,
  buildVirtualTryOnPrompt,
  buildApparelVTONPrompt,
  buildJewelleryVTONPrompt,
  buildAccessoriesVTONPrompt,
} from "./hubs/VirtualTryOn";
