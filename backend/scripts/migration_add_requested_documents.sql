-- ============================================================================
-- Migration: Add requested_documents column to applications
-- Purpose: Track documents requested from PT/HND conversion applicants
-- ============================================================================

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS requested_documents TEXT;
