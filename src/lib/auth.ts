import { exclude } from '@/utils/exclude'
import { User, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import { AuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (credentials) {
          const { email, password } = credentials

          const user = await prisma.user.findUnique({ where: { email } })

          if (user) {
            if (await bcrypt.compare(password, user.password)) {
              const userWithoutPassword = exclude(user, ['password']) as User

              return userWithoutPassword
            }
          }
        }

        return null
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? UserRole.CUSTOMER;
      }

      return token
    },
    session({ token, session }) {
      if (session.user) {
        session.user.role = token.role
      }

      return session
    },
  },
  pages: {
    signIn: '/signin',
  }
}
// Use it in server contexts
export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, authOptions)
}