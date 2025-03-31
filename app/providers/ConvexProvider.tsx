"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider as BaseConvexProvider } from "convex/react";
import { SessionProvider, useSession } from "next-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <BaseConvexProvider client={convex}>
        {children}
      </BaseConvexProvider>
    </SessionProvider>
  );
} 