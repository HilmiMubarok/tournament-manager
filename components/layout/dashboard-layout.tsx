import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { useSidebar } from "@/store/use-sidebar";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, toggle } = useSidebar();

  return (
    <>
      <div className="relative h-screen">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 z-50 flex w-72 flex-col transition-all duration-300",
            isOpen ? "left-0" : "-left-72"
          )}
        >
          <Sidebar />
        </div>

        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
            onClick={toggle}
          />
        )}

        {/* Main content */}
        <div
          className={cn(
            "h-full transition-all duration-300",
            isOpen ? "lg:pl-72" : "lg:pl-0"
          )}
        >
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6 dark:bg-gray-900 dark:border-gray-800">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="lg:hover:bg-transparent"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <main className="px-6 py-6">
            <div className="w-full transition-all duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
