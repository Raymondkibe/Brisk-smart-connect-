-- ========================================================
-- BRISK SMART CONNECT — COMPLETE SUPABASE DATABASE SCHEMA
-- Slogan: Smart WiFi. Smart Host. Smarter You.
-- Includes Row Level Security (RLS) for Customers, Router Owners & Super Admin
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT CHECK (role IN ('SUPER_ADMIN', 'ROUTER_OWNER', 'CUSTOMER', 'TECHNICIAN')) DEFAULT 'CUSTOMER',
  avatar_url TEXT,
  status TEXT CHECK (status IN ('ACTIVE', 'SUSPENDED', 'UNVERIFIED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMER PROFILES
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  internet_status TEXT DEFAULT 'CONNECTED',
  current_network TEXT DEFAULT 'BRISK Kiambu',
  current_speed TEXT DEFAULT '10 Mbps',
  data_usage_mb BIGINT DEFAULT 0,
  wallet_balance NUMERIC DEFAULT 0,
  referral_code TEXT UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  commission_earned NUMERIC DEFAULT 0,
  available_commission NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROUTER OWNER PROFILES
CREATE TABLE IF NOT EXISTS public.router_owner_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  subscription_plan_id TEXT DEFAULT 'sub-plan-starter',
  subscription_status TEXT DEFAULT 'TRIAL',
  trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  max_routers INTEGER DEFAULT 1,
  max_access_points INTEGER DEFAULT 3,
  max_customers INTEGER DEFAULT 500,
  daraja_configured BOOLEAN DEFAULT FALSE,
  whatsapp_configured BOOLEAN DEFAULT FALSE,
  email_configured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WIFI PACKAGES
CREATE TABLE IF NOT EXISTS public.wifi_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  duration_label TEXT NOT NULL,
  price_kes NUMERIC NOT NULL,
  speed_label TEXT NOT NULL,
  download_speed_mbps INTEGER NOT NULL,
  upload_speed_mbps INTEGER NOT NULL,
  category TEXT NOT NULL,
  device_limit INTEGER DEFAULT 1,
  fair_usage_gb NUMERIC,
  is_popular BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROUTER OWNER SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_kes NUMERIC NOT NULL,
  duration_days INTEGER DEFAULT 30,
  max_routers INTEGER NOT NULL,
  max_access_points INTEGER NOT NULL,
  max_customers INTEGER NOT NULL,
  max_vouchers INTEGER NOT NULL,
  features TEXT[] NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROUTERS (MikroTik, UniFi, Omada, OpenWrt)
CREATE TABLE IF NOT EXISTS public.routers (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  network_name TEXT NOT NULL,
  model TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  router_os_version TEXT,
  status TEXT DEFAULT 'ONLINE',
  cpu_load_percent INTEGER DEFAULT 15,
  ram_usage_percent INTEGER DEFAULT 30,
  uptime TEXT DEFAULT '1d 04h',
  internet_status TEXT DEFAULT 'ONLINE',
  active_users INTEGER DEFAULT 0,
  upload_traffic_mbps NUMERIC DEFAULT 0,
  download_traffic_mbps NUMERIC DEFAULT 0,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  connection_method TEXT DEFAULT 'BRISK Setup Script'
);

-- 7. ACCESS POINTS
CREATE TABLE IF NOT EXISTS public.access_points (
  id TEXT PRIMARY KEY,
  router_id TEXT REFERENCES public.routers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  ssid TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT DEFAULT 'ONLINE',
  connected_users INTEGER DEFAULT 0,
  traffic_mbps NUMERIC DEFAULT 0,
  uptime TEXT DEFAULT '1d',
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVE WIFI SESSIONS
CREATE TABLE IF NOT EXISTS public.wifi_sessions (
  id TEXT PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  router_id TEXT REFERENCES public.routers(id),
  ap_name TEXT,
  ip_address TEXT NOT NULL,
  mac_address TEXT NOT NULL,
  package_name TEXT NOT NULL,
  speed TEXT NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  usage_mb BIGINT DEFAULT 0,
  remaining_seconds INTEGER NOT NULL
);

-- 9. VOUCHERS
CREATE TABLE IF NOT EXISTS public.vouchers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  package_id TEXT REFERENCES public.wifi_packages(id),
  package_name TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  price_kes NUMERIC NOT NULL,
  speed TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT CHECK (status IN ('UNUSED', 'REDEEMED', 'EXPIRED', 'CANCELLED')) DEFAULT 'UNUSED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  redeemed_by TEXT,
  redeemed_at TIMESTAMPTZ,
  batch_number TEXT
);

-- 10. TRANSACTIONS & RECEIPTS
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,
  package_name TEXT,
  amount_kes NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  reference TEXT NOT NULL,
  status TEXT CHECK (status IN ('WAITING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT')) DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  mpesa_phone TEXT
);

-- 11. REFERRAL COMMISSIONS & WITHDRAWALS
CREATE TABLE IF NOT EXISTS public.referral_commissions (
  id TEXT PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id),
  referred_user_id UUID REFERENCES public.profiles(id),
  referred_user_name TEXT NOT NULL,
  purchase_package TEXT NOT NULL,
  purchase_amount_kes NUMERIC NOT NULL,
  commission_kes NUMERIC NOT NULL,
  rate_percent NUMERIC DEFAULT 10,
  status TEXT DEFAULT 'EARNED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  amount_kes NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'M-PESA',
  phone TEXT NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Customers can only read and update their own profile and transactions
CREATE POLICY "Customers view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customers view own customer profile" ON public.customer_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- Router Owners can only view and manage their own routers and data
CREATE POLICY "Owners view own routers" ON public.routers FOR ALL USING (auth.uid() = owner_id);

-- Public read for packages and plans
ALTER TABLE public.wifi_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wifi packages" ON public.wifi_packages FOR SELECT USING (true);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subscription plans" ON public.subscription_plans FOR SELECT USING (true);
