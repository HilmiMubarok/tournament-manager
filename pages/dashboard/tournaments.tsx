"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Trophy } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Tournament {
  id: number;
  name: string;
  format: string;
  created_at: string;
}

export default function TournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error("Error loading tournaments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case "league":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "knockout":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "group":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Tournaments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your tournaments and create new ones
            </p>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30"
            onClick={() => router.push("/create-tournament")}
          >
            <PlusCircle className="h-4 w-4" />
            New Tournament
          </Button>
        </div>

        {/* Tournaments List */}
        <div className="grid gap-4">
          {isLoading ? (
            // Loading state
            <Card className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              </div>
            </Card>
          ) : tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/tournament/${tournament.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{tournament.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getFormatBadgeColor(
                            tournament.format
                          )}`}
                        >
                          {tournament.format.charAt(0).toUpperCase() +
                            tournament.format.slice(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Created {formatDate(tournament.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="sm:w-auto w-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tournament/${tournament.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            // Empty state
            <Card className="p-8">
              <div className="text-center">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No tournaments yet</h3>
                <p className="mt-1 text-muted-foreground">
                  Create your first tournament to get started
                </p>
                <Button
                  className="mt-4 gap-2"
                  onClick={() => router.push("/create-tournament")}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Tournament
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
