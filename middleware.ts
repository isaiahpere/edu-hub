import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// By default, all routes are public.
// You can protect a route by adding a middleware.

// i.e. to get all nested routes from /dashboard == "/dashboard(.*)"
const isProtectedRoute = createRouteMatcher(["/"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
