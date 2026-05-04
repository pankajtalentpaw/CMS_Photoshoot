import { ApproveController } from "@/backend/controllers/status.controller";

export async function POST(request: Request) {
  return ApproveController.handleApprove(request);
}
