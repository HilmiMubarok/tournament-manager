import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
      {...pageProps}
    >
      <QueryClientProvider client={queryClient}>
        <main className={`${inter.variable} font-sans`}>
          <Component {...pageProps} />
        </main>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
