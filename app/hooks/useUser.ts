"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useUser() {
  const { data: session } = useSession();
  const createUser = useMutation(api.auth.createUser);
  const user = useQuery(api.users.getUser, session?.user?.email ? { email: session.user.email } : "skip");

  useEffect(() => {
    if (session?.user?.email && session.user.name && !user) {
      createUser({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || undefined,
      }).catch(error => {
        console.error("Error creating user in Convex:", error);
      });
    }
  }, [session, user, createUser]);

  return { user, session };
} 