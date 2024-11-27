import { supabase } from "@/lib/supabase";

export interface Team {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export const teamService = {
  async getTeams() {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Team[];
  },

  async createTeam(name: string) {
    const { data, error } = await supabase
      .from("teams")
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data as Team;
  },

  async updateTeam(id: number, name: string) {
    const { data, error } = await supabase
      .from("teams")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Team;
  },

  async deleteTeam(id: number) {
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
