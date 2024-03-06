import { CatalogCategory } from "@prisma/client";
import axios from "axios";

export const updateCategory = ({ id, ...params }: Partial<CatalogCategory>) =>
  axios.put<CatalogCategory>(`/api/catalog/category/${id}`, params);
