import { UnitOfMeasurement } from "@prisma/client";

export const unitsOfMeasurement = {
  UNIT: UnitOfMeasurement.UNIT,
  GRAM: UnitOfMeasurement.GRAM,
  MILLIGRAM: UnitOfMeasurement.MILLIGRAM,
  KILOGRAM: UnitOfMeasurement.KILOGRAM,
  MILLILITER: UnitOfMeasurement.MILLILITER,
  LITER: UnitOfMeasurement.LITER
}

export const translatedUnitsOfMeasurement = {
  UNIT: 'Unidade',
  GRAM: 'Grama',
  MILLIGRAM: 'Miligrama',
  KILOGRAM: 'Quilograma',
  MILLILITER: 'Mililitro',
  LITER: 'Litro',
}

export const translatedShortUnitsOfMeasurement = {
  UNIT: 'unid',
  GRAM: 'g',
  MILLIGRAM: 'mg',
  KILOGRAM: 'kg',
  MILLILITER: 'ml',
  LITER: 'l',
}