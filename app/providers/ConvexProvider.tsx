"use client";

import { ReactNode, useCallback } from "react";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { SessionProvider, useSession } from "next-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

function AuthWithConvex({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  const useAuth = useCallback(() => {
    const isAuthenticated = status === "authenticated" && !!session?.user?.email;

    return {
      isAuthenticated,
      isLoading: status === "loading",
      fetchAccessToken: async () => {
        if (status === "loading" || !session?.user?.email || status !== "authenticated") {
          return null;
        }

        try {
          const token = {
            sub: session.user.email,
            email: session.user.email,
            name: session.user.name || "",
            image: session.user.image || "",
            role: "user",
            iss: window.location.origin,
            aud: "next-auth"
          };

          return JSON.stringify(token);
        } catch (error) {
          return null;
        }
      }
    };
  }, [session?.user?.email, status]);

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <AuthWithConvex>{children}</AuthWithConvex>
    </SessionProvider>
  );
} 