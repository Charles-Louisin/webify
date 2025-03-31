import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Créer un nouvel utilisateur
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Créer un nouvel utilisateur avec le rôle "user" par défaut
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "user",
      imageUrl: args.image,
      userId: args.email,
      stats: {
        projectsCreated: 0,
        projectsLiked: 0,
        postsCreated: 0,
        postsLiked: 0,
        commentsCreated: 0,
        commentsLiked: 0,
        likedBy: [],
      },
    });

    return userId;
  },
});

// Obtenir les informations d'un utilisateur
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Mettre à jour le profil d'un utilisateur
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    await ctx.db.patch(userId, updates);
    return userId;
  },
});

// Supprimer un compte utilisateur
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    await ctx.db.delete(args.userId);
    return true;
  },
});

// Mettre à jour le rôle d'un utilisateur (admin uniquement)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("colab"), v.literal("admin")),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur qui fait la demande est bien admin
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Permission refusée");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    await ctx.db.patch(args.userId, { role: args.newRole as "user" | "admin" | "collaborator" });
    return true;
  },
});

// Fonctions utilitaires pour la vérification des permissions
export const checkUserExists = async (ctx: any, userId: Id<"users">) => {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  return user;
};

export const checkIsColab = async (ctx: any, userId: Id<"users">) => {
  const user = await checkUserExists(ctx, userId);
  if (user.role !== "colab" && user.role !== "admin") {
    throw new Error("Permission refusée - Action réservée aux collaborateurs et administrateurs");
  }
  return user;
};

export const checkIsAdmin = async (ctx: any, userId: Id<"users">) => {
  const user = await checkUserExists(ctx, userId);
  if (user.role !== "admin") {
    throw new Error("Permission refusée - Action réservée aux administrateurs");
  }
  return user;
}; 