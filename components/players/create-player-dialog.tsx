import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Player, playerService } from "@/services/player-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player?: Player | null;
  onSuccess: () => void;
}

export function CreatePlayerDialog({
  open,
  onOpenChange,
  player,
  onSuccess,
}: CreatePlayerDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: player?.name || "",
    },
  });

  // Reset form with player data when player changes
  useEffect(() => {
    if (player) {
      form.reset({
        name: player.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [player, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (player) {
        await playerService.updatePlayer(player.id, values.name);
        toast.success("Player updated successfully");
      } else {
        await playerService.createPlayer(values.name);
        toast.success("Player created successfully");
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving player:", error);
      toast.error(player ? "Failed to update player" : "Failed to create player");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {player ? "Edit Player" : "Create Player"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter player name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : player
                  ? "Save Changes"
                  : "Create Player"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
