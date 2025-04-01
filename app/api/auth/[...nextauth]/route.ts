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
  debug: true,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log("Tentative de connexion pour:", user.email);
        // Vérifiez si l'email est celui de l'administrateur
        if (user.email === "clynlouisin@gmail.com") {
          user.role = "admin";
        }
        return true;
      } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user.id = token.sub;
          // Assurez-vous que le rôle est correctement transmis
          session.user.role = token.role as string || "user";
          console.log("Session créée avec le rôle:", session.user.role);
        }
        return session;
      } catch (error) {
        console.error("Erreur lors de la création de la session:", error);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          // Conservez le rôle dans le token
          token.role = user.role || "user";
          console.log("JWT créé avec le rôle:", token.role);
        }
        return token;
      } catch (error) {
        console.error("Erreur lors de la création du JWT:", error);
        return token;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log("Redirection vers:", url);
        console.log("URL de base:", baseUrl);
        
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (url.startsWith(baseUrl)) return url;
        return baseUrl;
      } catch (error) {
        console.error("Erreur lors de la redirection:", error);
        return baseUrl;
      }
    },
  },
});

export { handler as GET, handler as POST }; 