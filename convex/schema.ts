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
    password: v.string(),
    imageUrl: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    github: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
    role: v.string(),
    userId: v.string(),
    stats: v.object({
      projectsCreated: v.optional(v.float64()),
      projectsLiked: v.optional(v.float64()),
      postsCreated: v.optional(v.float64()),
      postsLiked: v.optional(v.float64()),
      commentsCreated: v.optional(v.float64()),
      commentsLiked: v.optional(v.float64()),
      likedBy: v.optional(v.array(v.string())),
      online: v.optional(v.boolean()),
    }),
  }).index("by_email", ["email"]),

  // Table des posts
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    image: v.string(),
    tags: v.array(v.string()),
    authorId: v.id("users"),
    comments: v.array(v.id("comments")),
    likes: v.array(v.id("users")),
    shares: v.number(),
    saves: v.array(v.id("users")),
    isPublished: v.boolean(),
    createdAt: v.string(),
  }).index("by_author", ["authorId"]),

  // Table des commentaires
  comments: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    parentId: v.union(v.id("projects"), v.id("posts"), v.id("blogs")),
    likes: v.array(v.id("users")),
  }).index("by_post", ["parentId"]),

  // Table des projets
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    video: v.optional(v.string()),
    githubLink: v.string(),
    demoLink: v.string(),
    technologies: v.array(v.string()),
    authorId: v.id("users"),
    comments: v.array(v.id("comments")),
    likes: v.array(v.id("users")),
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
    createdAt: v.string(),
  }).index("by_author", ["authorId"]),

  // Table des messages
  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.union(v.id("users"), v.id("chatGroups")),
    type: v.union(v.literal("private"), v.literal("group")),
    content: v.string(),
    attachments: v.array(v.string()),
    isRead: v.boolean(),
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
    userId: v.string(),
    userName: v.string(),
    userImage: v.string(),
    content: v.string(),
    rating: v.number(),
    targetId: v.optional(v.string()),
    targetName: v.string(),
    createdAt: v.string(),
    isAppReview: v.boolean(),
  })
  .index("by_author", ["userId"])
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
