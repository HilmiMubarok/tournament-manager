import { SignIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Tournament Management</h1>
        <SignIn />
      </div>
    </main>
  );
}
