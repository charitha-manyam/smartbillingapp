import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, useTheme, Portal, Dialog, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize } from '../../constants';
import { useApp } from '../../context/AppContext';
import { CustomerCard } from '../../components/CustomerCard';
import { EmptyState } from '../../components/EmptyState';

export default function CustomerListScreen({ navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return state.customers;
    const q = search.toLowerCase();
    return state.customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [state.customers, search]);

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    setDeleteDialog(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search customers..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerCard
            name={item.customerName}
            phone={item.mobileNumber}
            email={item.email}
            gstNumber={item.gstNumber}
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
            onEdit={() => navigation.navigate('AddCustomer', { customer: item })}
            onDelete={() => setDeleteDialog(item.id)}
          />
        )}
        contentContainerStyle={[styles.list, filteredCustomers.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState
            title="No Customers Yet"
            message="Add your first customer to get started"
            icon="people-outline"
          />
        }
      />

      <Portal>
        <Dialog visible={!!deleteDialog} onDismiss={() => setDeleteDialog(null)}>
          <Dialog.Title>Delete Customer</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this customer?</Text>
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
        onPress={() => navigation.navigate('AddCustomer')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: Spacing.lg,
    elevation: 0,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    borderRadius: 16,
  },
});
