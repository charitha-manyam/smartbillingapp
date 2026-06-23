import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, FAB, useTheme } from 'react-native-paper';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Spacing } from '../../constants';
import { useApp } from '../../context/AppContext';
import { DocumentCard } from '../../components/DocumentCard';
import { EmptyState } from '../../components/EmptyState';

const BANNER_ID = 'ca-app-pub-7848427116394025/5144392331';

export default function InvoiceListScreen({ navigation }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return state.invoices;
    const q = search.toLowerCase();
    return state.invoices.filter(
      (doc) =>
        doc.invoiceNumber.toLowerCase().includes(q) ||
        doc.customerName.toLowerCase().includes(q)
    );
  }, [state.invoices, search]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search invoices..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            documentNumber={item.invoiceNumber}
            customerName={item.customerName}
            date={item.invoiceDate}
            amount={item.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0)}
            status={item.status}
            type="invoice"
            onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
          />
        )}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState
            title="No Invoices Yet"
            message="Create your first invoice"
            icon="receipt-outline"
          />
        }
      />

      <View style={styles.bannerContainer}>
        <BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('CreateInvoice')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: Spacing.lg, elevation: 0 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  emptyList: { flex: 1 },
  bannerContainer: { alignItems: 'center', paddingBottom: Spacing.lg },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    borderRadius: 16,
  },
});
