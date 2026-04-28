import { UserController } from '@/backend/controllers/user.controller';

export async function GET() {
  return UserController.getProfile();
}
