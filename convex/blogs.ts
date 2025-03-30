import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Créer un nouvel article de blog
export const createBlog = mutation({
  args: {
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    image: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'auteur existe et a les permissions nécessaires
    const author = await ctx.db.get(args.authorId);
    if (!author || (author.role !== "colab" && author.role !== "admin")) {
      throw new Error("Permission refusée - Seuls les collaborateurs et administrateurs peuvent créer des articles");
    }

    const blogId = await ctx.db.insert("blogs", {
      ...args,
      likes: [],
      comments: [],
      saves: [],
      shares: 0,
      isPublished: true,
    });

    return blogId;
  },
});

// Obtenir un article spécifique
export const getBlog = query({
  args: { blogId: v.id("blogs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.blogId);
  },
});

// Obtenir tous les articles
export const getAllBlogs = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("blogs")),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let blogsQuery = ctx.db
      .query("blogs")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc");

    if (args.tag) {
      blogsQuery = blogsQuery.filter((q) => q.contains(q.field("tags"), args.tag));
    }

    if (args.cursor) {
      blogsQuery = blogsQuery.filter((q) => q.lt(q.field("_id"), args.cursor));
    }

    if (args.limit) {
      blogsQuery = blogsQuery.take(args.limit);
    }

    return await blogsQuery.collect();
  },
});

// Obtenir les articles d'un auteur spécifique
export const getAuthorBlogs = query({
  args: { 
    authorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("blogs")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc");

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Mettre à jour un article
export const updateBlog = mutation({
  args: {
    blogId: v.id("blogs"),
    authorId: v.id("users"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    image: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (!blog) {
      throw new Error("Article non trouvé");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Auteur non trouvé");
    }

    // Vérifier les permissions
    if (blog.authorId !== args.authorId && author.role !== "admin") {
      throw new Error("Permission refusée");
    }

    const { blogId, authorId, ...updates } = args;
    await ctx.db.patch(blogId, updates);
    return blogId;
  },
});

// Supprimer un article
export const deleteBlog = mutation({
  args: {
    blogId: v.id("blogs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (!blog) {
      throw new Error("Article non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier les permissions
    if (blog.authorId !== args.userId && user.role !== "admin") {
      throw new Error("Permission refusée");
    }

    await ctx.db.delete(args.blogId);
    return true;
  },
});

// Liker un article
export const likeBlog = mutation({
  args: {
    blogId: v.id("blogs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (!blog) {
      throw new Error("Article non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const likes = blog.likes || [];
    const userLikeIndex = likes.findIndex((id) => id === args.userId);

    if (userLikeIndex === -1) {
      // Ajouter le like
      await ctx.db.patch(args.blogId, {
        likes: [...likes, args.userId],
      });

      // Mettre à jour les stats de l'auteur
      const author = await ctx.db.get(blog.authorId);
      if (author && author.stats) {
        await ctx.db.patch(blog.authorId, {
          stats: {
            ...author.stats,
            likes: (author.stats.likes || 0) + 1,
          },
        });
      }
    } else {
      // Retirer le like
      likes.splice(userLikeIndex, 1);
      await ctx.db.patch(args.blogId, {
        likes: likes,
      });

      // Mettre à jour les stats de l'auteur
      const author = await ctx.db.get(blog.authorId);
      if (author && author.stats) {
        await ctx.db.patch(blog.authorId, {
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

// Commenter un article
export const commentBlog = mutation({
  args: {
    blogId: v.id("blogs"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (!blog) {
      throw new Error("Article non trouvé");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Auteur non trouvé");
    }

    // Créer le commentaire
    const commentId = await ctx.db.insert("comments", {
      postId: args.blogId, // Utiliser le même champ que pour les posts
      authorId: args.authorId,
      content: args.content,
      likes: [],
    });

    // Mettre à jour l'article avec le nouveau commentaire
    await ctx.db.patch(args.blogId, {
      comments: [...(blog.comments || []), commentId],
    });

    // Mettre à jour les stats de l'auteur de l'article
    const blogAuthor = await ctx.db.get(blog.authorId);
    if (blogAuthor && blogAuthor.stats) {
      await ctx.db.patch(blog.authorId, {
        stats: {
          ...blogAuthor.stats,
          comments: (blogAuthor.stats.comments || 0) + 1,
        },
      });
    }

    return commentId;
  },
});

// Sauvegarder un article
export const saveBlog = mutation({
  args: {
    blogId: v.id("blogs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (!blog) {
      throw new Error("Article non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const saves = blog.saves || [];
    const userSaveIndex = saves.findIndex((id) => id === args.userId);

    if (userSaveIndex === -1) {
      // Sauvegarder l'article
      await ctx.db.patch(args.blogId, {
        saves: [...saves, args.userId],
      });
    } else {
      // Retirer la sauvegarde
      saves.splice(userSaveIndex, 1);
      await ctx.db.patch(args.blogId, {
        saves: saves,
      });
    }

    return true;
  },
});

// Partager un article
export const shareBlog = mutation({
  args: {
    blogId: v.id("blogs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (!blog) {
      throw new Error("Article non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Incrémenter le compteur de partages
    await ctx.db.patch(args.blogId, {
      shares: (blog.shares || 0) + 1,
    });

    // Mettre à jour les stats de l'auteur
    const author = await ctx.db.get(blog.authorId);
    if (author && author.stats) {
      await ctx.db.patch(blog.authorId, {
        stats: {
          ...author.stats,
          shares: (author.stats.shares || 0) + 1,
        },
      });
    }

    return true;
  },
}); 