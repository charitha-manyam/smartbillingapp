import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { useApp } from '../../context/AppContext';
import { DebitNote } from '../../types';
import { generateDocumentNumber, getInitials } from '../../utils';
import { DatePickerModal, formatDisplayDate } from '../../components/DatePickerModal';

export default function CreateDebitNoteScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();

  const [vendorName, setVendorName] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [vendorPickerVisible, setVendorPickerVisible] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');

  const filteredVendors = state.vendors.filter((v) =>
    v.vendorName.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const selectVendor = (vendor: typeof state.vendors[0]) => {
    setVendorName(vendor.vendorName);
    setVendorPickerVisible(false);
    setVendorSearch('');
  };

  const handleSave = () => {
    const note: DebitNote = {
      id: Date.now().toString(),
      debitNoteNumber: generateDocumentNumber('DN', state.debitNotes.length),
      vendorName: vendorName || 'Unknown Vendor',
      date: dateObj.toISOString(),
      reason,
      amount: Number(amount) || 0,
      status: 'issued',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_DEBIT_NOTE', payload: note });
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Vendor selector */}
        {state.vendors.length > 0 && (
          <TouchableOpacity
            style={[styles.vendorSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
            onPress={() => setVendorPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.vendorSelectorText, { color: vendorName ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>
              {vendorName || 'Select from saved vendors'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}

        <TextInput label="Vendor Name" value={vendorName} onChangeText={setVendorName} mode="outlined" style={styles.input} />
        <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)} activeOpacity={0.75}>
          <View style={styles.dateFieldInner}>
            <Text style={styles.dateFieldLabel}>Date</Text>
            <Text style={styles.dateFieldValue}>{formatDisplayDate(dateObj)}</Text>
          </View>
          <Ionicons name="calendar-outline" size={20} color="#0D9488" />
        </TouchableOpacity>
        <TextInput label="Reason" value={reason} onChangeText={setReason} mode="outlined" multiline numberOfLines={3} style={styles.input} />
        <TextInput label="Amount" value={amount} onChangeText={setAmount} mode="outlined" keyboardType="numeric" style={styles.input} />

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
          Create Debit Note
        </Button>
      </View>

      {/* Vendor Picker Modal */}
      <Modal visible={vendorPickerVisible} animationType="slide" onRequestClose={() => setVendorPickerVisible(false)}>
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Select Vendor</Text>
            <TouchableOpacity onPress={() => setVendorPickerVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          <Searchbar
            placeholder="Search vendors..."
            value={vendorSearch}
            onChangeText={setVendorSearch}
            style={[styles.modalSearch, { backgroundColor: theme.colors.surface }]}
          />
          <FlatList
            data={filteredVendors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.vendorRow, { borderBottomColor: theme.colors.outline }]}
                onPress={() => selectVendor(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.vendorRowAvatar, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.vendorRowAvatarText, { color: theme.colors.primary }]}>
                    {getInitials(item.vendorName)}
                  </Text>
                </View>
                <View style={styles.vendorRowInfo}>
                  <Text style={[styles.vendorRowName, { color: theme.colors.onSurface }]}>{item.vendorName}</Text>
                  {item.gstNumber ? (
                    <Text style={[styles.vendorRowSub, { color: theme.colors.onSurfaceVariant }]}>GST: {item.gstNumber}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.vendorList}
          />
        </View>
      </Modal>
      <DatePickerModal
        visible={showDatePicker}
        value={dateObj}
        title="Debit Note Date"
        onConfirm={(d) => setDateObj(d)}
        onDismiss={() => setShowDatePicker(false)}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  vendorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  vendorSelectorText: { flex: 1, fontSize: FontSize.md },
  input: { marginBottom: Spacing.md },
  saveBtn: { marginTop: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xxxl },
  dateField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md, backgroundColor: '#fff' },
  dateFieldInner: { flex: 1 },
  dateFieldLabel: { fontSize: FontSize.xs, color: '#64748B', marginBottom: 2 },
  dateFieldValue: { fontSize: FontSize.md, color: '#0F172A', fontWeight: '500' },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: 52,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  modalSearch: { margin: Spacing.lg, elevation: 0 },
  vendorList: { paddingHorizontal: Spacing.lg },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  vendorRowAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorRowAvatarText: { fontSize: FontSize.md, fontWeight: '700' },
  vendorRowInfo: { flex: 1 },
  vendorRowName: { fontSize: FontSize.md, fontWeight: '600' },
  vendorRowSub: { fontSize: FontSize.sm, marginTop: 2 },
});
