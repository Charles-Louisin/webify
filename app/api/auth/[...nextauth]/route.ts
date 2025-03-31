import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
      // La création de l'utilisateur sera gérée côté client après la connexion réussie
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