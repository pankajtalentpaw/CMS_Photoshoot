import { NextResponse } from "next/server";
import { swaggerSpec } from "@/backend/routes/swagger";

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
