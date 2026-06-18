import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, useTheme, Portal, Dialog, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/EmptyState';
import { Product } from '../../types';

export default function ProductListScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'product' | 'service'>('all');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = state.products;
    if (filter !== 'all') list = list.filter((p) => p.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.hsnCode.includes(q));
    }
    return list;
  }, [state.products, search, filter]);

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
    setDeleteDialog(null);
  };

  const stockColor = (p: Product) => {
    if (p.type === 'service') return '#0891B2';
    if (p.stockQuantity <= 0) return '#EF4444';
    if (p.stockQuantity <= p.minStockAlert) return '#F59E0B';
    return '#10B981';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <View style={styles.chips}>
        {(['all', 'product', 'service'] as const).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={styles.chip}
            compact
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.type === 'service' ? '#ECFEFF' : '#F0FDFA' }]}>
              <Ionicons
                name={item.type === 'service' ? 'construct-outline' : 'cube-outline'}
                size={22}
                color={item.type === 'service' ? '#0891B2' : '#0D9488'}
              />
            </View>
            <View style={styles.details}>
              <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.name}</Text>
              <Text style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>
                HSN: {item.hsnCode || '—'}  •  GST: {item.gstPercentage}%  •  ₹{item.unitPrice}/{item.unit || 'unit'}
              </Text>
              {item.type === 'product' && (
                <View style={styles.stockRow}>
                  <View style={[styles.stockDot, { backgroundColor: stockColor(item) }]} />
                  <Text style={[styles.stockText, { color: stockColor(item) }]}>
                    Stock: {item.stockQuantity} {item.unit || 'units'}
                    {item.stockQuantity <= item.minStockAlert && item.minStockAlert > 0 ? '  ⚠ Low' : ''}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => navigation.navigate('AddProduct', { product: item })} style={styles.actionBtn}>
                <Ionicons name="pencil-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteDialog(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState title="No Products Yet" message="Add products and services to your catalog" icon="cube-outline" />
        }
      />

      <Portal>
        <Dialog visible={!!deleteDialog} onDismiss={() => setDeleteDialog(null)}>
          <Dialog.Title>Delete Product</Dialog.Title>
          <Dialog.Content><Text>Are you sure? This will not affect existing invoices.</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog(null)}>Cancel</Button>
            <Button onPress={() => deleteDialog && handleDelete(deleteDialog)} textColor="#EF4444">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color="white"
        onPress={() => navigation.navigate('AddProduct')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: Spacing.lg, elevation: 0 },
  chips: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { borderRadius: BorderRadius.round },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  emptyList: { flex: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, ...Shadow.sm,
  },
  iconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  details: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 2 },
  sub: { fontSize: FontSize.sm, marginBottom: 3 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontSize: FontSize.sm, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg, borderRadius: 16 },
});
