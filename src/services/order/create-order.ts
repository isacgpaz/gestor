import { CreateOrder } from "@/types/order";
import { Order } from "@prisma/client";
import axios from "axios";

export const createOrder = (params: Partial<CreateOrder>) =>
  axios.post<Order>('/api/order/external', params);
