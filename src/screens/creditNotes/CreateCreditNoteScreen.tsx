import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme, Menu } from 'react-native-paper';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { useApp } from '../../context/AppContext';
import { CreditNote } from '../../types';
import { generateDocumentNumber } from '../../utils';
import { DatePickerModal, formatDisplayDate } from '../../components/DatePickerModal';

export default function CreateCreditNoteScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const { customers, creditNotes } = state;

  const [customerId, setCustomerId] = useState('');
  const [customerMenu, setCustomerMenu] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSave = () => {
    const note: CreditNote = {
      id: Date.now().toString(),
      creditNoteNumber: generateDocumentNumber('CN', creditNotes.length),
      customerId: customerId || 'walk-in',
      customerName: selectedCustomer?.customerName || 'Walk-in Customer',
      date: dateObj.toISOString(),
      reason,
      amount: Number(amount) || 0,
      status: 'issued',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CREDIT_NOTE', payload: note });
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Menu
          visible={customerMenu}
          onDismiss={() => setCustomerMenu(false)}
          anchor={
            <Button mode="outlined" onPress={() => setCustomerMenu(true)} style={styles.customerBtn}>
              {selectedCustomer ? selectedCustomer.customerName : 'Select Customer'}
            </Button>
          }
        >
          {customers.map((c) => (
            <Menu.Item key={c.id} onPress={() => { setCustomerId(c.id); setCustomerMenu(false); }} title={c.customerName} />
          ))}
        </Menu>

        <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)} activeOpacity={0.75}>
          <View style={styles.dateFieldInner}>
            <Text style={styles.dateFieldLabel}>Date</Text>
            <Text style={styles.dateFieldValue}>{formatDisplayDate(dateObj)}</Text>
          </View>
        </TouchableOpacity>
        <TextInput label="Reason" value={reason} onChangeText={setReason} mode="outlined" multiline numberOfLines={3} style={styles.input} />
        <TextInput label="Amount" value={amount} onChangeText={setAmount} mode="outlined" keyboardType="numeric" style={styles.input} />

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
          Create Credit Note
        </Button>
      </View>
      <DatePickerModal
        visible={showDatePicker}
        value={dateObj}
        title="Credit Note Date"
        onConfirm={(d) => setDateObj(d)}
        onDismiss={() => setShowDatePicker(false)}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  customerBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  input: { marginBottom: Spacing.md },
  saveBtn: { marginTop: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xxxl },
  dateField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md, backgroundColor: '#fff' },
  dateFieldInner: { flex: 1 },
  dateFieldLabel: { fontSize: FontSize.xs, color: '#64748B', marginBottom: 2 },
  dateFieldValue: { fontSize: FontSize.md, color: '#0F172A', fontWeight: '500' },
});
