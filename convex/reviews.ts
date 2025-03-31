import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("reviews")
      .order("desc")
      .take(10);
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