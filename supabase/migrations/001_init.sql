-- Profiles table (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Babies table
create table babies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_of_birth date not null,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now() not null
);

-- Baby members (sharing)
create table baby_members (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references babies on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  unique (baby_id, user_id)
);

-- Food items library per baby
create table food_items (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references babies on delete cascade not null,
  name text not null,
  category text not null default 'other' check (category in ('fruit', 'veggie', 'grain', 'protein', 'dairy', 'other')),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now() not null
);

-- Food logs (no meal_type — fed_at is source of truth)
create table food_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references babies on delete cascade not null,
  food_item_id uuid references food_items on delete cascade not null,
  fed_at timestamptz not null default now(),
  logged_by uuid references auth.users on delete set null,
  notes text
);

-- Indexes
create index idx_baby_members_baby on baby_members (baby_id);
create index idx_baby_members_user on baby_members (user_id);
create index idx_food_items_baby on food_items (baby_id);
create index idx_food_logs_baby on food_logs (baby_id);
create index idx_food_logs_food_item on food_logs (food_item_id);
create index idx_food_logs_fed_at on food_logs (fed_at);

-- RLS Helper functions
create or replace function is_baby_member(p_baby_id uuid)
returns boolean as $$
  select exists (
    select 1 from baby_members
    where baby_id = p_baby_id and user_id = auth.uid()
  );
$$ language sql security definer;

create or replace function is_baby_owner(p_baby_id uuid)
returns boolean as $$
  select exists (
    select 1 from baby_members
    where baby_id = p_baby_id and user_id = auth.uid() and role = 'owner'
  );
$$ language sql security definer;

-- Enable RLS
alter table profiles enable row level security;
alter table babies enable row level security;
alter table baby_members enable row level security;
alter table food_items enable row level security;
alter table food_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (id = auth.uid());
create policy "Members can view co-member profiles" on profiles for select using (
  exists (
    select 1 from baby_members bm1
    join baby_members bm2 on bm1.baby_id = bm2.baby_id
    where bm1.user_id = auth.uid() and bm2.user_id = profiles.id
  )
);
create policy "Users can update own profile" on profiles for update using (id = auth.uid());
create policy "Users can insert own profile" on profiles for insert with check (id = auth.uid());

-- Babies policies
create policy "Members can view babies" on babies for select using (is_baby_member(id));
create policy "Authenticated users can create babies" on babies for insert with check (auth.uid() is not null);
create policy "Owners can update babies" on babies for update using (is_baby_owner(id));
create policy "Owners can delete babies" on babies for delete using (is_baby_owner(id));

-- Baby members policies
create policy "Members can view members" on baby_members for select using (is_baby_member(baby_id));
create policy "Owners can add members" on baby_members for insert with check (is_baby_owner(baby_id));
create policy "Owners can remove members" on baby_members for delete using (is_baby_owner(baby_id));

-- Food items policies
create policy "Members can view food items" on food_items for select using (is_baby_member(baby_id));
create policy "Members can create food items" on food_items for insert with check (is_baby_member(baby_id));
create policy "Members can update food items" on food_items for update using (is_baby_member(baby_id));
create policy "Members can delete food items" on food_items for delete using (is_baby_member(baby_id));

-- Food logs policies
create policy "Members can view food logs" on food_logs for select using (is_baby_member(baby_id));
create policy "Members can create food logs" on food_logs for insert with check (is_baby_member(baby_id));
create policy "Members can update food logs" on food_logs for update using (is_baby_member(baby_id));
create policy "Members can delete food logs" on food_logs for delete using (is_baby_member(baby_id));

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Trigger: auto-add creator as owner in baby_members
create or replace function handle_new_baby()
returns trigger as $$
begin
  insert into baby_members (baby_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_baby_created
  after insert on babies
  for each row execute function handle_new_baby();

-- RPC: look up user ID by email (for inviting members)
create or replace function get_user_id_by_email(p_email text)
returns uuid as $$
  select id from auth.users where email = p_email limit 1;
$$ language sql security definer;
