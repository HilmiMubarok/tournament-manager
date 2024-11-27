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
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { Team, teamService } from "@/services/team-service";
import { format } from "date-fns";
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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTeams = async () => {
    try {
      const data = await teamService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error("Error loading teams:", error);
      toast.error("Failed to load teams");
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleDelete = async () => {
    if (!selectedTeam) return;

    setIsLoading(true);
    try {
      await teamService.deleteTeam(selectedTeam.id);
      await loadTeams();
      toast.success("Team deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedTeam(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Teams</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Team
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
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                    onClick={() => {
                      setSelectedTeam(team);
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
                      setSelectedTeam(team);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No teams found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        team={selectedTeam}
        onSuccess={() => {
          loadTeams();
          setSelectedTeam(null);
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team
              and remove it from our servers.
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
