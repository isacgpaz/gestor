import { Company, User } from "@prisma/client";

export type Wallet = {
  id: string;
  points: number;
  companyId: string;
  company: Company
  customerId: string;
  customer: User,
  createdAt: string;
  updatedAt: string;
}