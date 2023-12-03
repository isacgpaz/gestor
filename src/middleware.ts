import { UserRole } from "@prisma/client";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { routes } from "./constants/routes";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    if (routes.public.includes(pathname) && token) {
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

        return true
      }
    },
  })

export const config = {
  matcher: [
    ...routes.public,
    ...routes.protecteds.admin,
    ...routes.protecteds.customer
  ],
}