-- ============================================================
-- Performance Indexes — PCU Admission Portal
-- Run once against the live Neon PostgreSQL database.
-- All indexes use IF NOT EXISTS so they are safe to re-run.
-- ============================================================


-- ── applications table ───────────────────────────────────────
-- Most queries filter / sort on these columns

-- dashboard statistics & list pages (most critical)
CREATE INDEX IF NOT EXISTS idx_applications_stage
    ON applications (applicant_stage);

-- recent-activity UNION query (decision filter branch)
CREATE INDEX IF NOT EXISTS idx_applications_decision_date
    ON applications (decision_date DESC NULLS LAST)
    WHERE decision IS NOT NULL;

-- letter-status-summary: admission_letter_sent filter
CREATE INDEX IF NOT EXISTS idx_applications_letter_sent
    ON applications (admission_letter_sent)
    WHERE admission_letter_sent = TRUE;

-- get_applications list page + pending-faculty queries
CREATE INDEX IF NOT EXISTS idx_applications_stage_prog
    ON applications (applicant_stage, prog_type);

-- applicant-facing queries keyed by user_id
CREATE INDEX IF NOT EXISTS idx_applications_user_id
    ON applications (user_id);

-- academic session join
CREATE INDEX IF NOT EXISTS idx_applications_session_id
    ON applications (academic_session_id);

-- updated_at sort (list pages, recent-activity, letter-status)
CREATE INDEX IF NOT EXISTS idx_applications_updated_at
    ON applications (updated_at DESC);

-- form_no unique lookups / display
CREATE INDEX IF NOT EXISTS idx_applications_form_no
    ON applications (form_no);


-- ── users table ─────────────────────────────────────────────
-- Join target for almost every query above
-- email is already indexed (UNIQUE constraint creates it)

-- Name concat columns are used in ORDER BY on list pages
CREATE INDEX IF NOT EXISTS idx_users_surname
    ON users (surname);

CREATE INDEX IF NOT EXISTS idx_users_user_type
    ON users (user_type_id);


-- ── payment_transactions table ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_user_id
    ON payment_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_payments_tran_type
    ON payment_transactions (tran_type);

CREATE INDEX IF NOT EXISTS idx_payments_session_id
    ON payment_transactions (academic_session_id);

CREATE INDEX IF NOT EXISTS idx_payments_receipt_no
    ON payment_transactions (receipt_no);


-- ── program_fees table ───────────────────────────────────────
-- Queried by prog_type (program_type column) in fee lookups
CREATE INDEX IF NOT EXISTS idx_program_fees_program_type
    ON program_fees (program_type);

CREATE INDEX IF NOT EXISTS idx_program_fees_component_session
    ON program_fees (fee_component_id, academic_session_id);


-- ── documents table ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_documents_application_id
    ON documents (application_id);


-- ── academic_sessions table ──────────────────────────────────
-- Queried with WHERE is_active = TRUE on every page load
CREATE INDEX IF NOT EXISTS idx_academic_sessions_active
    ON academic_sessions (is_active)
    WHERE is_active = TRUE;


-- ── biodata / next_of_kin / sponsor ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_biodata_application_id
    ON biodata (application_id);

CREATE INDEX IF NOT EXISTS idx_next_of_kin_application_id
    ON next_of_kin (application_id);

CREATE INDEX IF NOT EXISTS idx_sponsor_application_id
    ON sponsor (application_id);


-- ── academic_qualification table ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_academic_qual_user_id
    ON academic_qualification (user_id);


-- ── admission_letter_tracking table ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_alt_applicant_id
    ON admission_letter_tracking (applicant_id);
