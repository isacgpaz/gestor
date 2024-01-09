export function formatWeight(weight: number): string {
  const weightFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'unit',
    unit: 'kilogram',
    unitDisplay: 'narrow'
  });

  return weightFormatter.format(weight);
}