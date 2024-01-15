import { CatalogGroup } from "@prisma/client";
import axios from "axios";

export const createGroup = (params: { companyId?: string, name: string }) =>
  axios.post<CatalogGroup>('/api/catalog/group', params);
