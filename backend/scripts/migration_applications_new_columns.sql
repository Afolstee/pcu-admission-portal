-- ============================================================
-- MIGRATION: Add new columns to applications table
-- Run this once against your PostgreSQL database.
-- ============================================================

-- 1. Widen form_no to accommodate new structured format
--    e.g.  PCU/2025/UTME01EA  (17 chars max, but adding headroom)
ALTER TABLE applications
    ALTER COLUMN form_no TYPE VARCHAR(30);

-- 2. Store the payment reference that funded this application
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS application_payment_reference VARCHAR(100);

-- 3. Store the user_id of the staff member who made the admission decision
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS decision_maker_user_id UUID
        REFERENCES users(id) ON DELETE SET NULL;

-- Indexes for quick look-ups
CREATE INDEX IF NOT EXISTS idx_applications_payment_ref
    ON applications(application_payment_reference);

CREATE INDEX IF NOT EXISTS idx_applications_decision_maker
    ON applications(decision_maker_user_id);
