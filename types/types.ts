export interface Player {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'completed';
  match_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Standing {
  id: string;
  tournament_id: string;
  team_id: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  team?: Team;
}

export interface PlayerWithTeam extends Player {
  team?: Team;
  team_id?: string;
}
