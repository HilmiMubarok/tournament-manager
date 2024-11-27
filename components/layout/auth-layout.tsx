import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthLayout({ children, requireAuth = true }: AuthLayoutProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn && requireAuth) {
      router.push("/sign-in");
    }
    if (isLoaded && isSignedIn && !requireAuth) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, requireAuth, router]);

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show children only if authentication requirements are met
  if (
    (requireAuth && isSignedIn) ||
    (!requireAuth && !isSignedIn) ||
    !requireAuth
  ) {
    return <>{children}</>;
  }

  // Show loading for any other state
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    </div>
  );
}
