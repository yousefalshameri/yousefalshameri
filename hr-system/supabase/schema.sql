-- مخطط قاعدة البيانات لنظام إدارة الموظفين - منطقة الجهراء الصحية
-- نفّذه في Supabase SQL Editor

create type employee_status as enum ('على رأس العمل', 'إجازة', 'منتدب', 'موقوف');
create type contract_type  as enum ('تعيين دائم', 'عقد', 'بدل', 'ندب');
create type leave_type     as enum ('إجازة دورية', 'إجازة مرضية', 'إجازة أمومة', 'إجازة بدون راتب', 'إذن رسمي');
create type leave_status   as enum ('قيد المراجعة', 'معتمدة', 'مرفوضة');
create type attendance_state as enum ('حاضر', 'متأخر', 'غائب', 'إجازة');

create table departments (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table employees (
  id                   uuid primary key default gen_random_uuid(),
  civil_id             char(12) not null unique,
  file_number          text not null unique,
  full_name            text not null,
  job_title            text not null,
  department_id        uuid not null references departments (id),
  facility             text not null,
  status               employee_status not null default 'على رأس العمل',
  contract_type        contract_type not null,
  nationality          text not null,
  phone                text,
  email                text unique,
  hire_date            date not null,
  annual_leave_balance smallint not null default 30 check (annual_leave_balance >= 0),
  created_at           timestamptz not null default now()
);

create index employees_department_idx on employees (department_id);
create index employees_status_idx     on employees (status);

create table leave_requests (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references employees (id) on delete cascade,
  type         leave_type not null,
  start_date   date not null,
  end_date     date not null,
  status       leave_status not null default 'قيد المراجعة',
  reason       text,
  submitted_at timestamptz not null default now(),
  reviewed_by  uuid references employees (id),
  constraint leave_dates_valid check (end_date >= start_date)
);

create index leave_requests_employee_idx on leave_requests (employee_id);
create index leave_requests_status_idx   on leave_requests (status);

-- عدد الأيام محسوب من التواريخ، شامل يومي البداية والنهاية
create view leave_requests_with_days as
select lr.*, (lr.end_date - lr.start_date) + 1 as days
from leave_requests lr;

create table attendance (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees (id) on delete cascade,
  date        date not null,
  check_in    time,
  check_out   time,
  state       attendance_state not null,
  unique (employee_id, date)
);

create index attendance_date_idx on attendance (date);

-- تفعيل RLS: الوصول عبر سياسات صريحة فقط
alter table employees      enable row level security;
alter table leave_requests enable row level security;
alter table attendance     enable row level security;
alter table departments    enable row level security;
