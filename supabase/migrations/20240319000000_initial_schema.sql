-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    format VARCHAR(50) NOT NULL CHECK (format IN ('league', 'knockout', 'group')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    home_team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    match_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Create standings table
CREATE TABLE IF NOT EXISTS standings (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    played INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, team_id)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standings_updated_at
    BEFORE UPDATE ON standings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_standings_tournament ON standings(tournament_id);
CREATE INDEX idx_standings_team ON standings(team_id);

-- Create function to update standings after match update
CREATE OR REPLACE FUNCTION update_standings_after_match()
RETURNS TRIGGER AS $$
BEGIN
    -- If match is completed
    IF NEW.status = 'completed' THEN
        -- Update home team standings
        INSERT INTO standings (tournament_id, team_id, played, wins, draws, losses, goals_for, goals_against, points)
        VALUES (
            NEW.tournament_id,
            NEW.home_team_id,
            1,
            CASE WHEN NEW.home_score > NEW.away_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.home_score < NEW.away_score THEN 1 ELSE 0 END,
            NEW.home_score,
            NEW.away_score,
            CASE 
                WHEN NEW.home_score > NEW.away_score THEN 3
                WHEN NEW.home_score = NEW.away_score THEN 1
                ELSE 0
            END
        )
        ON CONFLICT (tournament_id, team_id)
        DO UPDATE SET
            played = standings.played + 1,
            wins = standings.wins + CASE WHEN NEW.home_score > NEW.away_score THEN 1 ELSE 0 END,
            draws = standings.draws + CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
            losses = standings.losses + CASE WHEN NEW.home_score < NEW.away_score THEN 1 ELSE 0 END,
            goals_for = standings.goals_for + NEW.home_score,
            goals_against = standings.goals_against + NEW.away_score,
            points = standings.points + 
                CASE 
                    WHEN NEW.home_score > NEW.away_score THEN 3
                    WHEN NEW.home_score = NEW.away_score THEN 1
                    ELSE 0
                END;

        -- Update away team standings
        INSERT INTO standings (tournament_id, team_id, played, wins, draws, losses, goals_for, goals_against, points)
        VALUES (
            NEW.tournament_id,
            NEW.away_team_id,
            1,
            CASE WHEN NEW.away_score > NEW.home_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
            CASE WHEN NEW.away_score < NEW.home_score THEN 1 ELSE 0 END,
            NEW.away_score,
            NEW.home_score,
            CASE 
                WHEN NEW.away_score > NEW.home_score THEN 3
                WHEN NEW.away_score = NEW.home_score THEN 1
                ELSE 0
            END
        )
        ON CONFLICT (tournament_id, team_id)
        DO UPDATE SET
            played = standings.played + 1,
            wins = standings.wins + CASE WHEN NEW.away_score > NEW.home_score THEN 1 ELSE 0 END,
            draws = standings.draws + CASE WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
            losses = standings.losses + CASE WHEN NEW.away_score < NEW.home_score THEN 1 ELSE 0 END,
            goals_for = standings.goals_for + NEW.away_score,
            goals_against = standings.goals_against + NEW.home_score,
            points = standings.points + 
                CASE 
                    WHEN NEW.away_score > NEW.home_score THEN 3
                    WHEN NEW.away_score = NEW.home_score THEN 1
                    ELSE 0
                END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating standings after match update
CREATE TRIGGER update_standings_after_match
    AFTER UPDATE OF status ON matches
    FOR EACH ROW
    WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
    EXECUTE FUNCTION update_standings_after_match();
