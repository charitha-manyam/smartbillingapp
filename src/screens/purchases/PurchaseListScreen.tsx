import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, FAB, useTheme } from 'react-native-paper';
import { Spacing } from '../../constants';
import { useApp } from '../../context/AppContext';
import { DocumentCard } from '../../components/DocumentCard';
import { EmptyState } from '../../components/EmptyState';

export default function PurchaseListScreen({ navigation }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return state.purchases;
    const q = search.toLowerCase();
    return state.purchases.filter(
      (doc) =>
        doc.billNumber.toLowerCase().includes(q) ||
        doc.vendorName.toLowerCase().includes(q)
    );
  }, [state.purchases, search]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search purchases..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            documentNumber={item.billNumber}
            customerName={item.vendorName}
            date={item.date}
            amount={item.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0)}
            status={item.status}
            type="purchase"
            onPress={() => navigation.navigate('PurchaseDetail', { purchaseId: item.id })}
          />
        )}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState title="No Purchases Yet" message="Record your first purchase" icon="cart-outline" />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('CreatePurchase')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: Spacing.lg, elevation: 0 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  emptyList: { flex: 1 },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    borderRadius: 16,
  },
});
