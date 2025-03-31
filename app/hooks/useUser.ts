"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function useUser() {
  const { data: session } = useSession();
  const createUser = useMutation(api.auth.createUser);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const user = useQuery(
    api.users.getCurrentUser,
    isClient && session?.user?.email ? { userId: session.user.email } : "skip"
  );

  useEffect(() => {
    if (isClient && session?.user?.email && session.user.name && !user) {
      createUser({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || undefined,
      }).catch(error => {
        console.error("Error creating user in Convex:", error);
      });
    }
  }, [session, user, createUser, isClient]);

  return { user, session };
} 