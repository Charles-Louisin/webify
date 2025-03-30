import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Ajouter une compétence
export const addSkill = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    level: v.union(
      v.literal("débutant"),
      v.literal("intermédiaire"),
      v.literal("expert")
    ),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur existe et a les permissions nécessaires
    const user = await ctx.db.get(args.userId);
    if (!user || (user.role !== "colab" && user.role !== "admin")) {
      throw new Error("Permission refusée - Seuls les collaborateurs et administrateurs peuvent ajouter des compétences");
    }

    const skillId = await ctx.db.insert("skills", {
      userId: args.userId,
      name: args.name,
      level: args.level,
      category: args.category,
    });

    return skillId;
  },
});

// Obtenir les compétences d'un utilisateur
export const getUserSkills = query({
  args: { 
    userId: v.id("users"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    return await query.collect();
  },
});

// Mettre à jour une compétence
export const updateSkill = mutation({
  args: {
    skillId: v.id("skills"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("débutant"),
        v.literal("intermédiaire"),
        v.literal("expert")
      )
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    if (!skill) {
      throw new Error("Compétence non trouvée");
    }

    // Vérifier que l'utilisateur est propriétaire de la compétence
    if (skill.userId !== args.userId) {
      throw new Error("Permission refusée");
    }

    const { skillId, userId, ...updates } = args;
    await ctx.db.patch(skillId, updates);
    return skillId;
  },
});

// Supprimer une compétence
export const deleteSkill = mutation({
  args: {
    skillId: v.id("skills"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    if (!skill) {
      throw new Error("Compétence non trouvée");
    }

    // Vérifier que l'utilisateur est propriétaire de la compétence
    if (skill.userId !== args.userId) {
      throw new Error("Permission refusée");
    }

    await ctx.db.delete(args.skillId);
    return true;
  },
});

// Obtenir toutes les compétences par catégorie
export const getSkillsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Obtenir toutes les catégories uniques
export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const skills = await ctx.db.query("skills").collect();
    const categories = new Set(skills.map(skill => skill.category));
    return Array.from(categories);
  },
}); 