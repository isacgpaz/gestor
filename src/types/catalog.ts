import { Product } from "@prisma/client";

export type CreateProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>