-- Migration: Omorfia Agency Command Center - Schema Update
-- Description: Adds agency-level tracking columns for ROI and service modules.

-- 1. Organizations: Service Modules Tracking
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS service_modules JSONB DEFAULT '{"lead_intelligence": true, "auto_conversion": false, "advanced_spectral": true}'::jsonb;

COMMENT ON COLUMN organizations.service_modules IS 'Tracks unlocked agentic modules. Toggles UI elements in the Owner Dashboard and enforces feature-gating.';

-- 2. Leads: ROI & Confidence Scoring
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS confidence_score FLOAT DEFAULT 0.95,
ADD COLUMN IF NOT EXISTS treatment_recommendation TEXT;

COMMENT ON COLUMN leads.confidence_score IS 'AI-generated confidence multiplier (0-1) for projected revenue accuracy.';
COMMENT ON COLUMN leads.treatment_recommendation IS 'The high-ticket treatment recommended by the AI engine.';

-- Data Backfill
UPDATE organizations 
SET service_modules = '{"lead_intelligence": true, "auto_conversion": false, "advanced_spectral": true}'::jsonb 
WHERE service_modules IS NULL;

UPDATE leads
SET confidence_score = 0.95
WHERE confidence_score IS NULL;
