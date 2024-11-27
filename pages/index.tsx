import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/auth-layout";
import Link from "next/link";

export default function Home() {
  return (
    <AuthLayout requireAuth={false}>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Tournament Management
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Manage your gaming tournaments with ease. Track scores, standings, and more.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
