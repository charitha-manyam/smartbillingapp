import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, FAB, useTheme } from 'react-native-paper';
import { Spacing } from '../../constants';
import { useApp } from '../../context/AppContext';
import { DocumentCard } from '../../components/DocumentCard';
import { EmptyState } from '../../components/EmptyState';

export default function DebitNoteListScreen({ navigation }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return state.debitNotes;
    const q = search.toLowerCase();
    return state.debitNotes.filter(
      (doc) =>
        doc.debitNoteNumber.toLowerCase().includes(q) ||
        doc.vendorName.toLowerCase().includes(q)
    );
  }, [state.debitNotes, search]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search debit notes..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            documentNumber={item.debitNoteNumber}
            customerName={item.vendorName}
            date={item.date}
            amount={item.amount}
            status={item.status}
            type="debit"
            onPress={() => navigation.navigate('DebitNoteDetail', { debitNoteId: item.id })}
          />
        )}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState title="No Debit Notes Yet" message="Create your first debit note" icon="add-circle-outline" />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('CreateDebitNote')}
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
