"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState, useCallback } from "react";

export function useUser() {
  const { data: session, status: authStatus } = useSession();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const createUser = useMutation(api.auth.createUser);
  const [isClient, setIsClient] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRefetchUser, setShouldRefetchUser] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userEmail = session?.user?.email;

  const user = useQuery(
    api.users.getCurrentUser,
    userEmail && isClient && !isConvexLoading ? { userId: userEmail } : "skip"
  );

  const createUserIfNeeded = useCallback(async () => {
    if (!session?.user?.email || !session?.user?.name) return;

    try {
      setIsCreatingUser(true);
      setError(null);
      
      await createUser({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || undefined,
      });
      
      setShouldRefetchUser(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsCreatingUser(false);
    }
  }, [session?.user, createUser]);

  useEffect(() => {
    let mounted = true;

    if (
      isClient && 
      authStatus === "authenticated" && 
      isConvexAuthenticated &&
      !isConvexLoading &&
      userEmail &&
      user === null &&
      !isCreatingUser &&
      !shouldRefetchUser
    ) {
      const timer = setTimeout(() => {
        if (mounted) {
          createUserIfNeeded();
        }
      }, 2000);
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
  }, [
    isClient,
    authStatus,
    isConvexAuthenticated,
    isConvexLoading,
    userEmail,
    user,
    isCreatingUser,
    shouldRefetchUser,
    createUserIfNeeded
  ]);

  useEffect(() => {
    if (user && shouldRefetchUser) {
      setShouldRefetchUser(false);
    }
  }, [user, shouldRefetchUser]);

  const isLoading = 
    !isClient || 
    authStatus === "loading" || 
    isConvexLoading ||
    isCreatingUser || 
    shouldRefetchUser;

  const isAuthenticated = 
    isClient && 
    authStatus === "authenticated" && 
    isConvexAuthenticated && 
    !!userEmail;

  return { 
    user, 
    session, 
    status: authStatus, 
    isLoading,
    error,
    isAuthenticated
  };
} 