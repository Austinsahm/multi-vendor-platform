export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG').format(amount)
  }