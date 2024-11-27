-- Add goal_difference column to standings table
ALTER TABLE standings ADD COLUMN IF NOT EXISTS goal_difference INT DEFAULT 0;

-- Function to update goal difference
CREATE OR REPLACE FUNCTION update_goal_difference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.goal_difference = NEW.goals_for - NEW.goals_against;
    RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to automatically update goal difference
DROP TRIGGER IF EXISTS calculate_goal_difference ON standings;
CREATE TRIGGER calculate_goal_difference
    BEFORE INSERT OR UPDATE OF goals_for, goals_against ON standings
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_difference();
