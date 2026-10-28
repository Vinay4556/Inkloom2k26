import { connection } from "next/server";
import { api } from "@/backend";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  return api.getBrand(req, (await params).id);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return api.updateBrand(req, (await params).id);
}
