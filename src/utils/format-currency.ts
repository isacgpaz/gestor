export function formatCurrency(value: number): string {
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return currencyFormatter.format(value);
}
