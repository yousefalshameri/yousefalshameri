-- بيانات تجريبية بس: حملة وحدة، ستة إعلانات، ثلاث أيام أرقام، وطلب إيقاف معلّق.
-- لا تشغّله على قاعدة فيها بيانات حقيقية.

with c as (
  insert into campaigns (name, offer, objective, audience, plan, daily_budget, lead_value, status)
  values ('حملة تجريبية', 'عرض تجريبي', 'عملاء محتملين',
          '{"age":"30-50","geo":"KW"}',
          '{"platform":"meta","split":[50,30,20],"test_first":"hook A"}',
          120, 9, 'active')
  returning id
),
a as (
  insert into ads (campaign_id, name, platform, hook, daily_budget, status)
  select c.id, v.name, v.platform, v.name, 20, 'active'
  from c, (values
    ('هوك أ · سؤال','meta'), ('هوك ب · قبل وبعد','meta'),
    ('هوك ج · عرض سعر','tiktok'), ('هوك د · شهادة عميل','tiktok'),
    ('هوك هـ · مواصفات','google'), ('هوك و · مشكلة وحل','google')
  ) as v(name, platform)
  returning id, name
),
m as (
  insert into metrics (ad_id, captured_at, spend, impressions, clicks, leads, revenue)
  select a.id, date_trunc('day', now()) - (d || ' days')::interval, 20, 4000, 90,
         case a.name
           when 'هوك أ · سؤال' then 10 when 'هوك ب · قبل وبعد' then 8
           when 'هوك ج · عرض سعر' then 3 when 'هوك د · شهادة عميل' then 6
           when 'هوك هـ · مواصفات' then 3 else 9 end,
         0
  from a, generate_series(1, 3) as d
  returning 1
),
q as (
  insert into approvals (action, ad_id, payload, reason, requested_by)
  select 'pause', bad.id,
         jsonb_build_object('move_budget_to', best.id, 'amount', 20),
         'تكلفة العميل 6.67 د.ك مقابل 2.00 للأفضل', 'dead-ad-detector'
  from a bad, a best
  where bad.name = 'هوك ج · عرض سعر' and best.name = 'هوك أ · سؤال'
  returning 1
)
insert into agent_log (agent, message) values
  ('campaign-strategist', 'قسّم 120 د.ك/يوم على 6 إعلانات بالتساوي كاختبار أول'),
  ('metrics-puller', 'سحب أرقام آخر ثلاث أيام'),
  ('dead-ad-detector', 'طلب إيقاف «هوك ج · عرض سعر»');
