import { api } from "@/backend";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; ruleId: string }> }) {
  const p = await params;
  return api.updateRule(req, p.id, p.ruleId);
}
