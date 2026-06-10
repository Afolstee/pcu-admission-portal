-- ============================================================================
-- Migration: Add UTME Course Recommendation Support
-- Purpose: Mirror PG course recommendation workflow on applications.
-- ============================================================================

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS applicant_recommended_course TEXT;

CREATE INDEX IF NOT EXISTS idx_applications_applicant_recommended_course
ON applications(applicant_recommended_course)
WHERE applicant_recommended_course IS NOT NULL;

-- ============================================================================
-- Migration Complete
-- ============================================================================
