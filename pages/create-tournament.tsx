"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateTournamentForm } from "@/components/tournaments/create-tournament-form";

export default function CreateTournamentPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Create Tournament
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new tournament by following these steps
          </p>
        </div>

        <CreateTournamentForm />
      </div>
    </DashboardLayout>
  );
}
