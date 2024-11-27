import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for type-safe database operations
export const db = {
  teams: {
    create: async (data: any) => 
      await supabase.from('teams').insert(data).single(),
    list: async () => 
      await supabase.from('teams').select('*'),
    getById: async (id: string) => 
      await supabase.from('teams').select('*').eq('id', id).single(),
  },
  players: {
    create: async (data: any) => 
      await supabase.from('players').insert(data).single(),
    list: async () => 
      await supabase.from('players').select('*'),
    getById: async (id: string) => 
      await supabase.from('players').select('*').eq('id', id).single(),
  },
  tournaments: {
    create: async (data: any) => 
      await supabase.from('tournaments').insert(data).single(),
    list: async () => 
      await supabase.from('tournaments').select('*'),
    getById: async (id: string) => 
      await supabase.from('tournaments').select('*').eq('id', id).single(),
  },
};
