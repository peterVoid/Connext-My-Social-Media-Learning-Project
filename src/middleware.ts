import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);
export const config = {
  matcher: [
    "/((?!sign-in|sign-up|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
