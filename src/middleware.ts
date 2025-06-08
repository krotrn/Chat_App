import { auth } from "@/auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

import { NextResponse } from "next/server";

export default auth((req) => {
  const response = NextResponse.next();
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = apiAuthPrefix.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );


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
