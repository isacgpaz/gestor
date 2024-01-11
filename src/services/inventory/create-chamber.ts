import { Chamber } from "@prisma/client";
import axios from "axios";

export const createChamber = (params: { companyId?: string, name: string }) =>
  axios.post<Chamber>('/api/inventory/chamber', params);
