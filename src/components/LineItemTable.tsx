import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants';
import { LineItem, CalculatedLineItem } from '../types';
import { calculateLineItem, formatCurrency } from '../utils';

interface LineItemTableProps {
  items: LineItem[];
}

export function LineItemTable({ items }: LineItemTableProps) {
  const theme = useTheme();
  const calculatedItems = items.map(calculateLineItem);

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          No items added
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.headerRow, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.headerCell, styles.cellItem, { color: theme.colors.primary }]}>Item</Text>
        <Text style={[styles.headerCell, styles.cellQty, { color: theme.colors.primary }]}>Qty</Text>
        <Text style={[styles.headerCell, styles.cellRate, { color: theme.colors.primary }]}>Rate</Text>
        <Text style={[styles.headerCell, styles.cellTotal, { color: theme.colors.primary }]}>Total</Text>
      </View>
      {calculatedItems.map((item) => (
        <View key={item.id} style={[styles.dataRow, { borderBottomColor: theme.colors.outline }]}>
          <View style={styles.cellItem}>
            <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>{item.itemName}</Text>
            {item.description ? (
              <Text style={[styles.itemDesc, { color: theme.colors.onSurfaceVariant }]}>
                {item.description}
              </Text>
            ) : null}
            <Text style={[styles.itemTax, { color: theme.colors.onSurfaceVariant }]}>
              GST {item.gstPercentage}% | Disc {item.discountPercentage}%
            </Text>
          </View>
          <Text style={[styles.cellQty, styles.cellText, { color: theme.colors.onSurface }]}>
            {item.quantity}
          </Text>
          <Text style={[styles.cellRate, styles.cellText, { color: theme.colors.onSurface }]}>
            {formatCurrency(item.unitPrice)}
          </Text>
          <Text style={[styles.cellTotal, styles.cellText, styles.totalText, { color: theme.colors.onSurface }]}>
            {formatCurrency(item.total)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  headerCell: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cellItem: {
    flex: 2,
  },
  cellQty: {
    flex: 0.7,
    textAlign: 'center',
  },
  cellRate: {
    flex: 1,
    textAlign: 'right',
  },
  cellTotal: {
    flex: 1,
    textAlign: 'right',
  },
  cellText: {
    fontSize: FontSize.md,
  },
  totalText: {
    fontWeight: '600',
  },
  itemName: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  itemDesc: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  itemTax: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
