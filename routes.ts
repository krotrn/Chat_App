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
 * @default ["/login", "/register", "/error", "/auth/verify-email"]
 */
export const authRoutes = ["/login", "/register", "/error", "/auth/verify-email", '/auth/verify'];

/**
 * The prefix used for authentication-related API routes.
 * 
 * @constant {string[]}
 */
export const apiAuthPrefix = ["/api/v1/auth", "/api/auth"];

export const internalRoutes = ["/api/v1/internal"];


/**
 * The default URL to which users are redirected after a successful login.
 * 
 * @constant {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/settings";
