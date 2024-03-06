import { CreateProduct } from "@/types/catalog";
import { Product } from "@prisma/client";
import axios from "axios";

export const createProduct = (params: Partial<CreateProduct>) =>
  axios.post<Product>('/api/catalog/product', params);
