import { getSession } from 'next-auth/react'

export async function clientSession() {
  return getSession()
}

