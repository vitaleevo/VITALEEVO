/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as ai from "../ai.js";
import type * as apiKeys from "../apiKeys.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as brands from "../brands.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as debug from "../debug.js";
import type * as files from "../files.js";
import type * as flatten_urls from "../flatten_urls.js";
import type * as importData from "../importData.js";
import type * as newsletter from "../newsletter.js";
import type * as newsletterActions from "../newsletterActions.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as projects from "../projects.js";
import type * as seed from "../seed.js";
import type * as seedBlogPosts from "../seedBlogPosts.js";
import type * as seedStore from "../seedStore.js";
import type * as settings from "../settings.js";
import type * as setupAdmin from "../setupAdmin.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  ai: typeof ai;
  apiKeys: typeof apiKeys;
  articles: typeof articles;
  auth: typeof auth;
  brands: typeof brands;
  cart: typeof cart;
  categories: typeof categories;
  contacts: typeof contacts;
  crons: typeof crons;
  dashboard: typeof dashboard;
  debug: typeof debug;
  files: typeof files;
  flatten_urls: typeof flatten_urls;
  importData: typeof importData;
  newsletter: typeof newsletter;
  newsletterActions: typeof newsletterActions;
  notifications: typeof notifications;
  orders: typeof orders;
  products: typeof products;
  projects: typeof projects;
  seed: typeof seed;
  seedBlogPosts: typeof seedBlogPosts;
  seedStore: typeof seedStore;
  settings: typeof settings;
  setupAdmin: typeof setupAdmin;
  users: typeof users;
  utils: typeof utils;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
