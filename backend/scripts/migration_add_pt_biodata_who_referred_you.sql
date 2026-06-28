-- Add the Part-Time referral field to biodata.
-- The application only writes this field for program_type_id = 7.

ALTER TABLE biodata
ADD COLUMN IF NOT EXISTS who_referred_you TEXT;
