import { connection } from "next/server";
import { api } from "@/backend";

export async function GET(req: Request) {
  await connection();
  return api.analytics(req);
}
