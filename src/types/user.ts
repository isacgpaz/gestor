import { $Enums, Company } from "@prisma/client";

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: $Enums.UserRole;
  company: Company,
  createdAt: Date;
  updatedAt: Date;
}