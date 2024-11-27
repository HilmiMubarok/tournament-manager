import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const TOURNAMENT_FORMATS = [
  { id: "league", name: "League" },
  { id: "knockout", name: "Knockout" },
  { id: "group", name: "Group Stage" },
];

export function CreateTournamentForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    format: "",
    teams: [] as { id: number; name: string }[],
    players: [] as { id: number; name: string }[],
  });
  const [availableTeams, setAvailableTeams] = useState<{ id: number; name: string }[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<{ id: number; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");

  useEffect(() => {
    loadTeams();
    loadPlayers();
  }, []);

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setAvailableTeams(data || []);
    } catch (error) {
      console.error("Error loading teams:", error);
      toast.error("Failed to load teams");
    }
  };

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setAvailablePlayers(data || []);
    } catch (error) {
      console.error("Error loading players:", error);
      toast.error("Failed to load players");
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.format) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      case 2:
        if (formData.teams.length < 2) {
          toast.error("Please add at least 2 teams");
          return false;
        }
        return true;
      case 3:
        if (formData.players.length < 2) {
          toast.error("Please add at least 2 players");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      // Create tournament
      const { data: tournament, error: tournamentError } = await supabase
        .from("tournaments")
        .insert([
          {
            name: formData.name,
            format: formData.format
          },
        ])
        .select()
        .single();

      if (tournamentError) throw tournamentError;

      // Add teams to tournament_teams
      const tournamentTeams = formData.teams.map((team) => ({
        tournament_id: tournament.id,
        team_id: team.id,
      }));

      const { error: teamsError } = await supabase
        .from("tournament_teams")
        .insert(tournamentTeams);

      if (teamsError) throw teamsError;

      // Add players to tournament_players
      const tournamentPlayers = formData.players.map((player) => ({
        tournament_id: tournament.id,
        player_id: player.id,
      }));

      const { error: playersError } = await supabase
        .from("tournament_players")
        .insert(tournamentPlayers);

      if (playersError) throw playersError;

      // Initialize standings for each team
      const standingsData = formData.teams.map((team) => ({
        tournament_id: tournament.id,
        team_id: team.id,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        points: 0
      }));

      const { error: standingsError } = await supabase
        .from("standings")
        .insert(standingsData);

      if (standingsError) throw standingsError;

      toast.success("Tournament created successfully");
      router.push(`/tournament/${tournament.id}`);
    } catch (error) {
      console.error("Error creating tournament:", error);
      toast.error("Failed to create tournament. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addTeam = (team: { id: number; name: string }) => {
    if (!formData.teams.find((t) => t.id === team.id)) {
      setFormData({
        ...formData,
        teams: [...formData.teams, team],
      });
    }
  };

  const removeTeam = (teamId: number) => {
    setFormData({
      ...formData,
      teams: formData.teams.filter((team) => team.id !== teamId),
    });
  };

  const addPlayer = (player: { id: number; name: string }) => {
    if (!formData.players.find((p) => p.id === player.id)) {
      setFormData({
        ...formData,
        players: [...formData.players, player],
      });
    }
  };

  const removePlayer = (playerId: number) => {
    setFormData({
      ...formData,
      players: formData.players.filter((player) => player.id !== playerId),
    });
  };

  const filteredTeams = availableTeams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !formData.teams.find((t) => t.id === team.id)
  );

  const filteredPlayers = availablePlayers.filter(
    (player) =>
      player.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) &&
      !formData.players.find((p) => p.id === player.id)
  );

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex items-center ${
              step < 4 ? "flex-1" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step <= currentStep
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  step < currentStep ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Tournament Setup */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tournament Setup</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter tournament name"
              />
            </div>
            <div>
              <Label htmlFor="format">Tournament Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) =>
                  setFormData({ ...formData, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {TOURNAMENT_FORMATS.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Team Management */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Team Management</h2>
          <div className="space-y-4">
            {/* Search Teams */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Selected Teams */}
            <div className="space-y-2">
              <Label>Selected Teams ({formData.teams.length})</Label>
              <ScrollArea className="h-24 w-full rounded-md border">
                <div className="p-4 space-y-2">
                  {formData.teams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No teams selected. Add teams from the list below.
                    </p>
                  ) : (
                    formData.teams.map((team) => (
                      <Badge
                        key={team.id}
                        variant="secondary"
                        className="mr-2 mb-2"
                      >
                        {team.name}
                        <button
                          onClick={() => removeTeam(team.id)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Available Teams */}
            <div className="space-y-2">
              <Label>Available Teams</Label>
              <ScrollArea className="h-48 w-full rounded-md border">
                <div className="p-4">
                  {filteredTeams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "No teams found matching your search."
                        : "No teams available."}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredTeams.map((team) => (
                        <Button
                          key={team.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => addTeam(team)}
                        >
                          {team.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Player Management */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Player Management</h2>
          <div className="space-y-4">
            {/* Search Players */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Selected Players */}
            <div className="space-y-2">
              <Label>Selected Players ({formData.players.length})</Label>
              <ScrollArea className="h-24 w-full rounded-md border">
                <div className="p-4 space-y-2">
                  {formData.players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No players selected. Add players from the list below.
                    </p>
                  ) : (
                    formData.players.map((player) => (
                      <Badge
                        key={player.id}
                        variant="secondary"
                        className="mr-2 mb-2"
                      >
                        {player.name}
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Available Players */}
            <div className="space-y-2">
              <Label>Available Players</Label>
              <ScrollArea className="h-48 w-full rounded-md border">
                <div className="p-4">
                  {filteredPlayers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {playerSearchQuery
                        ? "No players found matching your search."
                        : "No players available."}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredPlayers.map((player) => (
                        <Button
                          key={player.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => addPlayer(player)}
                        >
                          {player.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Schedule Generation */}
      {currentStep === 4 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Schedule Generation</h2>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Tournament Summary</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground inline">Format:</dt>
                  <dd className="inline ml-2">{formData.format}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground inline">Teams:</dt>
                  <dd className="inline ml-2">{formData.teams.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground inline">Players:</dt>
                  <dd className="inline ml-2">{formData.players.length}</dd>
                </div>
              </dl>
            </div>
            <p className="text-sm text-muted-foreground">
              Click Create Tournament to finalize the tournament setup. You can manage the schedule after creation.
            </p>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isLoading}
        >
          Back
        </Button>
        {currentStep < 4 ? (
          <Button onClick={handleNext} disabled={isLoading}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Tournament"}
          </Button>
        )}
      </div>
    </div>
  );
}
