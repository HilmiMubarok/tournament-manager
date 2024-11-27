export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TournamentPlayer {
  id: string;
  tournament_id: string;
  player_id: string;
  team_id: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  match_date: string;
  home_team: Team;
  away_team: Team;
  created_at: string;
  updated_at: string;
}
