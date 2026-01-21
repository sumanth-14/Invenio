-- Create Companies Table
create table companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  active boolean default true,
  type text default 'generic', -- 'generic' or specific like 'greenhouse', 'levis', etc.
  created_at timestamp with time zone default now()
);

-- Create Roles Table
create table roles (
  id uuid default gen_random_uuid() primary key,
  keyword text not null,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Create Jobs Table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  url text not null unique, -- Prevent duplicate jobs by URL
  date_found timestamp with time zone default now(),
  is_new boolean default true
);

-- Seed some initial data
insert into roles (keyword) values ('Software Engineer'), ('Frontend Developer');
