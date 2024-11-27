-- Add status column to tournaments table
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'in_progress', 'completed'));
