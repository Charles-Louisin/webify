import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Créer un avis
export const createReview = mutation({
  args: {
    authorId: v.id("users"),
    targetId: v.optional(v.id("users")),
    content: v.string(),
    rating: v.number(),
    isAppReview: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'auteur existe
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Auteur non trouvé");
    }

    // Si c'est un avis sur un utilisateur, vérifier qu'il existe
    if (args.targetId) {
      const target = await ctx.db.get(args.targetId);
      if (!target) {
        throw new Error("Utilisateur cible non trouvé");
      }

      // Vérifier que l'utilisateur cible est un colab ou admin
      if (target.role !== "collaborator" && target.role !== "admin") {
        throw new Error("Vous ne pouvez laisser un avis que sur un collaborateur ou un administrateur");
      }
    }

    // Vérifier que la note est entre 0 et 5
    if (args.rating < 0 || args.rating > 5) {
      throw new Error("La note doit être comprise entre 0 et 5");
    }

    const reviewId = await ctx.db.insert("reviews", {
      userId: args.authorId,
      userName: author.name,
      userImage: author.imageUrl || "",
      content: args.content,
      rating: args.rating,
      targetId: args.targetId,
      createdAt: new Date().toISOString(),
      isAppReview: args.isAppReview,
    });

    return reviewId;
  },
});

// Obtenir les avis sur l'application
export const getAppReviews = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("reviews")),
  },
  handler: async (ctx, args) => {
    let reviewsQuery = ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isAppReview"), true))
      .order("desc");

    if (args.cursor) {
      const cursor = await ctx.db.get(args.cursor);
      if (cursor) {
        reviewsQuery = reviewsQuery.filter((q) => 
          q.lt(q.field("_creationTime"), cursor._creationTime)
        );
      }
    }

    const allReviews = await reviewsQuery.collect();
    return args.limit ? allReviews.slice(0, args.limit) : allReviews;
  },
});

// Obtenir les avis sur un utilisateur
export const getUserReviews = query({
  args: {
    targetId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_target", (q) => q.eq("targetId", args.targetId))
      .filter((q) => q.eq(q.field("isAppReview"), false))
      .order("desc")
      .collect();

    return args.limit ? allReviews.slice(0, args.limit) : allReviews;
  },
});

// Envoyer une demande d'amitié
export const sendFriendRequest = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que les deux utilisateurs existent
    const [user1, user2] = await Promise.all([
      ctx.db.get(args.userId1),
      ctx.db.get(args.userId2),
    ]);

    if (!user1 || !user2) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier qu'ils ne sont pas déjà amis
    const existingFriendship = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("userId1"), args.userId1),
            q.eq(q.field("userId2"), args.userId2)
          ),
          q.and(
            q.eq(q.field("userId1"), args.userId2),
            q.eq(q.field("userId2"), args.userId1)
          )
        )
      )
      .unique();

    if (existingFriendship) {
      throw new Error("Une relation d'amitié existe déjà entre ces utilisateurs");
    }

    // Créer la demande d'amitié
    const friendshipId = await ctx.db.insert("friendships", {
      userId1: args.userId1,
      userId2: args.userId2,
      status: "pending",
    });

    return friendshipId;
  },
});

// Répondre à une demande d'amitié
export const respondToFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
    userId: v.id("users"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Demande d'amitié non trouvée");
    }

    // Vérifier que l'utilisateur est bien le destinataire
    if (friendship.userId2 !== args.userId) {
      throw new Error("Permission refusée");
    }

    // Vérifier que la demande est en attente
    if (friendship.status !== "pending") {
      throw new Error("Cette demande d'amitié a déjà été traitée");
    }

    // Mettre à jour le statut
    await ctx.db.patch(args.friendshipId, {
      status: args.accept ? "accepted" : "rejected",
    });

    return true;
  },
});

// Obtenir la liste d'amis d'un utilisateur
export const getUserFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Récupérer toutes les amitiés acceptées où l'utilisateur est impliqué
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(
            q.eq(q.field("userId1"), args.userId),
            q.eq(q.field("userId2"), args.userId)
          )
        )
      )
      .collect();

    // Extraire les IDs des amis
    const friendIds = friendships.map((friendship) =>
      friendship.userId1 === args.userId
        ? friendship.userId2
        : friendship.userId1
    );

    // Récupérer les informations des amis
    const friends = await Promise.all(
      friendIds.map((friendId) => ctx.db.get(friendId))
    );

    return friends.filter((friend) => friend !== null);
  },
});

// Obtenir les demandes d'amitié en attente
export const getPendingFriendRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("friendships")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("userId2"), args.userId)
        )
      )
      .collect();
  },
});

// Supprimer une amitié
export const removeFriend = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const friendship = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(
            q.and(
              q.eq(q.field("userId1"), args.userId),
              q.eq(q.field("userId2"), args.friendId)
            ),
            q.and(
              q.eq(q.field("userId1"), args.friendId),
              q.eq(q.field("userId2"), args.userId)
            )
          )
        )
      )
      .unique();

    if (!friendship) {
      throw new Error("Relation d'amitié non trouvée");
    }

    await ctx.db.delete(friendship._id);
    return true;
  },
});

export const getCollaboratorReviews = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("reviews")),
  },
  handler: async (ctx, args) => {
    let reviewsQuery = ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isAppReview"), false))
      .order("desc");

    if (args.cursor) {
      const cursor = await ctx.db.get(args.cursor);
      if (cursor) {
        reviewsQuery = reviewsQuery.filter((q) => 
          q.lt(q.field("_creationTime"), cursor._creationTime)
        );
      }
    }

    const allReviews = await reviewsQuery.collect();
    return args.limit ? allReviews.slice(0, args.limit) : allReviews;
  },
}); 