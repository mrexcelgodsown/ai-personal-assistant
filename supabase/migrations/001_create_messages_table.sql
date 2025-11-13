-- Run this in Supabase SQL editor to create a messages table
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  role text not null,
  content text not null,
  inserted_at timestamptz default now()
);
