-- Fix UTME recommendations saved before recommendation status was separated
-- from final admission. These should be visible to applicants as recommendations,
-- but not have a finalised course until admission is finalised.
UPDATE applications
SET applicant_stage = 'recommended',
    finalised_course = NULL,
    updated_at = NOW()
WHERE decision = 'recommend'
  AND applicant_stage = 'screening'
  AND approved_course IS NOT NULL
  AND finalised_course IS NOT NULL;
