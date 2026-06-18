import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, useTheme, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { useApp } from '../../context/AppContext';
import { DocumentCard } from '../../components/DocumentCard';
import { EmptyState } from '../../components/EmptyState';

export default function SalesHubScreen({ navigation }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('quotations');

  const quotations = state.quotations;
  const invoices = state.invoices;

  const filteredQuotations = useMemo(() => {
    if (!search.trim()) return quotations;
    const q = search.toLowerCase();
    return quotations.filter(
      (doc) =>
        doc.quotationNumber.toLowerCase().includes(q) ||
        doc.customerName.toLowerCase().includes(q)
    );
  }, [quotations, search]);

  const filteredInvoices = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(
      (doc) =>
        doc.invoiceNumber.toLowerCase().includes(q) ||
        doc.customerName.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const data = activeTab === 'quotations' ? filteredQuotations : filteredInvoices;
  const isEmpty = data.length === 0;
  const emptyIcon = activeTab === 'quotations' ? 'document-text-outline' : 'receipt-outline';
  const emptyTitle = activeTab === 'quotations' ? 'No Quotations Yet' : 'No Invoices Yet';
  const emptyMessage = activeTab === 'quotations' ? 'Create your first quotation' : 'Create your first invoice';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'quotations', label: 'Quotations', icon: 'document-text' },
            { value: 'invoices', label: 'Invoices', icon: 'receipt' },
          ]}
          style={styles.segment}
        />
      </View>

      <Searchbar
        placeholder={`Search ${activeTab}...`}
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={data as any[]}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => {
          const isQ = activeTab === 'quotations';
          return (
            <DocumentCard
              documentNumber={isQ ? item.quotationNumber : item.invoiceNumber}
              customerName={item.customerName}
              date={isQ ? item.date : item.invoiceDate}
              amount={item.lineItems?.reduce((s: number, li: any) => s + li.quantity * li.unitPrice, 0) || item.amount || 0}
              status={item.status}
              type={isQ ? 'quotation' : 'invoice'}
              onPress={() =>
                navigation.navigate(
                  isQ ? 'QuotationDetail' : 'InvoiceDetail',
                  { [isQ ? 'quotationId' : 'invoiceId']: item.id }
                )
              }
            />
          );
        }}
        contentContainerStyle={[styles.list, isEmpty && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState title={emptyTitle} message={emptyMessage} icon={emptyIcon as any} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() =>
          navigation.navigate(activeTab === 'quotations' ? 'CreateQuotation' : 'CreateInvoice')
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segmentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  segment: {
    borderRadius: BorderRadius.md,
  },
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
