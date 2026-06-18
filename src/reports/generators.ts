// Report generation utilities
// This module can be extended to generate CSV/Excel reports
// for each document type with date range filtering.

export interface ReportData {
  type: string;
  generatedAt: string;
  filter: string;
  totalCount: number;
  totalAmount: number;
  items: any[];
}

export function generateReportData(
  type: string,
  items: any[],
  filterLabel: string
): ReportData {
  const totalAmount = items.reduce((sum: number, item: any) => {
    if (item.lineItems) {
      return sum + item.lineItems.reduce((s: number, li: any) => s + li.quantity * li.unitPrice, 0);
    }
    return sum + (item.amount || 0);
  }, 0);

  return {
    type,
    generatedAt: new Date().toISOString(),
    filter: filterLabel,
    totalCount: items.length,
    totalAmount,
    items,
  };
}
