import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getCollaborators = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("role"), "user"));

    if (args.userId) {
      return await query.filter((q) => q.eq(q.field("_id"), args.userId)).collect();
    }
    
    return await query.collect();
  },
});

export const likeProfile = mutation({
  args: { 
    collaboratorId: v.id("users"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const collaborator = await ctx.db.get(args.collaboratorId);

    if (!collaborator) {
      throw new Error("Collaborateur non trouvé");
    }

    // Initialiser le tableau des likes s'il n'existe pas
    const stats = collaborator.stats || {};
    const likes = stats.likedBy || [];
    const hasLiked = likes.includes(args.userId);

    // Mettre à jour les stats de l'utilisateur
    await ctx.db.patch(args.collaboratorId, {
      stats: {
        projectsCreated: stats.projectsCreated || 0.0,
        projectsLiked: stats.projectsLiked || 0.0,
        postsCreated: stats.postsCreated || 0.0,
        postsLiked: stats.postsLiked || 0.0,
        commentsCreated: stats.commentsCreated || 0.0,
        commentsLiked: stats.commentsLiked || 0.0,
        likedBy: hasLiked 
          ? likes.filter((id: string) => id !== args.userId.toString())
          : [...likes, args.userId.toString()]
      },
    });

    return { 
      hasLiked: !hasLiked
    };
  },
});

export const getCurrentUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log("🔍 getCurrentUser appelé avec userId:", args.userId);
    
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.userId))
        .unique();
      
      if (!user) {
        console.log("❓ Aucun utilisateur trouvé pour l'email:", args.userId);
        return null;
      }

      console.log("✅ Utilisateur trouvé:", user);
      return user;
    } catch (error) {
      console.error("❌ Erreur dans getCurrentUser:", error);
      return null;
    }
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    github: v.optional(v.string()),
    linkedin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return true;
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
    return true;
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateOnlineStatus = mutation({
  args: {
    userId: v.id("users"),
    online: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    await ctx.db.patch(args.userId, {
      stats: {
        ...user.stats,
        online: args.online,
      },
    });

    return true;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log("🔍 getUserByEmail appelé avec email:", args.email);
    
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();

      if (!user) {
        console.log("❌ Aucun utilisateur trouvé pour l'email:", args.email);
        return null;
      }

      console.log("✅ Utilisateur trouvé:", user);
      return user;
    } catch (error) {
      console.error("❌ Erreur dans getUserByEmail:", error);
      return null;
    }
  },
});

export const getDeletedUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user === null;
  },
}); 