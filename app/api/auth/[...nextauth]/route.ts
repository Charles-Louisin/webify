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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 Nouvelle tentative de connexion pour:", {
          email: user.email,
          name: user.name,
          image: user.image
        });
        
        // Assurez-vous que l'utilisateur a un rôle par défaut
        user.role = "user";
        
        return true;
      } catch (error) {
        console.error("❌ Erreur lors de la connexion:", error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log("📝 Mise à jour de la session:", {
        sessionBefore: session,
        token
      });

      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string || "user";
      }

      console.log("✅ Session mise à jour:", session);
      return session;
    },
    async jwt({ token, user, account }) {
      console.log("🔑 Génération du JWT:", {
        tokenBefore: token,
        user,
        account
      });

      if (user) {
        token.role = user.role || "user";
      }

      console.log("✅ JWT généré:", token);
      return token;
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log("🔄 Redirection:", {
          url,
          baseUrl
        });
        
        // Toujours rediriger vers la page d'accueil après la connexion
        if (url.startsWith(baseUrl)) {
          return baseUrl;
        }
        return baseUrl;
      } catch (error) {
        console.error("❌ Erreur lors de la redirection:", error);
        return baseUrl;
      }
    },
  },
  events: {
    async signIn({ user }) {
      console.log("✨ Événement signIn:", user);
    },
    async signOut({ token }) {
      console.log("👋 Événement signOut:", token);
    },
    async session({ session, token }) {
      console.log("🔄 Événement session:", { session, token });
    }
  }
});

export { handler as GET, handler as POST }; 