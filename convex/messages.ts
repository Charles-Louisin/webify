import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Envoyer un message privé
export const sendPrivateMessage = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'expéditeur et le destinataire existent
    const [sender, receiver] = await Promise.all([
      ctx.db.get(args.senderId),
      ctx.db.get(args.receiverId),
    ]);

    if (!sender || !receiver) {
      throw new Error("Utilisateur non trouvé");
    }

    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
      receiverId: args.receiverId,
      type: "private",
      content: args.content,
      attachments: args.attachments || [],
      isRead: false,
    });

    return messageId;
  },
});

// Obtenir les messages privés entre deux utilisateurs
export const getPrivateMessages = query({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    let messagesQuery = ctx.db
      .query("messages")
      .filter((q) => 
        q.or(
          q.and(
            q.eq(q.field("senderId"), args.userId1),
            q.eq(q.field("receiverId"), args.userId2)
          ),
          q.and(
            q.eq(q.field("senderId"), args.userId2),
            q.eq(q.field("receiverId"), args.userId1)
          )
        )
      )
      .order("desc");

    if (args.cursor) {
      messagesQuery = messagesQuery.filter((q) => 
        q.lt(q.field("_id"), args.cursor!)
      );
    }

    const messages = await messagesQuery.collect();
    return args.limit ? messages.slice(0, args.limit) : messages;
  },
});

// Marquer un message comme lu
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message non trouvé");
    }

    // Vérifier que l'utilisateur est bien le destinataire
    if (message.receiverId !== args.userId) {
      throw new Error("Permission refusée");
    }

    await ctx.db.patch(args.messageId, { isRead: true });
    return true;
  },
});

// Créer un groupe de discussion
export const createChatGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    members: v.array(v.id("users")),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier que le créateur existe
    const creator = await ctx.db.get(args.creatorId);
    if (!creator) {
      throw new Error("Créateur non trouvé");
    }

    // Vérifier que tous les membres existent
    const members = await Promise.all(
      args.members.map((memberId) => ctx.db.get(memberId))
    );

    if (members.some((member) => !member)) {
      throw new Error("Un ou plusieurs membres n'existent pas");
    }

    // Créer le groupe avec le créateur comme admin
    const groupId = await ctx.db.insert("chatGroups", {
      name: args.name,
      description: args.description,
      members: [args.creatorId, ...args.members],
      admins: [args.creatorId],
      image: args.image,
    });

    return groupId;
  },
});

// Obtenir les groupes d'un utilisateur
export const getUserGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("chatGroups")
      .collect();
    
    return groups.filter(group => group.members.includes(args.userId));
  },
});

// Ajouter un membre à un groupe
export const addGroupMember = mutation({
  args: {
    groupId: v.id("chatGroups"),
    adminId: v.id("users"),
    newMemberId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    // Vérifier que l'admin a les permissions
    if (!group.admins.includes(args.adminId)) {
      throw new Error("Permission refusée");
    }

    // Vérifier que le nouveau membre existe
    const newMember = await ctx.db.get(args.newMemberId);
    if (!newMember) {
      throw new Error("Utilisateur non trouvé");
    }

    // Ajouter le membre s'il n'est pas déjà dans le groupe
    if (!group.members.includes(args.newMemberId)) {
      await ctx.db.patch(args.groupId, {
        members: [...group.members, args.newMemberId],
      });
    }

    return true;
  },
});

// Retirer un membre d'un groupe
export const removeGroupMember = mutation({
  args: {
    groupId: v.id("chatGroups"),
    adminId: v.id("users"),
    memberId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    // Vérifier que l'admin a les permissions
    if (!group.admins.includes(args.adminId)) {
      throw new Error("Permission refusée");
    }

    // Ne pas permettre de retirer un admin
    if (group.admins.includes(args.memberId)) {
      throw new Error("Impossible de retirer un administrateur");
    }

    // Retirer le membre
    await ctx.db.patch(args.groupId, {
      members: group.members.filter((id) => id !== args.memberId),
    });

    return true;
  },
});

// Promouvoir un membre en admin
export const promoteToAdmin = mutation({
  args: {
    groupId: v.id("chatGroups"),
    adminId: v.id("users"),
    memberId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    // Vérifier que l'admin a les permissions
    if (!group.admins.includes(args.adminId)) {
      throw new Error("Permission refusée");
    }

    // Vérifier que le membre est dans le groupe
    if (!group.members.includes(args.memberId)) {
      throw new Error("L'utilisateur n'est pas membre du groupe");
    }

    // Promouvoir le membre en admin s'il ne l'est pas déjà
    if (!group.admins.includes(args.memberId)) {
      await ctx.db.patch(args.groupId, {
        admins: [...group.admins, args.memberId],
      });
    }

    return true;
  },
});

// Quitter un groupe
export const leaveGroup = mutation({
  args: {
    groupId: v.id("chatGroups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    // Vérifier que l'utilisateur est membre du groupe
    if (!group.members.includes(args.userId)) {
      throw new Error("Vous n'êtes pas membre de ce groupe");
    }

    // Si c'est le dernier admin, il ne peut pas quitter le groupe
    if (
      group.admins.includes(args.userId) &&
      group.admins.length === 1 &&
      group.members.length > 1
    ) {
      throw new Error("Vous devez d'abord nommer un autre administrateur");
    }

    // Retirer l'utilisateur des membres et des admins
    await ctx.db.patch(args.groupId, {
      members: group.members.filter((id) => id !== args.userId),
      admins: group.admins.filter((id) => id !== args.userId),
    });

    // Si c'était le dernier membre, supprimer le groupe
    if (group.members.length === 1) {
      await ctx.db.delete(args.groupId);
    }

    return true;
  },
});

export const getGroupMessages = query({
  args: { groupId: v.id("chatGroups") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "group"),
          q.eq(q.field("receiverId"), args.groupId)
        )
      )
      .order("desc")
      .collect();
    return messages;
  },
});

export const sendGroupMessage = mutation({
  args: {
    senderId: v.id("users"),
    groupId: v.id("chatGroups"),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
      receiverId: args.groupId,
      type: "group",
      content: args.content,
      attachments: args.attachments || [],
      isRead: false,
    });
    return messageId;
  },
}); 