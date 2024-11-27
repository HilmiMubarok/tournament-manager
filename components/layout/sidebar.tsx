import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Trophy, Users, Users2, CalendarDays, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Tournaments",
    icon: Trophy,
    href: "/dashboard/tournaments",
  },
  {
    label: "Teams",
    icon: Users2,
    href: "/dashboard/teams",
  },
  {
    label: "Players",
    icon: Users,
    href: "/dashboard/players",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white border-r dark:bg-gray-900 dark:border-gray-800">
      <div className="flex h-16 items-center gap-2 border-b px-6 dark:border-gray-800">
        <h1 className="font-semibold text-xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Tournament
        </h1>
      </div>
      <div className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                pathname === route.href ? 
                "bg-gradient-to-r from-indigo-500/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400" : 
                "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              )}
            >
              <route.icon className={cn(
                "h-5 w-5",
                pathname === route.href ?
                "text-indigo-600 dark:text-indigo-400" :
                "text-gray-400"
              )} />
              <span className="font-medium">
                {route.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t p-4 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3">
          <UserButton afterSignOutUrl="/" />
          <div className="truncate">
            <p className="text-sm font-medium">Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
