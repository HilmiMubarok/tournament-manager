export interface Team {
  id: number;
  name: string;
}

export interface Player {
  id: number;
  name: string;
}

export interface Tournament {
  id: number;
  name: string;
  format: string;
}

export interface Match {
  id: number;
  tournament_id: number;
  home_team_id: number;
  away_team_id: number;
  home_score: number;
  away_score: number;
  match_date: string;
}

export interface Standing {
  id: number;
  tournament_id: number;
  team_id: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}
