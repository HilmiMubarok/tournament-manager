"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Player, playerService } from "@/services/player-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CreatePlayerDialog } from "@/components/players/create-player-dialog";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPlayers = async () => {
    try {
      const data = await playerService.getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error("Error loading players:", error);
      toast.error("Failed to load players");
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleDelete = async () => {
    if (!selectedPlayer) return;

    setIsLoading(true);
    try {
      await playerService.deletePlayer(selectedPlayer.id);
      await loadPlayers();
      toast.success("Player deleted successfully");
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error("Failed to delete player");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedPlayer(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Players
        </h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      <div className="rounded-md border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-indigo-500/10 to-purple-600/10">
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {players.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center py-4 text-gray-500 dark:text-gray-400"
                >
                  No players found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreatePlayerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        player={selectedPlayer}
        onSuccess={() => {
          loadPlayers();
          setSelectedPlayer(null);
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the player
              and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
