# غرفة تحكم الإعلانات

نظام وكلاء يدير الإعلانات: يخطّط، يكتب، يراقب، ويتعلّم. ولا شي ينشر أو ينصرف بدون موافقة المالك.

## المحتوى

| المجلد | شنو فيه |
|---|---|
| `supabase/migrations/0001_init.sql` | الجداول: `campaigns` `ads` `metrics` `approvals` `learnings` `agent_log` وملخّص `ad_stats` |
| `supabase/seed.sql` | بيانات تجريبية (لا تشغّله على قاعدة حقيقية) |
| `.claude/agents/` | ستة وكلاء: المخطّط، الكاتب، الناشر، ساحب الأرقام، كاشف الخسران، كاتب التقرير |
| `web/` | لوحة التحكم (Next.js) |

## القاعدة

مشروع Supabase: `ads-control-room` (المعرّف `svttoiwhoefbwyltonnd`، منطقة ap-south-1). الجداول مركّبة عليه وفاضية. الوكلاء يستخدمون هالمعرّف مع `execute_sql`.

## التشغيل

1. الجداول مركّبة. لمشروع ثاني شغّل `0001_init.sql` في SQL Editor.
2. في `web/`: انسخ `.env.example` إلى `.env.local` وعبّي `DATABASE_URL` و `DASHBOARD_PASSWORD`.
3. `npm install` ثم `npm run dev`.
4. افتح هالمجلد في Claude Code عشان يتعرّف على الوكلاء، واطلب: «سوّ حملة جديدة لـ...».

## شلون تمشي الدورة

1. `campaign-strategist` يكتب الخطة في `campaigns`.
2. `creative-writer` يكتب الإعلانات ويطلب نشرها في `approvals`.
3. المالك يوافق أو يرفض من اللوحة.
4. `campaign-launcher` ينفّذ الموافَق عليه على المنصّة.
5. `metrics-puller` يسحب الأرقام كل ساعة، و `dead-ad-detector` يطلب إيقاف الخسران.
6. `weekly-reporter` يكتب الدروس وصفحة الأحد.

## الناقص

- الناشر وساحب الأرقام يحتاجون وصلة للمنصّات الإعلانية (Meta / TikTok / Google). بدونها يوقفون ويبلّغون.
- الجدولة (كل ساعة وكل أحد) ما انضبطت.
