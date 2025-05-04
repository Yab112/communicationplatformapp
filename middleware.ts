import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if token exists
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Verify token
    verify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    // Token is invalid
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/feeds/:path*", "/resources/:path*", "/chat/:path*", "/settings/:path*", "/profile/:path*"],
}
