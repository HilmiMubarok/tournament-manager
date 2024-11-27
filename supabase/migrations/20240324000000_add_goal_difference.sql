-- Add goal_difference column to standings table
ALTER TABLE standings ADD COLUMN IF NOT EXISTS goal_difference INT DEFAULT 0;

-- Create or replace trigger to automatically calculate goal_difference
CREATE OR REPLACE FUNCTION update_goal_difference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.goal_difference = NEW.goals_for - NEW.goals_against;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update goal_difference before insert or update
DROP TRIGGER IF EXISTS calculate_goal_difference ON standings;
CREATE TRIGGER calculate_goal_difference
    BEFORE INSERT OR UPDATE OF goals_for, goals_against ON standings
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_difference();
