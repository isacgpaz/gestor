import { UserRole } from "@prisma/client";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { routes } from "./constants/routes";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;
    const search = req.nextUrl.search

    console.log(search)

    if (routes.public.includes(pathname) && token && !search.includes('callbackUrl')) {
      if (token?.role === UserRole.ADMIN) {
        return NextResponse.redirect(new URL(routes.protecteds.admin[0], req.url))
      }

      if (token?.role === UserRole.CUSTOMER) {
        return NextResponse.redirect(new URL(routes.protecteds.customer[0], req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        if (routes.protecteds.admin.includes(pathname)) {
          return token?.role === UserRole.ADMIN
        }

        if (routes.protecteds.customer.includes(pathname)) {
          return token?.role === UserRole.CUSTOMER
        }

        if (routes.protecteds.both.some((value) => pathname.includes(value))) {
          return Boolean(token)
        }

        return true
      }
    },
  })

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/admin/dashboard",
    "/dashboard",
    "/admin/settings",
    "/settings",
    "/company/:path*",
    "/admin/calendar"
  ],
}