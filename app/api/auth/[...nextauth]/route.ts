import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        try {
          // Vérifier si l'utilisateur existe
          const user = await convex.query(api.users.getUserByEmail, {
            email: credentials.email
          });

          if (!user) {
            throw new Error("Utilisateur non trouvé");
          }

          // Vérifier le mot de passe
          if (user.password !== credentials.password) {
            throw new Error("Mot de passe incorrect");
          }

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.imageUrl,
            role: user.role
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          throw error;
        }
      }
    })
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.sub = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      console.log("✨ Événement signIn:", user);
      
      if (user.email) {
        try {
          // Vérifier si l'utilisateur existe
          const existingUser = await convex.query(api.users.getUserByEmail, {
            email: user.email
          });

          console.log("Utilisateur existant:", existingUser);

          if (existingUser) {
            // Mettre à jour le rôle de l'utilisateur dans la session
            user.role = existingUser.role;
          } else {
            // Créer un nouvel utilisateur
            await convex.mutation(api.auth.createUser, {
              name: user.name || "",
              email: user.email,
              image: user.image,
            });
          }
        } catch (error) {
          console.error("❌ Erreur lors de la gestion de l'utilisateur:", error);
        }
      }
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