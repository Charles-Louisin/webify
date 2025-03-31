/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as blogs from "../blogs.js";
import type * as fix_users from "../fix_users.js";
import type * as messages from "../messages.js";
import type * as migrate from "../migrate.js";
import type * as myFunctions from "../myFunctions.js";
import type * as posts from "../posts.js";
import type * as projects from "../projects.js";
import type * as reviews from "../reviews.js";
import type * as skills from "../skills.js";
import type * as social from "../social.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  blog: typeof blog;
  blogs: typeof blogs;
  fix_users: typeof fix_users;
  messages: typeof messages;
  migrate: typeof migrate;
  myFunctions: typeof myFunctions;
  posts: typeof posts;
  projects: typeof projects;
  reviews: typeof reviews;
  skills: typeof skills;
  social: typeof social;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
