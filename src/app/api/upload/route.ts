import { UploadController } from '@/backend/controllers/upload.controller';

export const runtime = "nodejs";

export async function POST(request: Request) {
  return UploadController.handleUpload(request);
}
