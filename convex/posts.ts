import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Créer un nouveau post
export const createPost = mutation({
  args: {
    authorId: v.id("users"),
    content: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'auteur existe et a les permissions nécessaires
    const author = await ctx.db.get(args.authorId);
    if (!author || (author.role !== "colab" && author.role !== "admin")) {
      throw new Error("Permission refusée - Seuls les collaborateurs et administrateurs peuvent créer des posts");
    }

    const postId = await ctx.db.insert("posts", {
      authorId: args.authorId,
      content: args.content,
      image: args.image,
      likes: [],
      comments: [],
      shares: 0,
      isPublished: true,
    });

    return postId;
  },
});

// Obtenir un post spécifique
export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

// Obtenir tous les posts
export const getAllPosts = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    let postsQuery = ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc");

    if (args.cursor) {
      postsQuery = postsQuery.filter((q) => q.lt(q.field("_id"), args.cursor));
    }

    if (args.limit) {
      postsQuery = postsQuery.take(args.limit);
    }

    return await postsQuery.collect();
  },
});

// Obtenir les posts d'un auteur spécifique
export const getAuthorPosts = query({
  args: { 
    authorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc");

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Mettre à jour un post
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.optional(v.string()),
    image: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Auteur non trouvé");
    }

    // Vérifier les permissions
    if (post.authorId !== args.authorId && author.role !== "admin") {
      throw new Error("Permission refusée");
    }

    const { postId, authorId, ...updates } = args;
    await ctx.db.patch(postId, updates);
    return postId;
  },
});

// Supprimer un post
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier les permissions
    if (post.authorId !== args.userId && user.role !== "admin") {
      throw new Error("Permission refusée");
    }

    await ctx.db.delete(args.postId);
    return true;
  },
});

// Liker un post
export const likePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const likes = post.likes || [];
    const userLikeIndex = likes.findIndex((id) => id === args.userId);

    if (userLikeIndex === -1) {
      // Ajouter le like
      await ctx.db.patch(args.postId, {
        likes: [...likes, args.userId],
      });

      // Mettre à jour les stats de l'auteur
      const author = await ctx.db.get(post.authorId);
      if (author && author.stats) {
        await ctx.db.patch(post.authorId, {
          stats: {
            ...author.stats,
            likes: (author.stats.likes || 0) + 1,
          },
        });
      }
    } else {
      // Retirer le like
      likes.splice(userLikeIndex, 1);
      await ctx.db.patch(args.postId, {
        likes: likes,
      });

      // Mettre à jour les stats de l'auteur
      const author = await ctx.db.get(post.authorId);
      if (author && author.stats) {
        await ctx.db.patch(post.authorId, {
          stats: {
            ...author.stats,
            likes: Math.max(0, (author.stats.likes || 0) - 1),
          },
        });
      }
    }

    return true;
  },
});

// Commenter un post
export const commentPost = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Auteur non trouvé");
    }

    // Créer le commentaire
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      likes: [],
    });

    // Mettre à jour le post avec le nouveau commentaire
    await ctx.db.patch(args.postId, {
      comments: [...(post.comments || []), commentId],
    });

    // Mettre à jour les stats de l'auteur du post
    const postAuthor = await ctx.db.get(post.authorId);
    if (postAuthor && postAuthor.stats) {
      await ctx.db.patch(post.authorId, {
        stats: {
          ...postAuthor.stats,
          comments: (postAuthor.stats.comments || 0) + 1,
        },
      });
    }

    return commentId;
  },
});

// Partager un post
export const sharePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Incrémenter le compteur de partages
    await ctx.db.patch(args.postId, {
      shares: (post.shares || 0) + 1,
    });

    // Mettre à jour les stats de l'auteur
    const author = await ctx.db.get(post.authorId);
    if (author && author.stats) {
      await ctx.db.patch(post.authorId, {
        stats: {
          ...author.stats,
          shares: (author.stats.shares || 0) + 1,
        },
      });
    }

    return true;
  },
}); 