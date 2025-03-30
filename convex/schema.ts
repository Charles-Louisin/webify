import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // Table des utilisateurs
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("colab"), v.literal("admin")),
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    stats: v.optional(v.object({
      likes: v.optional(v.number()),
      comments: v.optional(v.number()),
      shares: v.optional(v.number()),
    })),
  }).index("by_email", ["email"]),

  // Table des posts
  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    image: v.optional(v.string()),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
    shares: v.number(),
    isPublished: v.boolean(),
  }).index("by_author", ["authorId"]),

  // Table des commentaires
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    likes: v.array(v.id("users")),
  }).index("by_post", ["postId"]),

  // Table des projets
  projects: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    video: v.optional(v.string()),
    githubLink: v.optional(v.string()),
    demoLink: v.optional(v.string()),
    technologies: v.array(v.string()),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
  }).index("by_author", ["authorId"]),

  // Table des compétences
  skills: defineTable({
    userId: v.id("users"),
    name: v.string(),
    level: v.union(
      v.literal("débutant"),
      v.literal("intermédiaire"),
      v.literal("expert")
    ),
    category: v.string(),
  }).index("by_user", ["userId"]),

  // Table des articles de blog
  blogs: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    image: v.optional(v.string()),
    tags: v.array(v.string()),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("comments")),
    saves: v.array(v.id("users")),
    shares: v.number(),
    isPublished: v.boolean(),
  }).index("by_author", ["authorId"]),

  // Table des messages
  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
    attachments: v.optional(v.array(v.string())),
  })
  .index("by_sender", ["senderId"])
  .index("by_receiver", ["receiverId"]),

  // Table des groupes de discussion
  chatGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    members: v.array(v.id("users")),
    admins: v.array(v.id("users")),
    image: v.optional(v.string()),
  }),

  // Table des avis
  reviews: defineTable({
    authorId: v.id("users"),
    targetId: v.optional(v.id("users")),
    content: v.string(),
    rating: v.number(),
    isAppReview: v.boolean(),
  })
  .index("by_author", ["authorId"])
  .index("by_target", ["targetId"]),

  // Table des amis
  friendships: defineTable({
    userId1: v.id("users"),
    userId2: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  })
  .index("by_user1", ["userId1"])
  .index("by_user2", ["userId2"]),
});
