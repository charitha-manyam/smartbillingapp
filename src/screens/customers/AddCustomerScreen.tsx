import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { validatePhone, validateEmail, validateGst, validateRequired } from '../../utils';

export default function AddCustomerScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { dispatch } = useApp();
  const existingCustomer: Customer | undefined = route.params?.customer;

  const [form, setForm] = useState({
    customerName: existingCustomer?.customerName || '',
    mobileNumber: existingCustomer?.mobileNumber || '',
    email: existingCustomer?.email || '',
    gstNumber: existingCustomer?.gstNumber || '',
    address: existingCustomer?.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateRequired(form.customerName, 'Customer Name');
    if (nameErr) newErrors.customerName = nameErr;
    if (!validatePhone(form.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number';
    if (form.email && !validateEmail(form.email)) newErrors.email = 'Invalid email';
    if (form.gstNumber && !validateGst(form.gstNumber)) newErrors.gstNumber = 'Invalid GST number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const customer: Customer = {
      id: existingCustomer?.id || Date.now().toString(),
      ...form,
      createdAt: existingCustomer?.createdAt || new Date().toISOString(),
    };

    if (existingCustomer) {
      dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
    } else {
      dispatch({ type: 'ADD_CUSTOMER', payload: customer });
    }
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <TextInput
          label="Customer Name *"
          value={form.customerName}
          onChangeText={(v) => setForm({ ...form, customerName: v })}
          mode="outlined"
          style={styles.input}
          error={!!errors.customerName}
        />
        {errors.customerName && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.customerName}</Text>
        )}

        <TextInput
          label="Mobile Number *"
          value={form.mobileNumber}
          onChangeText={(v) => setForm({ ...form, mobileNumber: v })}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.input}
          error={!!errors.mobileNumber}
        />
        {errors.mobileNumber && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.mobileNumber}</Text>
        )}

        <TextInput
          label="Email"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          mode="outlined"
          keyboardType="email-address"
          style={styles.input}
          error={!!errors.email}
        />
        {errors.email && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.email}</Text>
        )}

        <TextInput
          label="GST Number"
          value={form.gstNumber}
          onChangeText={(v) => setForm({ ...form, gstNumber: v })}
          mode="outlined"
          style={styles.input}
          error={!!errors.gstNumber}
        />
        {errors.gstNumber && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.gstNumber}</Text>
        )}

        <TextInput
          label="Address"
          value={form.address}
          onChangeText={(v) => setForm({ ...form, address: v })}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
          {existingCustomer ? 'Update Customer' : 'Add Customer'}
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.md,
  },
  error: {
    fontSize: FontSize.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  saveBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
