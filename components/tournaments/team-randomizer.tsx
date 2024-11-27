import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { PlayerWithTeam, Team } from "@/types/types";
import { cn } from "@/lib/utils";

interface TeamRandomizerProps {
  players: PlayerWithTeam[];
  teams: Team[];
  onRandomizeComplete: (assignments: { player_id: string; team_id: string }[]) => void;
}

export function TeamRandomizer({ players, teams, onRandomizeComplete }: TeamRandomizerProps) {
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [currentAssignments, setCurrentAssignments] = useState<{ player_id: string; team_id: string }[]>([]);
  const [iterations, setIterations] = useState(0);
  const maxIterations = 20; // Number of visual shuffles before finalizing

  // Initialize currentAssignments with existing team assignments
  useEffect(() => {
    const initialAssignments = players.map(player => ({
      player_id: player.id,
      team_id: player.team_id || "",
    }));
    setCurrentAssignments(initialAssignments);
  }, [players]);

  useEffect(() => {
    if (!isRandomizing) return;

    const interval = setInterval(() => {
      if (iterations >= maxIterations) {
        setIsRandomizing(false);
        // Create final balanced assignments
        const finalAssignments = players.map((player, index) => ({
          player_id: player.id,
          team_id: teams[index % teams.length].id,
        }));
        setCurrentAssignments(finalAssignments);
        onRandomizeComplete(finalAssignments);
        return;
      }

      // Create a random assignment for visual effect
      const tempAssignments = players.map((player) => ({
        player_id: player.id,
        team_id: teams[Math.floor(Math.random() * teams.length)].id,
      }));

      setCurrentAssignments(tempAssignments);
      setIterations((prev) => prev + 1);
    }, 100); // Adjust speed of animation

    return () => clearInterval(interval);
  }, [isRandomizing, iterations, players, teams, onRandomizeComplete]);

  const startRandomizing = () => {
    setIsRandomizing(true);
    setIterations(0);
  };

  const getTeamName = (teamId: string) => {
    return teams.find((team) => team.id === teamId)?.name || "Unassigned";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Assignments</h3>
        <Button
          onClick={startRandomizing}
          disabled={isRandomizing}
          variant={isRandomizing ? "outline" : "default"}
        >
          {isRandomizing ? "Randomizing..." : "Randomize Teams"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => {
          const assignment = currentAssignments.find(
            (a) => a.player_id === player.id
          );
          const teamName = assignment?.team_id ? getTeamName(assignment.team_id) : "Unassigned";

          return (
            <Card
              key={player.id}
              className={cn(
                "transition-all duration-200",
                isRandomizing && "animate-pulse"
              )}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{player.name}</span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-sm",
                      isRandomizing
                        ? "bg-gray-100 dark:bg-gray-800"
                        : assignment?.team_id
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    {teamName}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
