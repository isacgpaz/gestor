import { CatalogCategory } from "@prisma/client";
import axios from "axios";

export const createCategory = (params: { companyId?: string, name: string }) =>
  axios.post<CatalogCategory>('/api/catalog/category', params);
