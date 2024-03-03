import { Catalog } from "@/types/catalog"
import axios from "axios"

type CatalogProps = {
  companyId?: string,
}

export async function findCatalog(params: CatalogProps): Promise<Catalog[]> {
  const response = await axios<Catalog[]>('/api/catalog', { params })

  return response.data
}