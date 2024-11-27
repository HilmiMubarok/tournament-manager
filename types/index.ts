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
  home_player_id: string;
  away_player_id: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}
