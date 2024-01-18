import { CatalogVariant } from "@prisma/client";
import axios from "axios";

type CreateVariantProps = {
  name: string;
  properties: string[],
  companyId?: string,
}

export const createVariant = (params: CreateVariantProps) =>
  axios.post<CatalogVariant>('/api/catalog/variant', params);
