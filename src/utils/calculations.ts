import { LineItem, CalculatedLineItem } from '../types';

export function calculateLineItem(item: LineItem): CalculatedLineItem {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = subtotal * (item.discountPercentage / 100);
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = afterDiscount * (item.gstPercentage / 100);
  const total = afterDiscount + gstAmount;

  return {
    ...item,
    subtotal: round(subtotal),
    discountAmount: round(discountAmount),
    gstAmount: round(gstAmount),
    total: round(total),
  };
}

export function calculateTotals(items: LineItem[]) {
  const calculatedItems = items.map(calculateLineItem);
  const subtotal = round(calculatedItems.reduce((sum, item) => sum + item.subtotal, 0));
  const totalDiscount = round(calculatedItems.reduce((sum, item) => sum + item.discountAmount, 0));
  const totalGst = round(calculatedItems.reduce((sum, item) => sum + item.gstAmount, 0));
  const grandTotal = round(calculatedItems.reduce((sum, item) => sum + item.total, 0));

  return { calculatedItems, subtotal, totalDiscount, totalGst, grandTotal };
}

export function round(value: number, decimals: number = 2): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

export function calculateGstBreakdown(items: LineItem[]) {
  const breakdown: Record<number, { taxableValue: number; gstAmount: number }> = {};

  items.forEach((item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discountPercentage / 100);
    const taxableValue = subtotal - discountAmount;
    const gstAmount = taxableValue * (item.gstPercentage / 100);

    if (!breakdown[item.gstPercentage]) {
      breakdown[item.gstPercentage] = { taxableValue: 0, gstAmount: 0 };
    }
    breakdown[item.gstPercentage].taxableValue += taxableValue;
    breakdown[item.gstPercentage].gstAmount += gstAmount;
  });

  return Object.entries(breakdown).map(([gst, values]) => ({
    gstPercentage: Number(gst),
    taxableValue: round(values.taxableValue),
    gstAmount: round(values.gstAmount),
  }));
}
