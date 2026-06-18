import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, FAB, useTheme } from 'react-native-paper';
import { Spacing } from '../../constants';
import { useApp } from '../../context/AppContext';
import { DocumentCard } from '../../components/DocumentCard';
import { EmptyState } from '../../components/EmptyState';
import { formatCurrency } from '../../utils';

export default function CreditNoteListScreen({ navigation }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return state.creditNotes;
    const q = search.toLowerCase();
    return state.creditNotes.filter(
      (doc) =>
        doc.creditNoteNumber.toLowerCase().includes(q) ||
        doc.customerName.toLowerCase().includes(q)
    );
  }, [state.creditNotes, search]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search credit notes..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            documentNumber={item.creditNoteNumber}
            customerName={item.customerName}
            date={item.date}
            amount={item.amount}
            status={item.status}
            type="credit"
            onPress={() => navigation.navigate('CreditNoteDetail', { creditNoteId: item.id })}
          />
        )}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState title="No Credit Notes Yet" message="Create your first credit note" icon="remove-circle-outline" />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('CreateCreditNote')}
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
