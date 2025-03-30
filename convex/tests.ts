import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Test des permissions utilisateur
export const testUserPermissions = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const results = {
      user: null as any,
      basicPermissions: {} as any,
      contentCreationPermissions: {} as any,
      adminPermissions: {} as any,
    };

    // Récupérer l'utilisateur
    const user = await ctx.db.get(args.userId);
    results.user = {
      id: args.userId,
      role: user?.role,
    };

    try {
      // Test des permissions de base (tous les utilisateurs)
      results.basicPermissions = {
        canViewProfile: true,
        canSendMessages: true,
        canLikeContent: true,
        canCommentContent: true,
        canJoinGroups: true,
      };

      // Test des permissions de création de contenu (colab et admin)
      results.contentCreationPermissions = {
        canCreatePost: user?.role === "colab" || user?.role === "admin",
        canCreateProject: user?.role === "colab" || user?.role === "admin",
        canCreateBlog: user?.role === "colab" || user?.role === "admin",
        canManageSkills: user?.role === "colab" || user?.role === "admin",
        hasCertificationBadge: user?.role === "colab" || user?.role === "admin",
      };

      // Test des permissions administratives (admin uniquement)
      results.adminPermissions = {
        canAccessDashboard: user?.role === "admin",
        canManageUsers: user?.role === "admin",
        canViewGlobalStats: user?.role === "admin",
        canModifyAnyContent: user?.role === "admin",
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        results,
      };
    }

    return {
      success: true,
      results,
    };
  },
});

// Test pratique des permissions
export const testPermissionsInAction = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const results = {
      user: null as any,
      practicalTests: {} as any,
    };

    const user = await ctx.db.get(args.userId);
    results.user = {
      id: args.userId,
      role: user?.role,
    };

    try {
      // Test de création de post
      try {
        const postId = await ctx.db.insert("posts", {
          authorId: args.userId,
          content: "Test post",
          likes: [],
          comments: [],
          shares: 0,
          createdAt: new Date().toISOString(),
        });
        results.practicalTests.postCreation = {
          success: true,
          allowed: user?.role === "colab" || user?.role === "admin",
        };
        // Nettoyer le post de test
        await ctx.db.delete(postId);
      } catch {
        results.practicalTests.postCreation = {
          success: false,
          allowed: user?.role === "colab" || user?.role === "admin",
        };
      }

      // Test d'accès aux statistiques globales
      try {
        const stats = await ctx.db.query("users").collect();
        results.practicalTests.statsAccess = {
          success: true,
          allowed: user?.role === "admin",
        };
      } catch {
        results.practicalTests.statsAccess = {
          success: false,
          allowed: user?.role === "admin",
        };
      }

      // Test de modification de rôle (admin uniquement)
      try {
        const testUserId = await ctx.db.insert("users", {
          name: "Test User",
          email: "test@test.com",
          role: "user",
        });
        await ctx.db.patch(testUserId, { role: "colab" });
        results.practicalTests.roleModification = {
          success: true,
          allowed: user?.role === "admin",
        };
        // Nettoyer l'utilisateur de test
        await ctx.db.delete(testUserId);
      } catch {
        results.practicalTests.roleModification = {
          success: false,
          allowed: user?.role === "admin",
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        results,
      };
    }

    return {
      success: true,
      results,
    };
  },
}); 