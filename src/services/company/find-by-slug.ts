import { Company } from '@prisma/client'
import axios from 'axios'

export async function findCompanyBySlug(slug: string) {
  const response = await axios<Company>(`/api/company/by-slug/${slug}`)

  return response.data
}