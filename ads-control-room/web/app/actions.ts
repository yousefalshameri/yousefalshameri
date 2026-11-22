"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function decide(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!UUID.test(id) || (decision !== "approved" && decision !== "rejected")) return;

  const sql = db();
  await sql.begin(async (tx) => {
    // القرار ينحفظ بس. التنفيذ على المنصّة شغل وكيل campaign-launcher.
    const rows = await tx`
      update approvals set status = ${decision}, decided_at = now()
      where id = ${id} and status = 'pending'
      returning action, ad_id`;
    if (!rows.length) return;
    const [ad] = await tx`select name from ads where id = ${rows[0].ad_id}`;
    if (decision === "rejected" && rows[0].action === "launch")
      await tx`update ads set status = 'rejected' where id = ${rows[0].ad_id}`;
    const verb = decision === "approved" ? "وافق على" : "رفض";
    await tx`insert into agent_log (agent, message)
             values ('owner', ${`${verb} طلب ${rows[0].action} للإعلان «${ad?.name ?? ""}»`})`;
  });
  revalidatePath("/");
}
