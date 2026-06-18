import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../utils';

interface DocumentCardProps {
  documentNumber: string;
  customerName: string;
  date: string;
  amount: number;
  status: string;
  type: 'quotation' | 'invoice' | 'purchase' | 'credit' | 'debit';
  onPress?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export function DocumentCard({
  documentNumber,
  customerName,
  date,
  amount,
  status,
  type,
  onPress,
  onShare,
  onPrint,
}: DocumentCardProps) {
  const theme = useTheme();
  const statusColor = getStatusColor(status);

  const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
    quotation: 'document-text-outline',
    invoice: 'receipt-outline',
    purchase: 'cart-outline',
    credit: 'remove-circle-outline',
    debit: 'add-circle-outline',
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.numberRow}>
          <Ionicons name={typeIcon[type]} size={18} color={theme.colors.primary} />
          <Text style={[styles.number, { color: theme.colors.onSurface }]}>
            {documentNumber}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(status)}
          </Text>
        </View>
      </View>

      <Text style={[styles.customer, { color: theme.colors.onSurfaceVariant }]}>
        {customerName}
      </Text>

      <View style={styles.footer}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            {formatDate(date)}
          </Text>
        </View>
        <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
          {formatCurrency(amount)}
        </Text>
      </View>

      {(onShare || onPrint) && (
        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
      )}
      {(onShare || onPrint) && (
        <View style={styles.actions}>
          {onShare && (
            <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Share</Text>
            </TouchableOpacity>
          )}
          {onPrint && (
            <TouchableOpacity onPress={onPrint} style={styles.actionBtn}>
              <Ionicons name="print-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Print</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  number: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  customer: {
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  date: {
    fontSize: FontSize.sm,
  },
  amount: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
