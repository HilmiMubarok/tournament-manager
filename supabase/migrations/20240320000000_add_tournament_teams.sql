-- Create tournament_teams table for managing team participation in tournaments
CREATE TABLE IF NOT EXISTS tournament_teams (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, team_id)
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_tournament_teams_updated_at
    BEFORE UPDATE ON tournament_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_tournament_teams ON tournament_teams(tournament_id, team_id);
