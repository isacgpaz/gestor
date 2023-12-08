import { exclude } from '@/utils/exclude'
import { generateRandomPassword } from '@/utils/generate-random-password'
import { User, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'
import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "../prisma"

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

          const user = await prisma.user.findUnique({
            where: { email },
            include: { company: true }
          })

          if (user) {
            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (passwordsMatch) {
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { name, email } = user;

        try {
          const userExists = await prisma.user.findUnique({ where: { email: String(email) } })

          if (!userExists) {
            const res = await fetch("http://localhost:3000/api/auth/signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name,
                email,
                password: generateRandomPassword()
              }),
            });

            if (res.ok) {
              return Boolean(user);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }

      return Boolean(user)
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? UserRole.CUSTOMER;
        token.company = user.company
        token.id = user.id
      }

      return token
    },
    session({ token, session }) {
      if (session.user) {
        session.user.role = token.role
        session.user.company = token.company
        session.user.id = token.id
      }

      return session
    },
  },
  pages: {
    signIn: '/signin',
  }
}