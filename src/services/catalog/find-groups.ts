import { CatalogGroup } from "@prisma/client"
import axios from "axios"

type CatalogGroupProps = {
  companyId?: string,
}

export async function findCatalogGroups(params: CatalogGroupProps) {
  const response = await axios<CatalogGroup[]>('/api/catalog/group', { params })

  return response.data
}