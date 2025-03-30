import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Créer un nouveau projet
export const createProject = mutation({
  args: {
    authorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    video: v.optional(v.string()),
    githubLink: v.optional(v.string()),
    demoLink: v.optional(v.string()),
    technologies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'auteur existe et a les permissions nécessaires
    const author = await ctx.db.get(args.authorId);
    if (!author || (author.role !== "colab" && author.role !== "admin")) {
      throw new Error("Permission refusée - Seuls les collaborateurs et administrateurs peuvent créer des projets");
    }

    // Vérifier le nombre d'images
    if (args.images.length > 2) {
      throw new Error("Un projet ne peut pas avoir plus de 2 images");
    }

    const projectId = await ctx.db.insert("projects", {
      ...args,
      likes: [],
      comments: [],
    });

    return projectId;
  },
});

// Obtenir un projet spécifique
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

// Obtenir tous les projets
export const getAllProjects = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let projectsQuery = ctx.db
      .query("projects")
      .order("desc");

    if (args.cursor) {
      projectsQuery = projectsQuery.filter((q) => q.lt(q.field("_id"), args.cursor));
    }

    if (args.limit) {
      projectsQuery = projectsQuery.take(args.limit);
    }

    return await projectsQuery.collect();
  },
});

// Obtenir les projets d'un auteur spécifique
export const getAuthorProjects = query({
  args: { 
    authorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("projects")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc");

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Mettre à jour un projet
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    authorId: v.id("users"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    video: v.optional(v.string()),
    githubLink: v.optional(v.string()),
    demoLink: v.optional(v.string()),
    technologies: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Projet non trouvé");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Auteur non trouvé");
    }

    // Vérifier les permissions
    if (project.authorId !== args.authorId && author.role !== "admin") {
      throw new Error("Permission refusée");
    }

    // Vérifier le nombre d'images si elles sont mises à jour
    if (args.images && args.images.length > 2) {
      throw new Error("Un projet ne peut pas avoir plus de 2 images");
    }

    const { projectId, authorId, ...updates } = args;
    await ctx.db.patch(projectId, updates);
    return projectId;
  },
});

// Supprimer un projet
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Projet non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier les permissions
    if (project.authorId !== args.userId && user.role !== "admin") {
      throw new Error("Permission refusée");
    }

    await ctx.db.delete(args.projectId);
    return true;
  },
});

// Liker un projet
export const likeProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Projet non trouvé");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const likes = project.likes || [];
    const userLikeIndex = likes.findIndex((id) => id === args.userId);

    if (userLikeIndex === -1) {
      // Ajouter le like
      await ctx.db.patch(args.projectId, {
        likes: [...likes, args.userId],
      });

      // Mettre à jour les stats de l'auteur
      const author = await ctx.db.get(project.authorId);
      if (author && author.stats) {
        await ctx.db.patch(project.authorId, {
          stats: {
            ...author.stats,
            likes: (author.stats.likes || 0) + 1,
          },
        });
      }
    } else {
      // Retirer le like
      likes.splice(userLikeIndex, 1);
      await ctx.db.patch(args.projectId, {
        likes: likes,
      });

      // Mettre à jour les stats de l'auteur
      const author = await ctx.db.get(project.authorId);
      if (author && author.stats) {
        await ctx.db.patch(project.authorId, {
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

// Commenter un projet
export const commentProject = mutation({
  args: {
    projectId: v.id("projects"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Projet non trouvé");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Auteur non trouvé");
    }

    // Créer le commentaire
    const commentId = await ctx.db.insert("comments", {
      postId: args.projectId, // Utiliser le même champ que pour les posts
      authorId: args.authorId,
      content: args.content,
      likes: [],
    });

    // Mettre à jour le projet avec le nouveau commentaire
    await ctx.db.patch(args.projectId, {
      comments: [...(project.comments || []), commentId],
    });

    // Mettre à jour les stats de l'auteur du projet
    const projectAuthor = await ctx.db.get(project.authorId);
    if (projectAuthor && projectAuthor.stats) {
      await ctx.db.patch(project.authorId, {
        stats: {
          ...projectAuthor.stats,
          comments: (projectAuthor.stats.comments || 0) + 1,
        },
      });
    }

    return commentId;
  },
}); 