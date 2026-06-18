import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../constants';
import { LineItem } from '../types';

interface LineItemInputProps {
  item: LineItem;
  index: number;
  onChange: (index: number, field: keyof LineItem, value: string | number) => void;
  onRemove: (index: number) => void;
  error?: string;
}

export function LineItemInput({ item, index, onChange, onRemove, error }: LineItemInputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.header}>
        <Text style={[styles.itemLabel, { color: theme.colors.onSurface }]}>Item #{index + 1}</Text>
        <TouchableOpacity onPress={() => onRemove(index)}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <TextInput
        label="Item Name *"
        value={item.itemName}
        onChangeText={(v) => onChange(index, 'itemName', v)}
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.row}>
        <TextInput
          label="HSN Code"
          value={item.hsnCode || ''}
          onChangeText={(v) => onChange(index, 'hsnCode', v)}
          mode="outlined"
          style={styles.halfInput}
          keyboardType="numeric"
        />
        <TextInput
          label="Unit (pcs/kg/ltr)"
          value={item.unit || ''}
          onChangeText={(v) => onChange(index, 'unit', v)}
          mode="outlined"
          style={styles.halfInput}
        />
      </View>

      <TextInput
        label="Description"
        value={item.description}
        onChangeText={(v) => onChange(index, 'description', v)}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={2}
      />

      <View style={styles.row}>
        <TextInput
          label="Qty"
          value={String(item.quantity)}
          onChangeText={(v) => onChange(index, 'quantity', Number(v) || 0)}
          mode="outlined"
          keyboardType="numeric"
          style={styles.smallInput}
        />
        <TextInput
          label="Unit Price"
          value={String(item.unitPrice)}
          onChangeText={(v) => onChange(index, 'unitPrice', Number(v) || 0)}
          mode="outlined"
          keyboardType="numeric"
          style={styles.smallInput}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="GST %"
          value={String(item.gstPercentage)}
          onChangeText={(v) => onChange(index, 'gstPercentage', Number(v) || 0)}
          mode="outlined"
          keyboardType="numeric"
          style={styles.smallInput}
        />
        <TextInput
          label="Discount %"
          value={String(item.discountPercentage)}
          onChangeText={(v) => onChange(index, 'discountPercentage', Number(v) || 0)}
          mode="outlined"
          keyboardType="numeric"
          style={styles.smallInput}
        />
      </View>

      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  itemLabel: { fontSize: FontSize.md, fontWeight: '600' },
  input: { marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1, marginBottom: Spacing.sm },
  smallInput: { flex: 1, marginBottom: Spacing.sm },
  error: { fontSize: FontSize.sm, marginTop: Spacing.xs },
});
