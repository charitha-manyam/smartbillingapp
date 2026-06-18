import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, useTheme, Portal, Dialog, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/EmptyState';
import { getInitials } from '../../utils';

export default function VendorListScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    if (!search.trim()) return state.vendors;
    const q = search.toLowerCase();
    return state.vendors.filter(
      (v) =>
        v.vendorName.toLowerCase().includes(q) ||
        v.mobileNumber.includes(q) ||
        v.email.toLowerCase().includes(q)
    );
  }, [state.vendors, search]);

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_VENDOR', payload: id });
    setDeleteDialog(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search vendors..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('VendorDetail', { vendorId: item.id })}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {getInitials(item.vendorName)}
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.vendorName}</Text>
              <Text style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>{item.mobileNumber}</Text>
              {item.gstNumber ? (
                <Text style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>GST: {item.gstNumber}</Text>
              ) : null}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => navigation.navigate('AddVendor', { vendor: item })} style={styles.actionBtn}>
                <Ionicons name="pencil-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteDialog(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.list, filteredVendors.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState
            title="No Vendors Yet"
            message="Add your first vendor to get started"
            icon="business-outline"
          />
        }
      />

      <Portal>
        <Dialog visible={!!deleteDialog} onDismiss={() => setDeleteDialog(null)}>
          <Dialog.Title>Delete Vendor</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this vendor?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog(null)}>Cancel</Button>
            <Button onPress={() => deleteDialog && handleDelete(deleteDialog)} textColor="#EF4444">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('AddVendor')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: Spacing.lg, elevation: 0 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  emptyList: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '700' },
  details: { flex: 1 },
  name: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: 2 },
  sub: { fontSize: FontSize.sm, marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },
  fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg, borderRadius: 16 },
});
