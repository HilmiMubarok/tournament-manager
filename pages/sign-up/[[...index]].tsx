import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthLayout requireAuth={false}>
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Tournament Management
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Join thousands of tournament organizers who have simplified their 
                event management. Create your first tournament in minutes."
              </p>
              <footer className="text-sm">Alex Chen - Gaming Community Leader</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <Card className="border border-border/50 shadow-md">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                <CardDescription className="text-center text-base">
                  Get started with Tournament Management
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <SignUp
                  appearance={{
                    elements: {
                      formButtonPrimary:
                        "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors",
                      card: "bg-transparent shadow-none p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      dividerLine: "bg-border/60",
                      dividerText: "text-muted-foreground",
                      formFieldLabel: "font-medium text-foreground",
                      formFieldInput: "rounded-md border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                      footerAction: "text-muted-foreground hover:text-primary",
                      identityPreviewText: "text-foreground",
                      formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                      otpCodeFieldInput: "!rounded-md border-border/50",
                    },
                  }}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t pt-4">
                <div className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Button variant="link" className="px-2 font-medium" asChild>
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
