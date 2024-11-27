import { supabase } from "@/lib/supabase";

export interface Player {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export const playerService = {
  async getPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Player[];
  },

  async createPlayer(name: string) {
    const { data, error } = await supabase
      .from("players")
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data as Player;
  },

  async updatePlayer(id: number, name: string) {
    const { data, error } = await supabase
      .from("players")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Player;
  },

  async deletePlayer(id: number) {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
