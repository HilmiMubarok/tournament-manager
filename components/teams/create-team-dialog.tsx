import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Team, teamService } from "@/services/team-service";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
  onSuccess?: () => void;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  team,
  onSuccess,
}: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (team) {
      setName(team.name);
    } else {
      setName("");
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsLoading(true);
    try {
      if (team) {
        await teamService.updateTeam(team.id, name);
        toast.success("Team updated successfully");
      } else {
        await teamService.createTeam(name);
        toast.success("Team created successfully");
      }
      
      onSuccess?.();
      onOpenChange(false);
      setName("");
    } catch (error) {
      console.error("Error saving team:", error);
      toast.error(team ? "Failed to update team" : "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            {team ? "Edit Team" : "Create New Team"}
          </DialogTitle>
          <DialogDescription>
            {team
              ? "Edit your team's information."
              : "Add a new team to your tournament management system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-visible:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
            >
              {isLoading
                ? team
                  ? "Updating..."
                  : "Creating..."
                : team
                ? "Update Team"
                : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
