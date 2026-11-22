-- غرفة تحكم الإعلانات: الحالة المشتركة بين الوكلاء
-- الوكلاء ما يكلّمون بعض؛ كلهم يقرون ويكتبون في هالجداول.

create extension if not exists pgcrypto;

-- 1) الحملات: يكتبها المخطّط
create table campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  offer         text not null,
  objective     text,
  audience      jsonb not null default '{}',
  plan          jsonb not null default '{}',          -- campaign-plan.json كامل
  daily_budget  numeric(10,3) not null default 0 check (daily_budget >= 0),
  currency      text not null default 'KWD',
  lead_value    numeric(10,3) not null default 0,     -- قيمة العميل المحتمل لحساب العائد
  status        text not null default 'draft'
                check (status in ('draft','active','paused','done')),
  created_at    timestamptz not null default now()
);

-- 2) الإعلانات: يكتبها الاستوديو، ويحدّث حالتها الناشر
create table ads (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references campaigns(id) on delete cascade,
  name          text not null,
  platform      text not null check (platform in ('meta','tiktok','google')),
  hook          text,
  script        text,
  asset_url     text,
  external_id   text,                                  -- رقم الإعلان في المنصّة بعد النشر
  daily_budget  numeric(10,3) not null default 0 check (daily_budget >= 0),
  status        text not null default 'draft'
                check (status in ('draft','pending_approval','active','paused','rejected')),
  created_at    timestamptz not null default now()
);
create index ads_campaign_idx on ads(campaign_id);

-- 3) الأرقام: يكتبها ساحب الأرقام كل ساعة (قيم الساعة نفسها، مو تراكمي)
create table metrics (
  id            bigint generated always as identity primary key,
  ad_id         uuid not null references ads(id) on delete cascade,
  captured_at   timestamptz not null,
  spend         numeric(10,3) not null default 0,
  impressions   integer not null default 0,
  clicks        integer not null default 0,
  leads         integer not null default 0,
  revenue       numeric(10,3) not null default 0,
  unique (ad_id, captured_at)
);

-- 4) البوّابة: أي نشر أو إيقاف أو تحويل ميزانية ينكتب هني وينتظر قرارك
create table approvals (
  id            uuid primary key default gen_random_uuid(),
  action        text not null check (action in ('launch','pause','resume','move_budget')),
  ad_id         uuid not null references ads(id) on delete cascade,
  payload       jsonb not null default '{}',           -- مثل {"move_budget_to": "<ad_id>", "amount": 20}
  reason        text not null,
  requested_by  text not null,                         -- اسم الوكيل
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now(),
  decided_at    timestamptz,
  executed_at   timestamptz                            -- يعبّيها الناشر بعد التنفيذ على المنصّة
);
-- طلب واحد معلّق لكل إعلان ولكل نوع إجراء
create unique index approvals_one_pending on approvals(ad_id, action) where status = 'pending';

-- 5) الدروس: يكتبها العقل
create table learnings (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid references campaigns(id) on delete set null,
  ad_id         uuid references ads(id) on delete set null,
  kind          text not null default 'hook' check (kind in ('hook','audience','platform','budget','report')),
  insight       text not null,
  evidence      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

-- سجل الوكلاء: سطر لكل شي يسويه أي وكيل
create table agent_log (
  id            bigint generated always as identity primary key,
  agent         text not null,
  message       text not null,
  created_at    timestamptz not null default now()
);

-- ملخّص كل إعلان: اللوحة والوكلاء يقرون من هني
create view ad_stats with (security_invoker = true) as
select
  a.id, a.campaign_id, a.name, a.platform, a.status, a.daily_budget,
  coalesce(sum(m.spend), 0)   as spend,
  coalesce(sum(m.leads), 0)   as leads,
  coalesce(sum(m.revenue), 0) as revenue,
  case when coalesce(sum(m.leads), 0) > 0
       then round(sum(m.spend) / sum(m.leads), 3) end as cost_per_lead
from ads a
left join metrics m on m.ad_id = a.id
group by a.id;

-- الحماية: RLS شغّال وبدون سياسات، يعني مفتاح anon ما يقرا ولا يكتب شي.
-- اللوحة والوكلاء يدخلون باتصال قاعدة مباشر أو مفتاح service role بس.
alter table campaigns enable row level security;
alter table ads       enable row level security;
alter table metrics   enable row level security;
alter table approvals enable row level security;
alter table learnings enable row level security;
alter table agent_log enable row level security;
