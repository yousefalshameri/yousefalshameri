import { db } from "@/lib/db";
import { decide } from "./actions";

export const dynamic = "force-dynamic";

const ACTION: Record<string, string> = {
  launch: "نشر",
  pause: "إيقاف",
  resume: "إعادة تشغيل",
  move_budget: "تحويل ميزانية",
};
const STATUS: Record<string, [string, string]> = {
  active: ["شغّال", "on"],
  paused: ["موقّف", "off"],
  rejected: ["مرفوض", "off"],
  pending_approval: ["ينتظر قرارك", "wait"],
  draft: ["مسودة", ""],
};
const n = (v: unknown, d = 2) => Number(v).toFixed(d);

export default async function Page() {
  const sql = db();
  const [ads, totals, pending, approved, log, report] = await Promise.all([
    sql`select s.*, exists(select 1 from approvals p where p.ad_id = s.id and p.status = 'pending') as waiting
        from ad_stats s order by s.cost_per_lead nulls last, s.name`,
    sql`select coalesce(sum(s.spend),0) as spend, coalesce(sum(s.leads),0) as leads,
               coalesce(sum(case when s.revenue > 0 then s.revenue else s.leads * c.lead_value end),0) as value,
               coalesce(min(c.currency),'KWD') as currency
        from ad_stats s join campaigns c on c.id = s.campaign_id`,
    sql`select p.id, p.action, p.reason, p.requested_by, p.payload, a.name as ad, t.name as target
        from approvals p join ads a on a.id = p.ad_id
        left join ads t on t.id::text = p.payload->>'move_budget_to'
        where p.status = 'pending' order by p.created_at`,
    sql`select p.id, p.action, a.name as ad
        from approvals p join ads a on a.id = p.ad_id
        where p.status = 'approved' and p.executed_at is null order by p.decided_at`,
    sql`select agent, message from agent_log order by id desc limit 15`,
    sql`select insight, created_at from learnings where kind = 'report' order by created_at desc limit 1`,
  ]);
  const t = totals[0];
  const spend = Number(t.spend), leads = Number(t.leads);

  return (
    <main>
      <h1>غرفة تحكم الإعلانات</h1>

      <div className="kpis">
        <div className="kpi"><span className="label">الصرف ({t.currency})</span><span className="v">{n(spend, 0)}</span></div>
        <div className="kpi"><span className="label">عملاء محتملين</span><span className="v">{leads}</span></div>
        <div className="kpi"><span className="label">تكلفة العميل</span><span className="v">{leads ? n(spend / leads) : "–"}</span></div>
        <div className="kpi"><span className="label">العائد لكل دينار</span><span className="v">{spend ? n(Number(t.value) / spend) : "–"}</span></div>
      </div>

      <div className="panel">
        <h2>الإعلانات</h2>
        <div className="scroll">
          <table>
            <thead>
              <tr><th>الإعلان</th><th>المنصّة</th><th className="r">ميزانية/يوم</th><th className="r">الصرف</th><th className="r">عملاء</th><th className="r">تكلفة العميل</th><th>الحالة</th></tr>
            </thead>
            <tbody>
              {ads.map((a) => {
                const [label, cls] = a.waiting ? STATUS.pending_approval : STATUS[a.status] ?? [a.status, ""];
                return (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td className="num">{a.platform}</td>
                    <td className="r num">{n(a.daily_budget, 0)}</td>
                    <td className="r num">{n(a.spend, 0)}</td>
                    <td className="r num">{Number(a.leads)}</td>
                    <td className="r num">{a.cost_per_lead === null ? "–" : n(a.cost_per_lead)}</td>
                    <td><span className={`pill ${cls}`}>{label}</span></td>
                  </tr>
                );
              })}
              {!ads.length && <tr><td colSpan={7} className="muted">ما في إعلانات للحين. شغّل وكيل المخطّط عشان يبني أول حملة.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cols">
        <div className="panel">
          <h2>بانتظار موافقتك</h2>
          {pending.map((p) => (
            <div className="req" key={p.id}>
              <span>
                {ACTION[p.action] ?? p.action} «{p.ad}»
                {p.target && <> وتحويل <span className="num">{n(p.payload?.amount ?? 0, 0)}</span> /يوم إلى «{p.target}»</>}
                <span className="label">{p.reason} · <span className="num">{p.requested_by}</span></span>
              </span>
              <form action={decide}>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn" name="decision" value="approved">موافق</button>
                <button className="btn no" name="decision" value="rejected">رفض</button>
              </form>
            </div>
          ))}
          {!pending.length && <span className="muted">ما في طلبات معلّقة.</span>}
          {approved.length > 0 && (
            <>
              <span className="label">وافقت عليها وتنتظر الناشر ينفّذها</span>
              {approved.map((p) => (
                <span key={p.id}>{ACTION[p.action] ?? p.action} «{p.ad}» <span className="pill wait">ما تنفّذ بعد</span></span>
              ))}
            </>
          )}
        </div>

        <div className="panel">
          <h2>سجل الوكلاء</h2>
          <ul className="log">
            {log.map((l, i) => (<li key={i}><b>{l.agent}</b> {l.message}</li>))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <h2>صفحة الأحد</h2>
        {report.length
          ? <p className="report" style={{ margin: 0 }}>{report[0].insight}</p>
          : <span className="muted">أول تقرير ينكتب لما يشتغل وكيل weekly-reporter.</span>}
      </div>
    </main>
  );
}
