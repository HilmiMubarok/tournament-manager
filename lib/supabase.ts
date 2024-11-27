import { createClient } from '@supabase/supabase-js';
import { Team, Player, Tournament, Match, Standing } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for type-safe database operations
export const db = {
  teams: {
    create: async (data: Omit<Team, 'id'>) => 
      await supabase.from('teams').insert(data).select().single(),
    list: async () => 
      await supabase.from('teams').select('*'),
    getById: async (id: number) => 
      await supabase.from('teams').select('*').eq('id', id).single(),
    update: async (id: number, data: Partial<Omit<Team, 'id'>>) =>
      await supabase.from('teams').update(data).eq('id', id).select().single(),
    delete: async (id: number) =>
      await supabase.from('teams').delete().eq('id', id),
  },
  players: {
    create: async (data: Omit<Player, 'id'>) => 
      await supabase.from('players').insert(data).select().single(),
    list: async () => 
      await supabase.from('players').select('*'),
    getById: async (id: number) => 
      await supabase.from('players').select('*').eq('id', id).single(),
    update: async (id: number, data: Partial<Omit<Player, 'id'>>) =>
      await supabase.from('players').update(data).eq('id', id).select().single(),
    delete: async (id: number) =>
      await supabase.from('players').delete().eq('id', id),
  },
  tournaments: {
    create: async (data: Omit<Tournament, 'id'>) => 
      await supabase.from('tournaments').insert(data).select().single(),
    list: async () => 
      await supabase.from('tournaments').select('*'),
    getById: async (id: number) => 
      await supabase.from('tournaments').select('*').eq('id', id).single(),
    update: async (id: number, data: Partial<Omit<Tournament, 'id'>>) =>
      await supabase.from('tournaments').update(data).eq('id', id).select().single(),
    delete: async (id: number) =>
      await supabase.from('tournaments').delete().eq('id', id),
  },
  matches: {
    create: async (data: Omit<Match, 'id'>) => 
      await supabase.from('matches').insert(data).select().single(),
    list: async () => 
      await supabase.from('matches').select(`
        *,
        tournament:tournaments(*),
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
      `),
    getById: async (id: number) => 
      await supabase.from('matches').select(`
        *,
        tournament:tournaments(*),
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
      `).eq('id', id).single(),
    getByTournament: async (tournamentId: number) =>
      await supabase.from('matches').select(`
        *,
        tournament:tournaments(*),
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
      `).eq('tournament_id', tournamentId),
    update: async (id: number, data: Partial<Omit<Match, 'id'>>) =>
      await supabase.from('matches').update(data).eq('id', id).select().single(),
    delete: async (id: number) =>
      await supabase.from('matches').delete().eq('id', id),
  },
  standings: {
    create: async (data: Omit<Standing, 'id'>) => 
      await supabase.from('standings').insert(data).select().single(),
    list: async () => 
      await supabase.from('standings').select(`
        *,
        tournament:tournaments(*),
        team:teams(*)
      `),
    getById: async (id: number) => 
      await supabase.from('standings').select(`
        *,
        tournament:tournaments(*),
        team:teams(*)
      `).eq('id', id).single(),
    getByTournament: async (tournamentId: number) =>
      await supabase.from('standings').select(`
        *,
        tournament:tournaments(*),
        team:teams(*)
      `).eq('tournament_id', tournamentId)
      .order('points', { ascending: false }),
    update: async (id: number, data: Partial<Omit<Standing, 'id'>>) =>
      await supabase.from('standings').update(data).eq('id', id).select().single(),
    delete: async (id: number) =>
      await supabase.from('standings').delete().eq('id', id),
    updateTeamStats: async (tournamentId: number, teamId: number, data: Partial<Omit<Standing, 'id' | 'tournament_id' | 'team_id'>>) =>
      await supabase.from('standings')
        .update(data)
        .eq('tournament_id', tournamentId)
        .eq('team_id', teamId)
        .select()
        .single(),
  },
};
