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
    targetName: v.string(),
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
    targetName: v.string(),
    session: v.object({
      user: v.object({
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
      })
    })
  },
  handler: async (ctx, args) => {
    console.log("Tentative d'ajout d'avis avec:", args);

    if (!args.session?.user?.email) {
      console.log("Pas d'email trouvé dans la session");
      throw new Error("Non authentifié");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.session.user.email))
      .unique();

    console.log("Utilisateur trouvé:", user);

    if (!user) {
      console.log("Aucun utilisateur trouvé pour l'email:", args.session.user.email);
      throw new Error("Utilisateur non trouvé");
    }

    // Déterminer si c'est un avis sur l'application
    const isAppReview = args.targetType === "app";
    console.log("Type d'avis:", isAppReview ? "Application" : "Utilisateur");

    const review = await ctx.db.insert("reviews", {
      userId: user._id,
      userName: user.name,
      userImage: user.imageUrl || "",
      content: args.content,
      rating: args.rating,
      targetId: args.targetId,
      targetName: args.targetName,
      createdAt: new Date().toISOString(),
      isAppReview: isAppReview
    });

    console.log("Avis créé avec succès:", review);
    return review;
  },
});

export const fixMissingTargetName = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Début de la correction des avis sans targetName");
    
    const reviews = await ctx.db
      .query("reviews")
      .collect();
    
    console.log(`${reviews.length} avis trouvés`);
    
    for (const review of reviews) {
      if (!review.targetName) {
        console.log(`Correction de l'avis ${review._id}`);
        await ctx.db.patch(review._id, {
          targetName: review.isAppReview ? "Webify" : "Utilisateur"
        });
      }
    }
    
    console.log("Correction terminée");
    return { success: true };
  },
});