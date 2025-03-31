import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    image: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Non autorisé");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "collaborator")) {
      throw new Error("Non autorisé");
    }

    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      image: args.image,
      tags: args.tags,
      authorId: user._id,
      comments: [],
      likes: [],
      shares: 0,
      saves: [],
      isPublished: true,
      createdAt: new Date().toISOString(),
    });

    return postId;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
}); 