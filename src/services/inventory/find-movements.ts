import { MovementWithItemAndUser } from "@/types/inventory"
import { MovementType } from "@prisma/client"
import axios from "axios"

type MovementsProps = {
  date: string,
  companyId?: string,
  page?: number,
  type?: MovementType,
  search?: string,
}

type MovementsResponseProps = {
  result: MovementWithItemAndUser[],
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}

export async function findMovements(params: MovementsProps) {
  const response = await axios<MovementsResponseProps>('/api/inventory/movement', { params })

  return response.data
}