import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/profile", "/admin/dashboard"];

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = getSessionCookie(req);

  const res = NextResponse.next();

  const isLoggedIn = !!sessionCookie;
  const isOnProtectedRoute = protectedRoutes.includes(nextUrl.pathname);
  const isOnAuthRoute = nextUrl.pathname.startsWith("/(auth)");

  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};



// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { auth } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// export async function proxy(request: NextRequest) {
//   const session = await auth.api.getSession({ headers: request.headers });

//   // Protected routes
//   const protectedRoutes = {
//     "/admin-dashboard": ["ADMIN"],
//     "/sellers-dashboard": ["SELLER", "ADMIN"],
//     "/buyers-dashboard": ["BUYER", "SELLER", "ADMIN"],
//   };

//   const pathname = request.nextUrl.pathname;

//   // Check if route requires authentication
//   for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
//     if (pathname.startsWith(route)) {
//       if (!session) {
//         return NextResponse.redirect(new URL("/auth/sign-in", request.url));
//       }

//       // Check MFA requirement for admin routes
//       if (route === "/admin-dashboard") {
//         const user = await prisma.user.findUnique({
//           where: { id: session.user.id },
//           include: { mfaMethods: true },
//         });

//         const hasMfa = user?.mfaMethods.some((m) => m.enabled);
//         if (!hasMfa) {
//           return NextResponse.redirect(new URL("/auth/setup-mfa", request.url));
//         }
//       }

//       // Check role
//       if (!allowedRoles.includes(session.user.role)) {
//         return NextResponse.redirect(new URL("/unauthorized", request.url));
//       }
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin-dashboard/:path*",
//     "/sellers-dashboard/:path*",
//     "/buyers-dashboard/:path*",
//   ],
// };