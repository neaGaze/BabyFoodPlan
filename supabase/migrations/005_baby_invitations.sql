create table baby_invitations (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references babies on delete cascade not null,
  email text not null,
  invited_by uuid references auth.users on delete set null,
  token uuid not null default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending','accepted','expired','cancelled')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create unique index idx_unique_pending_invite
  on baby_invitations (baby_id, email) where status = 'pending';
create index idx_baby_invitations_token on baby_invitations (token);

alter table baby_invitations enable row level security;

create policy "Owners can view invitations"
  on baby_invitations for select using (is_baby_owner(baby_id));
create policy "Owners can insert invitations"
  on baby_invitations for insert with check (is_baby_owner(baby_id));
create policy "Owners can update invitations"
  on baby_invitations for update using (is_baby_owner(baby_id));
