import { GalleryController } from "@/backend/controllers/gallery.controller";

export async function GET(request: Request) {
  return GalleryController.handleGetGallery(request);
}
