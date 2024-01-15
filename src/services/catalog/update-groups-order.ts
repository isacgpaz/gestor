import { CatalogGroup } from "@prisma/client";
import axios from "axios";

type UpdateGroupsOrderProps = {
  companyId?: string,
  groups: Pick<CatalogGroup, 'id' | 'order'>[]
}

export const updateGroupsOrder = (params: UpdateGroupsOrderProps) =>
  axios.patch('/api/catalog/group', params);
