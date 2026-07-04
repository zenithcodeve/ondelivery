-- Supabase SQL schema para On Delivery
-- Ejecuta este script en el editor SQL de Supabase para crear las tablas necesarias.

-- Tabla de perfiles de usuarios (aliado, motorizado, admin)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text check (role in ('aliado', 'motorizado', 'admin')),
  business_name text,
  assigned_commerce text,
  assigned_commerce_id uuid references public.profiles(id) on delete set null,
  active_order boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabla de pedidos
create table if not exists public.orders (
  id bigserial primary key,
  commerce_id uuid references public.profiles(id) on delete set null,
  commerce_name text not null,
  requested_by uuid references public.profiles(id) on delete set null,
  requested_by_name text,
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  delivery_url text,
  description text,
  price numeric(10,2) default 0,
  urgent boolean default false,
  normal boolean default true,
  status text not null check (status in ('pending', 'assigned', 'on_way', 'delivered', 'reopened', 'canceled')),
  assigned_to_id uuid references public.profiles(id) on delete set null,
  assigned_to text,
  assigned_at timestamp with time zone,
  started_at timestamp with time zone,
  delivered_at timestamp with time zone,
  reopened_at timestamp with time zone,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_assigned_to_idx on public.orders (assigned_to_id);
create index if not exists orders_commerce_idx on public.orders (commerce_id);
create index if not exists orders_created_at_idx on public.orders (created_at);
create index if not exists orders_delivered_at_idx on public.orders (delivered_at);
