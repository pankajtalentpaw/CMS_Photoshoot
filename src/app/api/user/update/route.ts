import { UserController } from '@/backend/controllers/user.controller';

export async function PUT(request: Request) {
  return UserController.updateProfile(request);
}
