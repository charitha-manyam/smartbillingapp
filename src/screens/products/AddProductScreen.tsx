import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme, SegmentedButtons } from 'react-native-paper';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

const UNITS = ['pcs', 'kg', 'gm', 'ltr', 'ml', 'mtr', 'box', 'set', 'pair', 'dozen', 'hour', 'day'];

export default function AddProductScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { dispatch } = useApp();
  const existing: Product | undefined = route.params?.product;

  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    hsnCode: existing?.hsnCode || '',
    unitPrice: existing?.unitPrice?.toString() || '',
    gstPercentage: existing?.gstPercentage?.toString() || '18',
    unit: existing?.unit || 'pcs',
    type: (existing?.type || 'product') as 'product' | 'service',
    stockQuantity: existing?.stockQuantity?.toString() || '0',
    minStockAlert: existing?.minStockAlert?.toString() || '5',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.unitPrice || isNaN(Number(form.unitPrice))) e.unitPrice = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const product: Product = {
      id: existing?.id || Date.now().toString(),
      name: form.name.trim(),
      description: form.description.trim(),
      hsnCode: form.hsnCode.trim(),
      unitPrice: Number(form.unitPrice) || 0,
      gstPercentage: Number(form.gstPercentage) || 0,
      unit: form.unit,
      type: form.type,
      stockQuantity: form.type === 'service' ? 0 : Number(form.stockQuantity) || 0,
      minStockAlert: form.type === 'service' ? 0 : Number(form.minStockAlert) || 0,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    dispatch({ type: existing ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT', payload: product });
    navigation.goBack();
  };

  const f = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Type</Text>
        <SegmentedButtons
          value={form.type}
          onValueChange={(v) => f('type', v)}
          buttons={[
            { value: 'product', label: 'Product', icon: 'cube-outline' },
            { value: 'service', label: 'Service', icon: 'construct-outline' },
          ]}
          style={styles.segment}
        />

        <TextInput label="Product / Service Name *" value={form.name} onChangeText={(v) => f('name', v)}
          mode="outlined" style={styles.input} error={!!errors.name} />
        {errors.name && <Text style={[styles.error, { color: theme.colors.error }]}>{errors.name}</Text>}

        <TextInput label="Description" value={form.description} onChangeText={(v) => f('description', v)}
          mode="outlined" style={styles.input} multiline numberOfLines={2} />

        <View style={styles.row}>
          <TextInput label="HSN Code" value={form.hsnCode} onChangeText={(v) => f('hsnCode', v)}
            mode="outlined" keyboardType="numeric" style={styles.half} />
          <TextInput label="GST %" value={form.gstPercentage} onChangeText={(v) => f('gstPercentage', v)}
            mode="outlined" keyboardType="numeric" style={styles.half} />
        </View>

        <View style={styles.row}>
          <TextInput label="Unit Price (₹) *" value={form.unitPrice} onChangeText={(v) => f('unitPrice', v)}
            mode="outlined" keyboardType="numeric" style={styles.half} error={!!errors.unitPrice} />
          <TextInput label="Unit" value={form.unit} onChangeText={(v) => f('unit', v)}
            mode="outlined" style={styles.half} />
        </View>
        {errors.unitPrice && <Text style={[styles.error, { color: theme.colors.error }]}>{errors.unitPrice}</Text>}

        <Text style={[styles.unitHint, { color: theme.colors.onSurfaceVariant }]}>
          Common units: {UNITS.join(' · ')}
        </Text>

        {form.type === 'product' && (
          <>
            <View style={[styles.stockBox, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.stockTitle, { color: theme.colors.onSurface }]}>Stock Settings</Text>
              <View style={styles.row}>
                <TextInput label="Opening Stock" value={form.stockQuantity} onChangeText={(v) => f('stockQuantity', v)}
                  mode="outlined" keyboardType="numeric" style={styles.half} />
                <TextInput label="Low Stock Alert" value={form.minStockAlert} onChangeText={(v) => f('minStockAlert', v)}
                  mode="outlined" keyboardType="numeric" style={styles.half} />
              </View>
              <Text style={[styles.stockHint, { color: theme.colors.onSurfaceVariant }]}>
                Alert when stock falls below the "Low Stock Alert" quantity
              </Text>
            </View>
          </>
        )}

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
          {existing ? 'Update Product' : 'Add Product'}
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  segment: { marginBottom: Spacing.lg },
  input: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  half: { flex: 1 },
  error: { fontSize: FontSize.sm, marginTop: -Spacing.sm, marginBottom: Spacing.md },
  unitHint: { fontSize: FontSize.xs, marginBottom: Spacing.lg, marginTop: -Spacing.sm },
  stockBox: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  stockTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.md },
  stockHint: { fontSize: FontSize.xs, marginTop: -Spacing.sm },
  saveBtn: { marginTop: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xxxl },
});
