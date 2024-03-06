import { CatalogCategory } from "@prisma/client";
import axios from "axios";

type UpdateCategoriesOrderProps = {
  companyId?: string,
  categories: Pick<CatalogCategory, 'id' | 'order'>[]
}

export const updateCategoriesOrder = (params: UpdateCategoriesOrderProps) =>
  axios.patch('/api/catalog/category', params);
