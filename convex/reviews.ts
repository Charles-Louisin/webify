import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    console.log("Fetching all reviews...");
    const reviews = await ctx.db
      .query("reviews")
      .collect();
    
    console.log("Reviews fetched:", reviews);
    return reviews;
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    rating: v.number(),
    targetId: v.optional(v.string()),
    userId: v.string(),
    userName: v.string(),
    userImage: v.string(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.insert("reviews", {
      ...args,
      createdAt: new Date().toISOString(),
      isAppReview: false,
    });
    return review;
  },
});

export const add = mutation({
  args: {
    content: v.string(),
    rating: v.number(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Tentative d'ajout d'avis avec:", args);

    const identity = await ctx.auth.getUserIdentity();
    console.log("Identity reçue:", identity);

    if (!identity?.email) {
      console.log("Pas d'email trouvé dans l'identité");
      throw new Error("Non authentifié");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    console.log("Utilisateur trouvé:", user);

    if (!user) {
      console.log("Aucun utilisateur trouvé pour l'email:", identity.email);
      throw new Error("Utilisateur non trouvé");
    }

    const review = await ctx.db.insert("reviews", {
      userId: user._id,
      userName: user.name,
      userImage: user.imageUrl || "",
      content: args.content,
      rating: args.rating,
      targetId: args.targetId,
      createdAt: new Date().toISOString(),
      isAppReview: args.targetType === "app",
    });

    console.log("Avis créé avec succès:", review);
    return review;
  },
});