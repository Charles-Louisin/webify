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
    if (!author || (author.role !== "collaborator" && author.role !== "admin")) {
      throw new Error("Permission refusée - Seuls les collaborateurs et administrateurs peuvent créer des projets");
    }

    // Vérifier le nombre d'images
    if (args.images.length > 2) {
      throw new Error("Un projet ne peut pas avoir plus de 2 images");
    }

    const projectId = await ctx.db.insert("projects", {
      ...args,
      githubLink: args.githubLink || "",
      demoLink: args.demoLink || "",
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
      const cursor = await ctx.db.get(args.cursor);
      if (cursor) {
        projectsQuery = projectsQuery.filter((q) => 
          q.lt(q.field("_creationTime"), cursor._creationTime)
        );
      }
    }

    const allProjects = await projectsQuery.collect();
    return args.limit ? allProjects.slice(0, args.limit) : allProjects;
  },
});

// Obtenir les projets d'un auteur spécifique
export const getAuthorProjects = query({
  args: { 
    authorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();

    return args.limit ? allProjects.slice(0, args.limit) : allProjects;
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
            projectsLiked: (author.stats.projectsLiked || 0) + 1,
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
            projectsLiked: Math.max(0, (author.stats.projectsLiked || 0) - 1),
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
      authorId: args.authorId,
      content: args.content,
      parentId: args.projectId,
      likes: [],
    });

    // Mettre à jour le projet avec le nouveau commentaire
    await ctx.db.patch(args.projectId, {
      comments: [...project.comments, commentId],
    });

    // Mettre à jour les stats de l'auteur du projet
    const projectAuthor = await ctx.db.get(project.authorId);
    if (projectAuthor && projectAuthor.stats) {
      await ctx.db.patch(project.authorId, {
        stats: {
          ...projectAuthor.stats,
          commentsCreated: (projectAuthor.stats.commentsCreated || 0) + 1,
        },
      });
    }

    return commentId;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    video: v.optional(v.string()),
    githubLink: v.string(),
    demoLink: v.string(),
    technologies: v.array(v.string()),
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

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      images: args.images,
      video: args.video,
      githubLink: args.githubLink,
      demoLink: args.demoLink,
      technologies: args.technologies,
      authorId: user._id,
      comments: [],
      likes: [],
    });

    return projectId;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
}); 