"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, ArrowRight, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalTeams: number;
  totalMatches: number;
  totalTournaments: number;
  totalPlayers: number;
  recentTournaments: Array<{
    id: number;
    name: string;
    created_at: string;
    total_teams: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalTeams: 0,
    totalMatches: 0,
    totalTournaments: 0,
    totalPlayers: 0,
    recentTournaments: [],
  });

  const loadStats = async () => {
    try {
      // Get total teams
      const { count: teamsCount } = await supabase
        .from("teams")
        .select("*", { count: "exact", head: true });

      // Get total matches
      const { count: matchesCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true });

      // Get total tournaments
      const { count: tournamentsCount } = await supabase
        .from("tournaments")
        .select("*", { count: "exact", head: true });

      // Get total players
      const { count: playersCount } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true });

      // Get recent tournaments
      const { data: recentTournaments } = await supabase
        .from("tournaments")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      const formattedTournaments = recentTournaments?.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        created_at: tournament.created_at,
        total_teams: 0 // We'll update this when we implement tournament teams
      })) || [];

      setStats({
        totalTeams: teamsCount || 0,
        totalMatches: matchesCount || 0,
        totalTournaments: tournamentsCount || 0,
        totalPlayers: playersCount || 0,
        recentTournaments: formattedTournaments,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30"
          onClick={() => router.push("/dashboard/create-tournament")}
        >
          <PlusCircle className="h-4 w-4" />
          New Tournament
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-900 dark:to-indigo-900/20 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-200 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalTournaments}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-900/20 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-200 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalTeams}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-pink-50/50 dark:from-gray-900 dark:to-pink-900/20 shadow-xl shadow-pink-500/5 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-200 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Calendar className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.totalMatches}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-violet-50/50 dark:from-gray-900 dark:to-violet-900/20 shadow-xl shadow-violet-500/5 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-200 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.totalPlayers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tournaments */}
      <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/20 shadow-xl shadow-gray-500/5 border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Recent Tournaments</CardTitle>
              <CardDescription>You have {stats.totalTournaments} tournaments.</CardDescription>
            </div>
            <Button variant="ghost" className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTournaments.map((tournament) => (
              <div key={tournament.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-900/20 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{tournament.name}</h3>
                    <p className="text-sm text-muted-foreground">Created {new Date(tournament.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="sm:w-auto w-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  onClick={() => router.push(`/dashboard/tournament/${tournament.id}`)}
                >
                  View Details
                </Button>
              </div>
            ))}
            {stats.recentTournaments.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No tournaments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
