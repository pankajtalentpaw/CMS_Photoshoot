import { StatusController } from '@/backend/controllers/status.controller';

export async function GET(request: Request) {
  return StatusController.handleStatus(request);
}
