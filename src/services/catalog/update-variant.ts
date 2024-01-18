import { CatalogVariantWithPropertiesUpdate } from "@/types/catalog";
import { CatalogVariant } from "@prisma/client";
import axios from "axios";

export const updateVariant = ({ id, ...params }: Partial<CatalogVariantWithPropertiesUpdate>) =>
  axios.put<CatalogVariant>(`/api/catalog/variant/${id}`, params);
