import { SignIn, SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInPage() {
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
                "This platform has revolutionized how we manage our gaming tournaments. 
                The ease of tracking scores and standings has made our events run smoother than ever."
              </p>
              <footer className="text-sm">Sofia Davis - Tournament Organizer</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <Tabs 
              defaultValue="signin" 
              className="w-full flex flex-col items-center" 
              onValueChange={(value) => {
                const title = document.querySelector('[data-welcome-title]');
                const desc = document.querySelector('[data-welcome-desc]');
                if (title && desc) {
                  if (value === 'signin') {
                    title.textContent = 'Welcome back';
                    desc.textContent = 'Sign in to your account to continue';
                  } else {
                    title.textContent = 'Create an account';
                    desc.textContent = 'Get started with Tournament Management';
                  }
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative py-3"
                >
                  Sign In
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform scale-x-0 transition-transform data-[state=active]:scale-x-100" 
                    data-state="active" 
                  />
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative py-3"
                >
                  Sign Up
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform scale-x-0 transition-transform data-[state=active]:scale-x-100" 
                    data-state="active" 
                  />
                </TabsTrigger>
              </TabsList>
              <div className="flex flex-col space-y-2 text-center mb-6 w-full">
                <h1 className="text-2xl font-bold" data-welcome-title>Welcome back</h1>
                <p className="text-muted-foreground" data-welcome-desc>Sign in to your account to continue</p>
              </div>
              <TabsContent value="signin" className="mt-4 w-full flex justify-center">
                <div className="w-full flex justify-center">
                  <SignIn
                    appearance={{
                      elements: {
                        formButtonPrimary:
                          "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        dividerLine: "bg-border/60",
                        dividerText: "text-muted-foreground",
                        formFieldLabel: "font-medium text-foreground",
                        formFieldInput: "rounded-md border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                        footerAction: "hidden",
                        identityPreviewText: "text-foreground",
                        formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                        otpCodeFieldInput: "!rounded-md border-border/50",
                        footer: "hidden",
                        card: "w-full shadow-none",
                        form: "w-full flex flex-col items-center gap-4",
                        formField: "w-full",
                        socialButtons: "w-full",
                        socialButtonsBlockButton: "w-full",
                        formFieldRow: "w-full",
                      },
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="signup" className="mt-4 w-full flex justify-center">
                <div className="w-full flex justify-center">
                  <SignUp
                    appearance={{
                      elements: {
                        formButtonPrimary:
                          "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        dividerLine: "bg-border/60",
                        dividerText: "text-muted-foreground",
                        formFieldLabel: "font-medium text-foreground",
                        formFieldInput: "rounded-md border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                        footerAction: "hidden",
                        identityPreviewText: "text-foreground",
                        formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                        otpCodeFieldInput: "!rounded-md border-border/50",
                        footer: "hidden",
                        card: "w-full shadow-none",
                        form: "w-full flex flex-col items-center gap-4",
                        formField: "w-full",
                        socialButtons: "w-full",
                        socialButtonsBlockButton: "w-full",
                        formFieldRow: "w-full",
                      },
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
