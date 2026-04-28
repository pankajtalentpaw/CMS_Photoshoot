import { GenerateController } from '@/backend/controllers/generate.controller';

export async function POST(request: Request) {
  return GenerateController.handleGeneration(request);
}
