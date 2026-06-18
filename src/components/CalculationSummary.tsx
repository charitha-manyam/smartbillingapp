import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants';
import { calculateTotals } from '../utils';
import { LineItem } from '../types';
import { formatCurrency } from '../utils';

interface CalculationSummaryProps {
  lineItems: LineItem[];
}

export function CalculationSummary({ lineItems }: CalculationSummaryProps) {
  const theme = useTheme();
  const { subtotal, totalDiscount, totalGst, grandTotal } = calculateTotals(lineItems);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Subtotal</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>
          {formatCurrency(subtotal)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Discount ({lineItems.reduce((s, i) => s + i.discountPercentage, 0) > 0 ? 'incl.' : '0%'})
        </Text>
        <Text style={[styles.value, { color: '#EF4444' }]}>
          -{formatCurrency(totalDiscount)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>GST</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>
          {formatCurrency(totalGst)}
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Grand Total</Text>
        <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
          {formatCurrency(grandTotal)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
  },
  value: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
});
