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
    const identity = await ctx.auth.getUserIdentity();
    console.log("Identity received:", identity);
    
    if (!identity) {
      console.log("No identity found");
      throw new Error("Not authenticated");
    }

    const tokenIdentity = JSON.parse(identity.tokenIdentifier);
    console.log("Token identity:", tokenIdentity);

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), tokenIdentity.email))
      .first();

    console.log("User found:", user);

    if (!user) {
      console.log("No user found for email:", tokenIdentity.email);
      throw new Error("User not found");
    }

    const review = await ctx.db.insert("reviews", {
      userId: user._id,
      userName: user.name || tokenIdentity.name || "Anonyme",
      userImage: user.imageUrl || tokenIdentity.image || "",
      content: args.content,
      rating: args.rating,
      targetId: args.targetId,
      createdAt: new Date().toISOString(),
      isAppReview: args.targetType === "app",
    });

    console.log("Review created:", review);
    return review;
  },
});