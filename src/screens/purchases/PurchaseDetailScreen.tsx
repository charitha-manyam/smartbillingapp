import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Spacing, FontSize } from '../../constants';
import { useApp } from '../../context/AppContext';
import { LineItemTable } from '../../components/LineItemTable';
import { CalculationSummary } from '../../components/CalculationSummary';
import { DocumentActions } from '../../components/DocumentActions';
import { formatDate } from '../../utils';

export default function PurchaseDetailScreen({ route }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const purchase = state.purchases.find((p) => p.id === route.params.purchaseId);

  if (!purchase) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Purchase not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.secondary }]}>
        <Text style={styles.docNumber}>{purchase.billNumber}</Text>
        <Text style={styles.docDate}>Date: {formatDate(purchase.date)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={styles.statusText}>{purchase.status.toUpperCase()}</Text>
        </View>
      </View>

      <DocumentActions
        actions={[
          { icon: 'print', label: 'Print', onPress: () => {} },
          { icon: 'share', label: 'Share', onPress: () => {} },
          { icon: 'download', label: 'PDF', onPress: () => {} },
        ]}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Vendor</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{purchase.vendorName}</Text>
        {purchase.vendorGstNumber ? (
          <Text style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>GST: {purchase.vendorGstNumber}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Items</Text>
        <LineItemTable items={purchase.lineItems} />
      </View>

      <View style={styles.section}>
        <CalculationSummary lineItems={purchase.lineItems} />
      </View>

      {purchase.notes ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Notes</Text>
          <Text style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>{purchase.notes}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { padding: Spacing.xl, alignItems: 'center' },
  docNumber: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: Spacing.xs },
  docDate: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.md },
  statusBadge: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: 20 },
  statusText: { color: 'white', fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 1 },
  section: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  value: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: Spacing.xs },
  detail: { fontSize: FontSize.md },
});
