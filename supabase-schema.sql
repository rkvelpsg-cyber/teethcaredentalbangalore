-- ═══════════════════════════════════════════════════════
--  ASIAN DENTAL CLINIC – Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════

-- Enable pgcrypto for SHA-256 password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ═══════════════════════════════════════════════════════
--  MIGRATION — Add new columns to existing tables
--  Safe to re-run (uses IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════
ALTER TABLE online_enquiries ADD COLUMN IF NOT EXISTS assigned_to        TEXT;
ALTER TABLE online_enquiries ADD COLUMN IF NOT EXISTS assigned_at        TIMESTAMPTZ;
ALTER TABLE online_enquiries ADD COLUMN IF NOT EXISTS appointment_status TEXT DEFAULT 'pending';
ALTER TABLE online_enquiries ADD COLUMN IF NOT EXISTS appointment_date   DATE;
ALTER TABLE online_enquiries ADD COLUMN IF NOT EXISTS appointment_time   TEXT;
ALTER TABLE online_enquiries ADD COLUMN IF NOT EXISTS admin_notes        TEXT;

-- 0. DOCTORS (Login credentials)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id            BIGSERIAL PRIMARY KEY,
  doctor_code   TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  avatar        TEXT DEFAULT 'DR',
  specialization TEXT,
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO doctors (doctor_code, name, avatar, specialization, password_hash)
VALUES
  ('drhumayun', 'Dr. Humayun Aleem', 'HA',
   'Dental Surgeon – Root Canal, Implants, Smile Designing',
   encode(digest('Doctor1@2026', 'sha256'), 'hex')),
  ('drameena',  'Dr. Ameena Tabassum', 'AT',
   'Dental Surgeon – Cosmetic Dentistry, Aligners, Implants',
   encode(digest('Doctor2@2026', 'sha256'), 'hex'))
ON CONFLICT (doctor_code) DO NOTHING;

-- 0b. ADMINS (Front-desk / appointment staff)
-- ─────────────────────────────────────────────────────────
--  ⚠️  Change 'Admin@2026' to your desired admin password before running!
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            BIGSERIAL PRIMARY KEY,
  admin_code    TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admins (admin_code, name, password_hash)
VALUES ('admin01', 'Admin Staff', encode(digest('Admin@2026', 'sha256'), 'hex'))
ON CONFLICT (admin_code) DO NOTHING;

-- 1. ONLINE ENQUIRIES
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS online_enquiries (
  id                 BIGSERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  phone              TEXT NOT NULL,
  email              TEXT,
  message            TEXT,
  status             TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  assigned_to        TEXT,                          -- admin_code assigned by doctor
  assigned_at        TIMESTAMPTZ,
  appointment_status TEXT DEFAULT 'pending'
    CHECK (appointment_status IN ('pending', 'confirmed', 'not_confirmed')),
  appointment_date   DATE,
  appointment_time   TEXT,
  admin_notes        TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APPOINTMENTS
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                BIGSERIAL PRIMARY KEY,
  patient_name      TEXT NOT NULL,
  phone             TEXT NOT NULL,
  appointment_date  DATE,
  appointment_time  TEXT,
  treatment         TEXT,
  status            TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  enquiry_id        BIGINT REFERENCES online_enquiries(id),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════

ALTER TABLE doctors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_enquiries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;

-- DROP existing policies before recreating
DROP POLICY IF EXISTS "doctors_select"     ON doctors;
DROP POLICY IF EXISTS "admins_select"      ON admins;
DROP POLICY IF EXISTS "enquiries_insert"   ON online_enquiries;
DROP POLICY IF EXISTS "enquiries_select"   ON online_enquiries;
DROP POLICY IF EXISTS "enquiries_update"   ON online_enquiries;
DROP POLICY IF EXISTS "enquiries_delete"   ON online_enquiries;
DROP POLICY IF EXISTS "appointments_all"   ON appointments;

CREATE POLICY "doctors_select"   ON doctors          FOR SELECT TO anon USING (true);
CREATE POLICY "admins_select"    ON admins           FOR SELECT TO anon USING (true);
CREATE POLICY "enquiries_insert" ON online_enquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "enquiries_select" ON online_enquiries FOR SELECT TO anon USING (true);
CREATE POLICY "enquiries_update" ON online_enquiries FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "enquiries_delete" ON online_enquiries FOR DELETE TO anon USING (true);
CREATE POLICY "appointments_all" ON appointments     FOR ALL    TO anon USING (true) WITH CHECK (true);


-- Enable pgcrypto for SHA-256 password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 0. DOCTORS (Login credentials)
-- ─────────────────────────────────────────────────────────
--  ⚠️  CHANGE the passwords below before running this SQL!
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id            BIGSERIAL PRIMARY KEY,
  doctor_code   TEXT UNIQUE NOT NULL,        -- used as login username
  name          TEXT NOT NULL,
  avatar        TEXT DEFAULT 'DR',
  specialization TEXT,
  password_hash TEXT NOT NULL,               -- SHA-256 hex of the password
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Insert doctor accounts
-- ⚠️  Replace 'Asian@Dental2024' with your own passwords before running!
INSERT INTO doctors (doctor_code, name, avatar, specialization, password_hash)
VALUES
  (
    'drhumayun',
    'Dr. Humayun Aleem',
    'HA',
    'Dental Surgeon – Root Canal, Implants, Smile Designing',
    encode(digest('Doctor1@2026', 'sha256'), 'hex')
  ),
  (
    'drameena',
    'Dr. Ameena Tabassum',
    'AT',
    'Dental Surgeon – Cosmetic Dentistry, Aligners, Implants',
    encode(digest('Doctor2@2026', 'sha256'), 'hex')
  )
ON CONFLICT (doctor_code) DO NOTHING;

-- 1. ONLINE ENQUIRIES
--    Stores patient enquiries submitted via "Book a Consultation" form
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS online_enquiries (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  message     TEXT,
  status      TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRESCRIPTIONS
--    Stores prescriptions written by doctors from the dashboard
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id                BIGSERIAL PRIMARY KEY,
  patient_name      TEXT NOT NULL,
  patient_phone     TEXT NOT NULL,
  diagnosis         TEXT,
  medicines         TEXT,
  instructions      TEXT,
  follow_up         TEXT,
  prescription_date DATE DEFAULT CURRENT_DATE,
  doctor_name       TEXT DEFAULT 'Dr. Humayun Aleem',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPOINTMENTS
--    Stores patient appointments (manual & from enquiries)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                BIGSERIAL PRIMARY KEY,
  patient_name      TEXT NOT NULL,
  phone             TEXT NOT NULL,
  appointment_date  DATE,
  appointment_time  TEXT,
  treatment         TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════

ALTER TABLE doctors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_enquiries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments       ENABLE ROW LEVEL SECURITY;

-- doctors: anon can SELECT only (for login verification — no write access)
DROP POLICY IF EXISTS "doctors_select"     ON doctors;
CREATE POLICY "doctors_select" ON doctors FOR SELECT TO anon USING (true);

-- online_enquiries: public can INSERT (patient form), anon can SELECT/UPDATE/DELETE (dashboard)
DROP POLICY IF EXISTS "enquiries_insert"   ON online_enquiries;
DROP POLICY IF EXISTS "enquiries_select"   ON online_enquiries;
DROP POLICY IF EXISTS "enquiries_update"   ON online_enquiries;
DROP POLICY IF EXISTS "enquiries_delete"   ON online_enquiries;
CREATE POLICY "enquiries_insert" ON online_enquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "enquiries_select" ON online_enquiries FOR SELECT TO anon USING (true);
CREATE POLICY "enquiries_update" ON online_enquiries FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "enquiries_delete" ON online_enquiries FOR DELETE TO anon USING (true);

-- prescriptions: anon full access (doctor dashboard)
DROP POLICY IF EXISTS "prescriptions_all" ON prescriptions;
CREATE POLICY "prescriptions_all"  ON prescriptions  FOR ALL TO anon USING (true) WITH CHECK (true);

-- appointments: anon full access (doctor dashboard)
DROP POLICY IF EXISTS "appointments_all"  ON appointments;
CREATE POLICY "appointments_all"   ON appointments   FOR ALL TO anon USING (true) WITH CHECK (true);
