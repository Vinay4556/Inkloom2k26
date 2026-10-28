import { connection } from "next/server";
import { api } from "@/backend";

export async function GET(req: Request) {
  await connection();
  return api.listReviews(req);
}

export async function POST(req: Request) {
  return api.createReview(req);
}
