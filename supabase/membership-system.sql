-- MEMBERSHIP APPLICATIONS
-- Stores every apply-form submission
create table if not exists membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  age integer not null,
  gender text not null,
  public_profile_link text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

alter table membership_applications enable row level security;

-- Users can insert their own application
create policy "Users can submit their own application"
  on membership_applications for insert
  with check (auth.uid() = user_id);

-- Users can read their own application
create policy "Users can view their own application"
  on membership_applications for select
  using (auth.uid() = user_id);

-- MEMBERS TABLE
-- Stores approved users + their referral codes
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  referral_code text not null unique,
  referral_codes_remaining integer not null default 3,
  referred_by_code text,
  joined_at timestamptz default now()
);

alter table members enable row level security;

-- Users can read their own membership record
create policy "Users can view their own membership"
  on members for select
  using (auth.uid() = user_id);