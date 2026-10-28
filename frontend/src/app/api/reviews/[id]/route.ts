import { connection } from "next/server";
import { api } from "@/backend";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  return api.getReview(req, (await params).id);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return api.deleteReview(req, (await params).id);
}
