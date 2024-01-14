import { UnitOfMeasurement } from "@prisma/client";

export const unitsOfMeasurement = [
  {
    label: 'Unidade (UNID)',
    value: UnitOfMeasurement.UNIT,
  },
  {
    label: 'Grama (g)',
    value: UnitOfMeasurement.GRAM,
  },
  {
    label: 'Unidade (mg)',
    value: UnitOfMeasurement.MILLIGRAM,
  },
  {
    label: 'Unidade (kg)',
    value: UnitOfMeasurement.KILOGRAM,
  },
  {
    label: 'Mililitro (ml)',
    value: UnitOfMeasurement.MILLILITER,
  },
  {
    label: 'Litro (l)',
    value: UnitOfMeasurement.LITER,
  },
]