import { Product } from "@prisma/client";
import axios from "axios";

export const updateProduct = ({ id, ...params }: Partial<Product>) =>
  axios.put<Product>(`/api/catalog/product/${id}`, params);
