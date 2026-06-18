import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, FAB, Chip, Portal, Dialog } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { StockTransaction } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { formatDate } from '../../utils';

type TabType = 'overview' | 'history';

export default function InventoryScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<TabType>('overview');
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [txType, setTxType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const products = state.products.filter((p) => p.type === 'product');
  const allTxns = [...state.stockTransactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert);
  const outOfStock = products.filter((p) => p.stockQuantity <= 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedProductId) e.product = 'Select a product';
    if (!qty || isNaN(Number(qty)) || Number(qty) <= 0) e.qty = 'Enter valid quantity';
    if (!reason.trim()) e.reason = 'Enter a reason';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRecord = () => {
    if (!validate()) return;
    const product = state.products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const quantity = Number(qty);
    const balanceAfter =
      txType === 'in' ? product.stockQuantity + quantity
      : txType === 'out' ? product.stockQuantity - quantity
      : quantity;

    const txn: StockTransaction = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type: txType,
      quantity,
      balanceAfter,
      reason: reason.trim(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_STOCK_TRANSACTION', payload: txn });

    const updated = { ...product, stockQuantity: balanceAfter };
    dispatch({ type: 'UPDATE_PRODUCT', payload: updated });

    setShowModal(false);
    setSelectedProductId('');
    setQty('');
    setReason('');
    setErrors({});
  };

  const txTypeColor = (t: 'in' | 'out' | 'adjustment') =>
    t === 'in' ? '#10B981' : t === 'out' ? '#EF4444' : '#F59E0B';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.surface }]}>
        {(['overview', 'history'] as TabType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'overview' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.summaryNum, { color: '#10B981' }]}>{products.length}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Total Items</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.summaryNum, { color: '#F59E0B' }]}>{lowStock.length}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Low Stock</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.summaryNum, { color: '#EF4444' }]}>{outOfStock.length}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Out of Stock</Text>
            </View>
          </View>

          {/* All products stock levels */}
          {products.length === 0 ? (
            <EmptyState title="No Products" message="Add products to start tracking inventory" icon="cube-outline" />
          ) : (
            products.map((p) => {
              const color = p.stockQuantity <= 0 ? '#EF4444' : p.stockQuantity <= p.minStockAlert ? '#F59E0B' : '#10B981';
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
                  onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                >
                  <View style={[styles.colorBar, { backgroundColor: color }]} />
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: theme.colors.onSurface }]}>{p.name}</Text>
                    <Text style={[styles.productSub, { color: theme.colors.onSurfaceVariant }]}>
                      HSN: {p.hsnCode || '—'}  •  Alert at {p.minStockAlert} {p.unit}
                    </Text>
                  </View>
                  <View style={styles.stockRight}>
                    <Text style={[styles.stockQty, { color }]}>{p.stockQuantity}</Text>
                    <Text style={[styles.stockUnit, { color: theme.colors.onSurfaceVariant }]}>{p.unit}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={allTxns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.scroll, allTxns.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <EmptyState title="No Transactions" message="Record stock in / out to see history" icon="swap-horizontal-outline" />
          }
          renderItem={({ item }) => (
            <View style={[styles.txCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.txIcon, { backgroundColor: item.type === 'in' ? '#DCFCE7' : item.type === 'out' ? '#FEE2E2' : '#FEF3C7' }]}>
                <Ionicons
                  name={item.type === 'in' ? 'arrow-down-circle' : item.type === 'out' ? 'arrow-up-circle' : 'swap-horizontal'}
                  size={22}
                  color={txTypeColor(item.type)}
                />
              </View>
              <View style={styles.txBody}>
                <Text style={[styles.txProduct, { color: theme.colors.onSurface }]}>{item.productName}</Text>
                <Text style={[styles.txReason, { color: theme.colors.onSurfaceVariant }]}>{item.reason}</Text>
                <Text style={[styles.txDate, { color: theme.colors.onSurfaceVariant }]}>{formatDate(item.date)}</Text>
              </View>
              <View style={styles.txMeta}>
                <Text style={[styles.txQty, { color: txTypeColor(item.type) }]}>
                  {item.type === 'in' ? '+' : item.type === 'out' ? '-' : '~'}{item.quantity}
                </Text>
                <Text style={[styles.txBalance, { color: theme.colors.onSurfaceVariant }]}>Bal: {item.balanceAfter}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Stock Entry Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Record Stock</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Transaction Type */}
              <View style={styles.typeRow}>
                {(['in', 'out', 'adjustment'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, txType === t && { backgroundColor: txTypeColor(t) }]}
                    onPress={() => setTxType(t)}
                  >
                    <Text style={[styles.typeBtnText, { color: txType === t ? '#fff' : theme.colors.onSurfaceVariant }]}>
                      {t === 'in' ? 'Stock In' : t === 'out' ? 'Stock Out' : 'Adjust'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Product Picker */}
              <Text style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>Select Product *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productChips}>
                {products.map((p) => (
                  <Chip
                    key={p.id}
                    selected={selectedProductId === p.id}
                    onPress={() => setSelectedProductId(p.id)}
                    style={styles.prodChip}
                    compact
                  >
                    {p.name} ({p.stockQuantity})
                  </Chip>
                ))}
              </ScrollView>
              {errors.product && <Text style={[styles.error, { color: theme.colors.error }]}>{errors.product}</Text>}

              <TextInput
                label="Quantity *"
                value={qty}
                onChangeText={setQty}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.qty}
              />
              {errors.qty && <Text style={[styles.error, { color: theme.colors.error }]}>{errors.qty}</Text>}

              <TextInput
                label="Reason / Note *"
                value={reason}
                onChangeText={setReason}
                mode="outlined"
                style={styles.input}
                placeholder="e.g. Purchase from supplier, Sold to customer, Damaged goods"
                error={!!errors.reason}
              />
              {errors.reason && <Text style={[styles.error, { color: theme.colors.error }]}>{errors.reason}</Text>}

              {selectedProductId && qty && !isNaN(Number(qty)) && Number(qty) > 0 && (
                <View style={[styles.previewBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                  {(() => {
                    const p = products.find((p) => p.id === selectedProductId);
                    if (!p) return null;
                    const newBal = txType === 'in' ? p.stockQuantity + Number(qty)
                      : txType === 'out' ? p.stockQuantity - Number(qty)
                      : Number(qty);
                    return (
                      <Text style={[styles.previewText, { color: theme.colors.onSurface }]}>
                        {p.name}: {p.stockQuantity} {txType === 'in' ? '+' : txType === 'out' ? '-' : '→'} {qty} = {newBal} {p.unit}
                      </Text>
                    );
                  })()}
                </View>
              )}

              <Button mode="contained" onPress={handleRecord} style={styles.saveBtn}>
                Record
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => setShowModal(true)}
        label="Record Stock"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', elevation: 2 },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabText: { fontSize: FontSize.md, fontWeight: '600' },
  scroll: { padding: Spacing.lg, paddingBottom: 120 },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  summaryCard: { flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', ...Shadow.sm },
  summaryNum: { fontSize: 28, fontWeight: '800' },
  summaryLabel: { fontSize: FontSize.xs, textAlign: 'center', marginTop: 2 },
  productCard: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm },
  colorBar: { width: 5, alignSelf: 'stretch' },
  productInfo: { flex: 1, padding: Spacing.lg },
  productName: { fontSize: FontSize.md, fontWeight: '600' },
  productSub: { fontSize: FontSize.sm, marginTop: 2 },
  stockRight: { alignItems: 'flex-end', paddingRight: Spacing.lg },
  stockQty: { fontSize: 22, fontWeight: '800' },
  stockUnit: { fontSize: FontSize.xs },
  txCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, ...Shadow.sm },
  txIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  txBody: { flex: 1 },
  txProduct: { fontSize: FontSize.md, fontWeight: '600' },
  txReason: { fontSize: FontSize.sm, marginTop: 2 },
  txDate: { fontSize: FontSize.xs, marginTop: 2 },
  txMeta: { alignItems: 'flex-end' },
  txQty: { fontSize: FontSize.lg, fontWeight: '800' },
  txBalance: { fontSize: FontSize.xs, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  typeBtn: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', backgroundColor: '#F3F4F6' },
  typeBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  productChips: { marginBottom: Spacing.md },
  prodChip: { marginRight: Spacing.sm, borderRadius: BorderRadius.round },
  input: { marginBottom: Spacing.sm },
  error: { fontSize: FontSize.sm, marginTop: -Spacing.sm, marginBottom: Spacing.sm },
  previewBox: { padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  previewText: { fontSize: FontSize.sm, fontWeight: '600' },
  saveBtn: { marginTop: Spacing.sm, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, marginBottom: Spacing.xxl },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg, borderRadius: 16 },
});
