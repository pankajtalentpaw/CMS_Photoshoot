import { AuthController } from '@/backend/controllers/auth.controller';

export async function POST(request: Request) {
  return AuthController.register(request);
}
