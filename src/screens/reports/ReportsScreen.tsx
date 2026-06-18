import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { FilterModal } from '../../components/FilterModal';
import { formatCurrency, formatDate } from '../../utils';
import { ReportFilter } from '../../types';

export default function ReportsScreen() {
  const theme = useTheme();
  const { state } = useApp();
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReportFilter>({ type: 'monthly' });

  const { quotations, invoices, purchases, creditNotes, debitNotes } = state;

  const filteredData = useMemo(() => {
    const now = new Date();
    let start: Date;

    switch (activeFilter.type) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        start = activeFilter.startDate ? new Date(activeFilter.startDate) : new Date(0);
        break;
      default:
        start = new Date(0);
    }

    const end = activeFilter.endDate ? new Date(activeFilter.endDate) : now;
    const filter = (dateStr: string) => {
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    return {
      quotations: quotations.filter((q) => filter(q.date)),
      invoices: invoices.filter((inv) => filter(inv.invoiceDate)),
      purchases: purchases.filter((p) => filter(p.date)),
      creditNotes: creditNotes.filter((cn) => filter(cn.date)),
      debitNotes: debitNotes.filter((dn) => filter(dn.date)),
    };
  }, [activeFilter, quotations, invoices, purchases, creditNotes, debitNotes]);

  const totals = useMemo(() => {
    const calcTotal = (items: { lineItems?: { quantity: number; unitPrice: number }[]; amount?: number }[]) =>
      items.reduce((sum, item) => {
        if ('lineItems' in item && item.lineItems) {
          return sum + item.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
        }
        return sum + (item.amount || 0);
      }, 0);

    return {
      quotationTotal: calcTotal(filteredData.quotations),
      invoiceTotal: calcTotal(filteredData.invoices),
      purchaseTotal: calcTotal(filteredData.purchases),
      creditTotal: calcTotal(filteredData.creditNotes),
      debitTotal: calcTotal(filteredData.debitNotes),
    };
  }, [filteredData]);

  const reportCards = [
    { title: 'Quotations', count: filteredData.quotations.length, total: totals.quotationTotal, color: '#3B82F6' },
    { title: 'Invoices', count: filteredData.invoices.length, total: totals.invoiceTotal, color: '#10B981' },
    { title: 'Purchases', count: filteredData.purchases.length, total: totals.purchaseTotal, color: '#8B5CF6' },
    { title: 'Credit Notes', count: filteredData.creditNotes.length, total: totals.creditTotal, color: '#F59E0B' },
    { title: 'Debit Notes', count: filteredData.debitNotes.length, total: totals.debitTotal, color: '#EF4444' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterBar}>
        <Button
          icon="calendar"
          mode="outlined"
          onPress={() => setFilterVisible(true)}
          style={styles.filterBtn}
        >
          {activeFilter.type.charAt(0).toUpperCase() + activeFilter.type.slice(1)}
        </Button>
      </View>

      <View style={styles.summaryGrid}>
        {reportCards.map((card, index) => (
          <View key={index} style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.dot, { backgroundColor: card.color }]} />
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{card.title}</Text>
            </View>
            <Text style={[styles.cardCount, { color: card.color }]}>{card.count}</Text>
            <Text style={[styles.cardTotal, { color: theme.colors.onSurfaceVariant }]}>
              Total: {formatCurrency(card.total)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.totalTitle, { color: theme.colors.onSurface }]}>Period Summary</Text>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Quotations</Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {filteredData.quotations.length} | {formatCurrency(totals.quotationTotal)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Invoices</Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {filteredData.invoices.length} | {formatCurrency(totals.invoiceTotal)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Purchases</Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {filteredData.purchases.length} | {formatCurrency(totals.purchaseTotal)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Credit Notes</Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {filteredData.creditNotes.length} | {formatCurrency(totals.creditTotal)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Debit Notes</Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {filteredData.debitNotes.length} | {formatCurrency(totals.debitTotal)}
          </Text>
        </View>
      </View>

      <FilterModal
        visible={filterVisible}
        onDismiss={() => setFilterVisible(false)}
        onApply={(filter) => setActiveFilter(filter)}
        currentFilter={activeFilter}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: {
    padding: Spacing.lg,
    flexDirection: 'row',
  },
  filterBtn: {
    flex: 1,
  },
  summaryGrid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  reportCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  cardCount: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  cardTotal: {
    fontSize: FontSize.md,
  },
  totalCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  totalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.md,
  },
  totalValue: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
});
