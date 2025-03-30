import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { checkIsAdmin } from "./auth";

// Obtenir les statistiques globales
export const getGlobalStats = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx, args.adminId);

    // Récupérer tous les utilisateurs
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;
    const totalColabs = users.filter(user => user.role === "colab").length;
    const totalAdmins = users.filter(user => user.role === "admin").length;

    // Récupérer tous les posts
    const posts = await ctx.db.query("posts").collect();
    const totalPosts = posts.length;
    const totalPostLikes = posts.reduce((acc, post) => acc + post.likes.length, 0);
    const totalPostComments = posts.reduce((acc, post) => acc + post.comments.length, 0);
    const totalPostShares = posts.reduce((acc, post) => acc + post.shares, 0);

    // Récupérer tous les projets
    const projects = await ctx.db.query("projects").collect();
    const totalProjects = projects.length;
    const totalProjectLikes = projects.reduce((acc, project) => acc + project.likes.length, 0);
    const totalProjectComments = projects.reduce((acc, project) => acc + project.comments.length, 0);

    // Récupérer tous les blogs
    const blogs = await ctx.db.query("blogs").collect();
    const totalBlogs = blogs.length;
    const totalBlogLikes = blogs.reduce((acc, blog) => acc + blog.likes.length, 0);
    const totalBlogComments = blogs.reduce((acc, blog) => acc + blog.comments.length, 0);
    const totalBlogShares = blogs.reduce((acc, blog) => acc + blog.shares, 0);

    // Récupérer tous les avis
    const reviews = await ctx.db.query("reviews").collect();
    const totalReviews = reviews.length;
    const totalAppReviews = reviews.filter(review => review.isAppReview).length;
    const averageAppRating = reviews
      .filter(review => review.isAppReview)
      .reduce((acc, review) => acc + review.rating, 0) / (totalAppReviews || 1);

    return {
      users: {
        total: totalUsers,
        colabs: totalColabs,
        admins: totalAdmins,
      },
      posts: {
        total: totalPosts,
        likes: totalPostLikes,
        comments: totalPostComments,
        shares: totalPostShares,
      },
      projects: {
        total: totalProjects,
        likes: totalProjectLikes,
        comments: totalProjectComments,
      },
      blogs: {
        total: totalBlogs,
        likes: totalBlogLikes,
        comments: totalBlogComments,
        shares: totalBlogShares,
      },
      reviews: {
        total: totalReviews,
        appReviews: totalAppReviews,
        averageAppRating,
      },
    };
  },
});

// Obtenir les statistiques d'un utilisateur spécifique
export const getUserStats = query({
  args: {
    adminId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx, args.adminId);

    const user = await ctx.db.get(args.targetUserId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Récupérer les posts de l'utilisateur
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.targetUserId))
      .collect();

    const totalPosts = posts.length;
    const totalPostLikes = posts.reduce((acc, post) => acc + post.likes.length, 0);
    const totalPostComments = posts.reduce((acc, post) => acc + post.comments.length, 0);
    const totalPostShares = posts.reduce((acc, post) => acc + post.shares, 0);

    // Récupérer les projets de l'utilisateur
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_author", (q) => q.eq("authorId", args.targetUserId))
      .collect();

    const totalProjects = projects.length;
    const totalProjectLikes = projects.reduce((acc, project) => acc + project.likes.length, 0);
    const totalProjectComments = projects.reduce((acc, project) => acc + project.comments.length, 0);

    // Récupérer les blogs de l'utilisateur
    const blogs = await ctx.db
      .query("blogs")
      .withIndex("by_author", (q) => q.eq("authorId", args.targetUserId))
      .collect();

    const totalBlogs = blogs.length;
    const totalBlogLikes = blogs.reduce((acc, blog) => acc + blog.likes.length, 0);
    const totalBlogComments = blogs.reduce((acc, blog) => acc + blog.comments.length, 0);
    const totalBlogShares = blogs.reduce((acc, blog) => acc + blog.shares, 0);

    // Récupérer les avis sur l'utilisateur
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_target", (q) => q.eq("targetId", args.targetUserId))
      .collect();

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / (totalReviews || 1);

    return {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        stats: user.stats,
      },
      posts: {
        total: totalPosts,
        likes: totalPostLikes,
        comments: totalPostComments,
        shares: totalPostShares,
      },
      projects: {
        total: totalProjects,
        likes: totalProjectLikes,
        comments: totalProjectComments,
      },
      blogs: {
        total: totalBlogs,
        likes: totalBlogLikes,
        comments: totalBlogComments,
        shares: totalBlogShares,
      },
      reviews: {
        total: totalReviews,
        averageRating,
      },
    };
  },
});

// Obtenir les utilisateurs les plus actifs
export const getMostActiveUsers = query({
  args: {
    adminId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx, args.adminId);

    const users = await ctx.db.query("users").collect();

    // Calculer le score d'activité pour chaque utilisateur
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        const posts = await ctx.db
          .query("posts")
          .withIndex("by_author", (q) => q.eq("authorId", user._id))
          .collect();

        const projects = await ctx.db
          .query("projects")
          .withIndex("by_author", (q) => q.eq("authorId", user._id))
          .collect();

        const blogs = await ctx.db
          .query("blogs")
          .withIndex("by_author", (q) => q.eq("authorId", user._id))
          .collect();

        const activityScore =
          posts.length * 2 +
          projects.length * 3 +
          blogs.length * 2 +
          (user.stats?.likes || 0) +
          (user.stats?.comments || 0) * 2 +
          (user.stats?.shares || 0) * 3;

        return {
          user,
          activityScore,
        };
      })
    );

    // Trier par score d'activité
    usersWithActivity.sort((a, b) => b.activityScore - a.activityScore);

    // Limiter le nombre de résultats si demandé
    if (args.limit) {
      return usersWithActivity.slice(0, args.limit);
    }

    return usersWithActivity;
  },
});

// Obtenir les collaborateurs les plus performants
export const getTopCollaborators = query({
  args: {
    adminId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx, args.adminId);

    const colabs = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "colab"))
      .collect();

    // Calculer le score de performance pour chaque collaborateur
    const colabsWithPerformance = await Promise.all(
      colabs.map(async (colab) => {
        const posts = await ctx.db
          .query("posts")
          .withIndex("by_author", (q) => q.eq("authorId", colab._id))
          .collect();

        const projects = await ctx.db
          .query("projects")
          .withIndex("by_author", (q) => q.eq("authorId", colab._id))
          .collect();

        const blogs = await ctx.db
          .query("blogs")
          .withIndex("by_author", (q) => q.eq("authorId", colab._id))
          .collect();

        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_target", (q) => q.eq("targetId", colab._id))
          .collect();

        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1);

        const performanceScore =
          posts.reduce((acc, post) => acc + post.likes.length + post.comments.length * 2 + post.shares * 3, 0) +
          projects.reduce((acc, project) => acc + project.likes.length + project.comments.length * 2, 0) +
          blogs.reduce((acc, blog) => acc + blog.likes.length + blog.comments.length * 2 + blog.shares * 3, 0) +
          averageRating * 10;

        return {
          colab,
          performanceScore,
          stats: {
            posts: posts.length,
            projects: projects.length,
            blogs: blogs.length,
            reviews: reviews.length,
            averageRating,
          },
        };
      })
    );

    // Trier par score de performance
    colabsWithPerformance.sort((a, b) => b.performanceScore - a.performanceScore);

    // Limiter le nombre de résultats si demandé
    if (args.limit) {
      return colabsWithPerformance.slice(0, args.limit);
    }

    return colabsWithPerformance;
  },
}); 