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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
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

          if (!existingUser) {
            // Vérifier si l'utilisateur a été supprimé
            const deletedUser = await convex.query(api.users.getDeletedUserByEmail, {
              email: user.email
            });

            if (deletedUser) {
              console.log("❌ Utilisateur précédemment supprimé, redirection vers l'inscription");
              return false; // Cela redirigera vers /auth/signin avec une erreur
            }

            // Créer l'utilisateur s'il n'a jamais existé
            const newUser = await convex.mutation(api.auth.createUser, {
              name: user.name || "",
              email: user.email,
              image: user.image || undefined,
              password: "", // Champ requis par le schéma
              role: "user",
              userId: user.email,
              stats: {
                projectsCreated: 0,
                projectsLiked: 0,
                postsCreated: 0,
                postsLiked: 0,
                commentsCreated: 0,
                commentsLiked: 0,
                likedBy: [],
                online: false,
              },
            });
            console.log("✅ Nouvel utilisateur créé:", newUser);
          }
        } catch (error) {
          console.error("❌ Erreur lors de la création/vérification de l'utilisateur:", error);
          return false; // Rediriger vers la page de connexion en cas d'erreur
        }
      }
      return true; // Autoriser la connexion dans les autres cas
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