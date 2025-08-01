/**
 * An array of public routes that do not require authentication.
 *
 * @constant
 * @type {string[]}
 * @default ["/"]
 */
export const publicRoutes: string[] = ["/"];

/**
 * An array of authentication-related route paths.
 *
 * @constant {string[]} authRoutes
 * @default ["/login", "/register", "/error", "/auth/verify-email", "/auth/verify"]
 */
export const authRoutes = [
  "/login",
  "/register",
  "/error",
  "/auth/verify-email",
  "/auth/verify",
];

/**
 * The prefix used for authentication-related API routes.
 *
 * @constant {string[]}
 */
export const apiAuthPrefix = ["/api/auth"];

/**
 * The default URL to which users are redirected after a successful login.
 *
 * @constant {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
