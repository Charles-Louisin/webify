import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ConvexClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
  interface User {
    role?: string;
  }
}

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email && user.name) {
        try {
          await convex.mutation(api.auth.createUser, {
            name: user.name,
            email: user.email,
            image: user.image || undefined,
          });
        } catch (error) {
          console.error("Error creating user in Convex:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string || "user";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string || "user";
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;
      if (url.startsWith(baseUrl)) return url;
      return "/";
    },
  },
});

export { handler as GET, handler as POST }; 