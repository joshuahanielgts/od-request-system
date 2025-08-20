-- 1) Create profiles table to map auth users to student metadata and roles
create table if not exists public.profiles (
  user_id uuid primary key,
  registration_number text unique,
  role text not null default 'student', -- 'student' | 'hod' | 'faculty'
  department text,
  section text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;

create policy "Profiles are viewable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Trigger for updated_at on profiles
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 2) Helper functions for RLS
create or replace function public.current_registration_number()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select registration_number from public.profiles where user_id = auth.uid();
$$;

create or replace function public.has_profile_role(_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = _role
  );
$$;

-- 3) Add owner and array columns to od_requests for user-specific access
alter table public.od_requests
  add column if not exists owner_id uuid,
  add column if not exists student_ids_array text[];

-- Backfill student_ids_array from existing student_id CSV
update public.od_requests
set student_ids_array = regexp_split_to_array(student_id, '\\s*,\\s*')
where student_id is not null and (student_ids_array is null or array_length(student_ids_array, 1) is null);

-- Trigger to auto-set owner_id and keep student_ids_array in sync
create or replace function public.od_requests_set_defaults()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.owner_id is null then
      new.owner_id = auth.uid();
    end if;
    if new.student_ids_array is null and new.student_id is not null then
      new.student_ids_array = regexp_split_to_array(new.student_id, '\\s*,\\s*');
    end if;
  elsif tg_op = 'UPDATE' then
    if new.student_id is distinct from old.student_id then
      new.student_ids_array = regexp_split_to_array(new.student_id, '\\s*,\\s*');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists od_requests_set_defaults_trg on public.od_requests;
create trigger od_requests_set_defaults_trg
before insert or update on public.od_requests
for each row execute function public.od_requests_set_defaults();

-- 4) Tighten od_requests RLS: restrict students to their own requests, allow HOD to view/update all
-- Drop previous permissive policies
drop policy if exists "Authenticated can read od_requests" on public.od_requests;
drop policy if exists "Authenticated can insert od_requests" on public.od_requests;
drop policy if exists "Authenticated can update od_requests" on public.od_requests;

drop policy if exists "Students can view their requests" on public.od_requests;
drop policy if exists "HOD can view all requests" on public.od_requests;
drop policy if exists "Owner can update own requests" on public.od_requests;
drop policy if exists "HOD can update any request" on public.od_requests;
drop policy if exists "Authenticated can insert od_requests (strict)" on public.od_requests;

-- SELECT policies
create policy "Students can view their requests"
on public.od_requests
for select
to authenticated
using (
  (owner_id = auth.uid())
  or (
    public.current_registration_number() is not null
    and student_ids_array @> array[public.current_registration_number()]
  )
);

create policy "HOD can view all requests"
on public.od_requests
for select
to authenticated
using (public.has_profile_role('hod'));

-- UPDATE policies
create policy "Owner can update own requests"
on public.od_requests
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "HOD can update any request"
on public.od_requests
for update
to authenticated
using (public.has_profile_role('hod'))
with check (true);

-- INSERT policy (owner is set via trigger)
create policy "Authenticated can insert od_requests (strict)"
on public.od_requests
for insert
to authenticated
with check (true);

-- 5) Storage policies: keep private bucket and allow access via signed URLs
-- These policies allow API access while the app should use createSignedUrl for viewing
drop policy if exists "Authenticated can upload od-documents" on storage.objects;
drop policy if exists "Authenticated can read od-documents" on storage.objects;
drop policy if exists "Authenticated can update od-documents" on storage.objects;

create policy "Authenticated can upload od-documents"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'od-documents');

create policy "Authenticated can read od-documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'od-documents');

create policy "Authenticated can update od-documents"
on storage.objects
for update
to authenticated
using (bucket_id = 'od-documents');