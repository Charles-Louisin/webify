"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useUser = () => {
  const { data: session, status } = useSession();
  const userData = useQuery(api.users.getCurrentUser, 
    status === "authenticated" ? { userId: session?.user?.email as string } : "skip"
  );

  return {
    user: userData,
    isSignedIn: status === "authenticated",
    isLoading: status === "loading",
  };
}; 