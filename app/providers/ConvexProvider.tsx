"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { SessionProvider, useSession } from "next-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function AuthWithConvex({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  console.log("Session dans AuthWithConvex:", session);

  const auth = {
    isAuthenticated: !!session?.user?.email,
    isLoading: false,
    fetchAccessToken: async () => {
      if (!session?.user?.email) {
        console.log("Pas de session utilisateur");
        return null;
      }

      console.log("Création du token pour:", session.user);

      // Format spécifique pour Convex
      const token = {
        sub: session.user.email,
        email: session.user.email,
        name: session.user.name || "",
        iss: "next-auth",
        aud: "next-auth",
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 heures
        iat: Math.floor(Date.now() / 1000),
      };

      console.log("Token généré:", token);
      return JSON.stringify(token);
    }
  };

  return (
    <ConvexProviderWithAuth client={convex} useAuth={() => auth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthWithConvex>{children}</AuthWithConvex>
    </SessionProvider>
  );
} 