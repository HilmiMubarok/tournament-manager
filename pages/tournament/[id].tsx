import type { NextPage } from 'next';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TeamRandomizer } from "@/components/tournaments/team-randomizer";
import { Trophy, Users2, Calendar, Table } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Tournament {
  id: number;
  name: string;
  format: string;
  created_at: string;
  status: 'draft' | 'in_progress' | 'completed';
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Player {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface TournamentTeam {
  id: string;
  tournament_id: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  team: Team;
}

interface TournamentPlayer {
  id: string;
  tournament_id: string;
  player_id: string;
  team_id: string | null;
  created_at: string;
  updated_at: string;
  player: Player;
  team?: Team;
}

interface PlayerWithTeam extends Player {
  team?: Team;
  team_id?: string;
}

interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team: Team;
  away_team: Team;
  home_score: number;
  away_score: number;
  match_date: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

interface Standing {
  id: string;
  tournament_id: string;
  team_id: string;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

const TournamentDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isUpdateScoreOpen, setIsUpdateScoreOpen] = useState(false);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [teamAssignments, setTeamAssignments] = useState<{ player_id: string; team_id: string }[]>([]);
  const [isTeamsAssigned, setIsTeamsAssigned] = useState(false);

  useEffect(() => {
    if (id) {
      loadTournamentData();
    }
  }, [id]);

  const loadTournamentData = async () => {
    try {
      // Load tournament details
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Load teams
      type DbTeamResponse = {
        teams: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
      };

      const { data: tournamentTeams, error: teamsError } = await supabase
        .from("tournament_teams")
        .select(`
          teams!inner (
            id,
            name,
            created_at,
            updated_at
          )
        `)
        .eq("tournament_id", id)
        .throwOnError();

      if (teamsError) throw teamsError;
      
      // Transform the data to match Team interface
      const transformedTeams: Team[] = ((tournamentTeams || []) as unknown as DbTeamResponse[]).map(tt => ({
        id: tt.teams.id,
        name: tt.teams.name,
        created_at: tt.teams.created_at,
        updated_at: tt.teams.updated_at
      }));
      setTeams(transformedTeams);

      // Load players with their team assignments
      type DbPlayerResponse = {
        players: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        teams: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        } | null;
      };

      const { data: tournamentPlayers, error: playersError } = await supabase
        .from("tournament_players")
        .select(`
          players!inner (
            id,
            name,
            created_at,
            updated_at
          ),
          teams (
            id,
            name,
            created_at,
            updated_at
          )
        `)
        .eq("tournament_id", id)
        .throwOnError();

      if (playersError) throw playersError;

      // Transform the data to match PlayerWithTeam interface
      const transformedPlayers: PlayerWithTeam[] = ((tournamentPlayers || []) as unknown as DbPlayerResponse[]).map(tp => ({
        id: tp.players.id,
        name: tp.players.name,
        created_at: tp.players.created_at,
        updated_at: tp.players.updated_at,
        team: tp.teams || undefined,
        team_id: tp.teams?.id
      }));
      setPlayers(transformedPlayers);

      // Load matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq("tournament_id", id)
        .order("match_date", { ascending: true });

      if (matchesError) throw matchesError;
      setMatches(matchesData);

      // Load standings
      const { data: standingsData, error: standingsError } = await supabase
        .from("standings")
        .select(`
          *,
          team:teams(*)
        `)
        .eq("tournament_id", id)
        .order("points", { ascending: false });

      if (standingsError) throw standingsError;
      setStandings(standingsData);

    } catch (error) {
      console.error("Error loading tournament data:", error);
      toast.error("Failed to load tournament data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Match["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const handleRandomizeComplete = async (assignments: { player_id: string; team_id: string }[]) => {
    try {
      setIsLoading(true);

      // Update tournament_players with team assignments
      for (const assignment of assignments) {
        const { error: assignmentError } = await supabase
          .from('tournament_players')
          .update({ team_id: assignment.team_id })
          .match({ 
            tournament_id: Number(id),
            player_id: assignment.player_id 
          });

        if (assignmentError) throw assignmentError;
      }

      // Reload tournament data to get updated assignments
      await loadTournamentData();
      
      setTeamAssignments(assignments);
      setIsTeamsAssigned(true);

      toast.success("Teams have been randomly assigned!");
    } catch (error) {
      console.error('Error assigning teams:', error);
      toast.error("Failed to assign teams. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startTournament = async () => {
    if (!tournament || !id || !isTeamsAssigned) return;

    try {
      setIsLoading(true);

      // 1. Generate matches for league format based on players
      const matches = [];
      const n = players.length;
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) continue; // Skip same player

          const player1 = players[i];
          const player2 = players[j];
          const team1 = teamAssignments.find(a => a.player_id === player1.id)?.team_id;
          const team2 = teamAssignments.find(a => a.player_id === player2.id)?.team_id;

          if (!team1 || !team2) continue;

          matches.push({
            tournament_id: Number(id),
            home_team_id: team1,
            away_team_id: team2,
            status: 'scheduled',
            match_date: new Date(Date.now() + matches.length * 24 * 60 * 60 * 1000).toISOString(),
            home_score: 0,
            away_score: 0
          });
        }
      }

      // 2. Create matches
      const { error: matchError } = await supabase
        .from('matches')
        .insert(matches);

      if (matchError) throw matchError;

      // 3. Initialize standings for all teams
      const standingsData = teams.map(team => ({
        tournament_id: Number(id),
        team_id: team.id,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0
      }));

      // Insert new standings (clear old ones first)
      const { error: deleteError } = await supabase
        .from('standings')
        .delete()
        .eq('tournament_id', id);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('standings')
        .insert(standingsData);

      if (insertError) throw insertError;

      // 4. Update tournament status
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({ status: 'in_progress' })
        .eq('id', id);

      if (tournamentError) throw tournamentError;

      toast.success("Tournament started successfully!");
      await loadTournamentData(); // Load fresh data instead of refreshing page
    } catch (error) {
      console.error('Error starting tournament:', error);
      toast.error("Failed to start tournament. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateMatchScore = async (matchId: string, homeScore: number, awayScore: number) => {
    try {
      // Update match score and status - the trigger will handle standings update
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: 'completed'
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

      toast.success("Match score updated successfully!");
      await loadTournamentData();
      setIsUpdateScoreOpen(false); // Close dialog after successful update
      setSelectedMatch(null); // Reset selected match
      setHomeScore(0); // Reset scores
      setAwayScore(0);
    } catch (error) {
      console.error('Error updating match score:', error);
      toast.error("Failed to update match score");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!tournament) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            Tournament not found
          </h2>
          <p className="mt-2 text-muted-foreground">
            The tournament you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/tournaments")}
          >
            Back to Tournaments
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            {tournament.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-sm px-2 py-1 rounded-full font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
            >
              {tournament.format.charAt(0).toUpperCase() + tournament.format.slice(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              Created {new Date(tournament.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Trophy className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Users2 className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2">
              <Users2 className="h-4 w-4" />
              Players
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2">
              <Calendar className="h-4 w-4" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-2">
              <Table className="h-4 w-4" />
              Standings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                  <h3 className="font-medium text-muted-foreground">Players</h3>
                  <p className="text-2xl font-bold mt-2">{players.length}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-medium text-muted-foreground">Teams</h3>
                  <p className="text-2xl font-bold mt-2">{teams.length}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-medium text-muted-foreground">Matches</h3>
                  <p className="text-2xl font-bold mt-2">{matches.length}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-medium text-muted-foreground">Status</h3>
                  <p className="text-2xl font-bold mt-2 capitalize">{tournament?.status}</p>
                </Card>
              </div>

              {tournament?.status === 'draft' && (
                <Card className="p-6">
                  <TeamRandomizer 
                    players={players} 
                    teams={teams} 
                    onRandomizeComplete={handleRandomizeComplete} 
                  />
                  
                  {isTeamsAssigned && (
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={startTournament}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                      >
                        Start Tournament
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {tournament?.status === 'in_progress' && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Team Assignments</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-800">
                            <th className="text-left p-2">Player</th>
                            <th className="text-left p-2">Team</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((player) => (
                            <tr key={player.id} className="border-b dark:border-gray-800">
                              <td className="p-2">{player.name}</td>
                              <td className="p-2">{player.team?.name || 'Unassigned'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              )}

              {matches.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Match Schedule</h3>
                    <div className="space-y-4">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-right font-medium">{match.home_team.name}</div>
                            <div className="text-center">
                              {match.status === "completed" ? (
                                <div className="font-bold">
                                  {match.home_score} - {match.away_score}
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setHomeScore(match.home_score || 0);
                                    setAwayScore(match.away_score || 0);
                                    setIsUpdateScoreOpen(true);
                                  }}
                                  className="px-2 py-1"
                                >
                                  Update Score
                                </Button>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${getStatusColor(
                                  match.status
                                )}`}
                              >
                                {match.status.replace("_", " ").charAt(0).toUpperCase() +
                                  match.status.slice(1).replace("_", " ")}
                              </span>
                            </div>
                            <div className="text-left font-medium">{match.away_team.name}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(match.match_date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <Card>
              <div className="divide-y dark:divide-gray-800">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{team.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <Card>
              <div className="divide-y dark:divide-gray-800">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{player.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <Card>
              <div className="divide-y dark:divide-gray-800">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-right">{match.home_team.name}</div>
                          <div className="text-center">
                            <div className="font-bold">
                              {match.status === "completed"
                                ? `${match.home_score} - ${match.away_score}`
                                : "vs"}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${getStatusColor(
                                match.status
                              )}`}
                            >
                              {match.status.replace("_", " ").charAt(0).toUpperCase() +
                                match.status.slice(1).replace("_", " ")}
                            </span>
                          </div>
                          <div className="text-left">{match.away_team.name}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground text-center sm:text-right">
                        {new Date(match.match_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Standings Tab */}
          <TabsContent value="standings">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-800">
                      <th className="text-left p-4">Team</th>
                      <th className="text-center p-4">P</th>
                      <th className="text-center p-4">W</th>
                      <th className="text-center p-4">D</th>
                      <th className="text-center p-4">L</th>
                      <th className="text-center p-4">GF</th>
                      <th className="text-center p-4">GA</th>
                      <th className="text-center p-4">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((standing) => (
                      <tr
                        key={standing.team.id}
                        className="border-b dark:border-gray-800"
                      >
                        <td className="p-4">{standing.team.name}</td>
                        <td className="text-center p-4">{standing.played}</td>
                        <td className="text-center p-4">{standing.wins}</td>
                        <td className="text-center p-4">{standing.draws}</td>
                        <td className="text-center p-4">{standing.losses}</td>
                        <td className="text-center p-4">{standing.goals_for}</td>
                        <td className="text-center p-4">{standing.goals_against}</td>
                        <td className="text-center p-4 font-bold">{standing.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Score Dialog */}
      <Dialog open={isUpdateScoreOpen} onOpenChange={setIsUpdateScoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Match Score</DialogTitle>
            <DialogDescription>
              Enter the final score for this match.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-right font-medium">
                  {selectedMatch.home_team.name}
                </div>
                <Input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(Number(e.target.value))}
                  className="text-center"
                />
                <div />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-right font-medium">
                  {selectedMatch.away_team.name}
                </div>
                <Input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(Number(e.target.value))}
                  className="text-center"
                />
                <div />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateScoreOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedMatch) {
                  updateMatchScore(selectedMatch.id, homeScore, awayScore);
                }
              }}
            >
              Save Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default TournamentDetailPage;
