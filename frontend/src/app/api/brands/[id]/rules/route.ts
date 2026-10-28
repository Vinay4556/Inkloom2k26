import { connection } from "next/server";
import { api } from "@/backend";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  return api.listRules(req, (await params).id);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return api.createRule(req, (await params).id);
}
