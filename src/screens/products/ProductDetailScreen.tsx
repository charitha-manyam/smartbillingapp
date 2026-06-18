import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils';

export default function ProductDetailScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const product = state.products.find((p) => p.id === route.params.productId);

  if (!product) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const txns = state.stockTransactions
    .filter((t) => t.productId === product.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stockColor = product.type === 'service' ? '#0891B2'
    : product.stockQuantity <= 0 ? '#EF4444'
    : product.stockQuantity <= product.minStockAlert ? '#F59E0B'
    : '#10B981';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerIcon}>
          <Ionicons name={product.type === 'service' ? 'construct' : 'cube'} size={32} color="#fff" />
        </View>
        <Text style={styles.headerName}>{product.name}</Text>
        <Text style={styles.headerSub}>{product.type === 'service' ? 'Service' : 'Product'}</Text>
      </View>

      <View style={styles.content}>
        {/* Price & Tax Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Pricing</Text>
          <Row label="Unit Price" value={`₹${product.unitPrice} / ${product.unit}`} theme={theme} />
          <Row label="GST" value={`${product.gstPercentage}%`} theme={theme} />
          <Row label="HSN Code" value={product.hsnCode || '—'} theme={theme} />
          <Row label="Unit" value={product.unit} theme={theme} />
          {product.description ? <Row label="Description" value={product.description} theme={theme} /> : null}
          <Row label="Added On" value={formatDate(product.createdAt)} theme={theme} />
        </View>

        {/* Stock Card (products only) */}
        {product.type === 'product' && (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Stock</Text>
            <View style={styles.stockBig}>
              <Text style={[styles.stockNumber, { color: stockColor }]}>{product.stockQuantity}</Text>
              <Text style={[styles.stockUnit, { color: theme.colors.onSurfaceVariant }]}>{product.unit}</Text>
            </View>
            {product.stockQuantity <= product.minStockAlert && product.minStockAlert > 0 && (
              <View style={[styles.alertBanner, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="warning" size={16} color="#D97706" />
                <Text style={styles.alertText}>Low stock — alert threshold is {product.minStockAlert} {product.unit}</Text>
              </View>
            )}
          </View>
        )}

        {/* Stock Transaction History */}
        {txns.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Stock History</Text>
            {txns.slice(0, 20).map((t) => (
              <View key={t.id} style={[styles.txRow, { borderBottomColor: theme.colors.surfaceVariant }]}>
                <View style={[styles.txIcon, { backgroundColor: t.type === 'in' ? '#DCFCE7' : t.type === 'out' ? '#FEE2E2' : '#FEF3C7' }]}>
                  <Ionicons
                    name={t.type === 'in' ? 'arrow-down' : t.type === 'out' ? 'arrow-up' : 'swap-horizontal'}
                    size={14}
                    color={t.type === 'in' ? '#16A34A' : t.type === 'out' ? '#DC2626' : '#D97706'}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={[styles.txReason, { color: theme.colors.onSurface }]}>{t.reason}</Text>
                  <Text style={[styles.txDate, { color: theme.colors.onSurfaceVariant }]}>{formatDate(t.date)}</Text>
                </View>
                <Text style={[styles.txQty, { color: t.type === 'in' ? '#16A34A' : t.type === 'out' ? '#DC2626' : '#D97706' }]}>
                  {t.type === 'in' ? '+' : t.type === 'out' ? '-' : '~'}{t.quantity}
                </Text>
                <Text style={[styles.txBalance, { color: theme.colors.onSurfaceVariant }]}>={t.balanceAfter}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('AddProduct', { product })}
        >
          <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          <Text style={[styles.editText, { color: theme.colors.primary }]}>Edit Product</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, theme }: any) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.onSurface }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  headerIcon: { marginBottom: Spacing.md },
  headerName: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)' },
  content: { padding: Spacing.lg },
  card: { padding: Spacing.xl, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  rowLabel: { fontSize: FontSize.md },
  rowValue: { fontSize: FontSize.md, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  stockBig: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginBottom: Spacing.md },
  stockNumber: { fontSize: 48, fontWeight: '900' },
  stockUnit: { fontSize: FontSize.lg },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md },
  alertText: { fontSize: FontSize.sm, color: '#D97706', fontWeight: '500' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, gap: Spacing.sm },
  txIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txReason: { fontSize: FontSize.sm, fontWeight: '500' },
  txDate: { fontSize: FontSize.xs },
  txQty: { fontSize: FontSize.md, fontWeight: '700', minWidth: 40, textAlign: 'right' },
  txBalance: { fontSize: FontSize.sm, minWidth: 32, textAlign: 'right' },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: BorderRadius.lg, ...Shadow.sm },
  editText: { fontSize: FontSize.lg, fontWeight: '600' },
});
