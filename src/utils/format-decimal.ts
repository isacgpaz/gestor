export function formatDecimal(value: number): string {
  const formatter = new Intl.NumberFormat('pt-BR');

  return formatter.format(value);
}