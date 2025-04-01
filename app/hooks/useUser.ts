"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useUser() {
  const { data: session, status } = useSession();

  const user = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user?.email;

  return {
    user: user || null,
    session,
    status,
    isLoading,
    isAuthenticated
  };
} 