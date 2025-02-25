import { auth } from "./auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  internalRoutes,
  publicRoutes,
} from "@/routes";

import { NextResponse } from "next/server";

export default auth((req) => {
  const response = NextResponse.next();

  // Security headers
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = apiAuthPrefix.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isInternalRoute = internalRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  );

  if (isInternalRoute) {
    const apiKey = req.headers.get("x-internal-api-key");
    if (apiKey === process.env.INTERNAL_API_KEY) {
      return response;
    }
    return new Response("Unauthorized", { status: 401 });
  }
  
  

  // Allow public routes and registration API
  if (isApiAuthRoute || isPublicRoute) {
    return response; // Return the response with security headers
  }

  // Handle auth routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return response;
  }

  const isVerifyEmailPath = nextUrl.pathname.startsWith("/auth/verify-email/");

  if (isVerifyEmailPath) {
    // Allow access to verification URLs even with encoded emails
    return response;
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
