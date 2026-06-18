import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { useApp } from '../../context/AppContext';
import { LineItem, Purchase, Product } from '../../types';
import { LineItemInput } from '../../components/LineItemInput';
import { CalculationSummary } from '../../components/CalculationSummary';
import { generateDocumentNumber, getInitials } from '../../utils';
import { DatePickerModal, formatDisplayDate } from '../../components/DatePickerModal';

function ProductPickerModal({
  visible,
  onClose,
  onSelect,
  products,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (p: Product) => void;
  products: Product[];
}) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const filtered = products.filter((p) =>
    search.trim() ? p.name.toLowerCase().includes(search.toLowerCase()) : true
  );
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.pickerModal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>Select Product</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          <Searchbar placeholder="Search..." value={search} onChangeText={setSearch}
            style={[styles.pickerSearch, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0} />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={styles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                onPress={() => { onSelect(item); onClose(); setSearch(''); }}
              >
                <View style={[styles.pickerIcon, { backgroundColor: '#F0FDFA' }]}>
                  <Ionicons name="cube-outline" size={18} color="#0D9488" />
                </View>
                <View style={styles.pickerInfo}>
                  <Text style={[styles.pickerName, { color: theme.colors.onSurface }]}>{item.name}</Text>
                  <Text style={[styles.pickerSub, { color: theme.colors.onSurfaceVariant }]}>
                    ₹{item.unitPrice}/{item.unit}  •  Stock: {item.stockQuantity}
                  </Text>
                </View>
                <Text style={[styles.pickerPrice, { color: theme.colors.primary }]}>₹{item.unitPrice}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={[styles.pickerEmpty, { color: theme.colors.onSurfaceVariant }]}>No products found</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function CreatePurchaseScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();

  const [vendorName, setVendorName] = useState('');
  const [vendorGst, setVendorGst] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', itemName: '', description: '', quantity: 1, unitPrice: 0, gstPercentage: 18, discountPercentage: 0 },
  ]);
  const [vendorPickerVisible, setVendorPickerVisible] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  const productItems = state.products.filter((p) => p.type === 'product');
  const filteredVendors = state.vendors.filter((v) =>
    v.vendorName.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const selectVendor = (vendor: typeof state.vendors[0]) => {
    setVendorName(vendor.vendorName);
    setVendorGst(vendor.gstNumber);
    setVendorPickerVisible(false);
    setVendorSearch('');
  };

  const addLineItem = () => {
    setLineItems([...lineItems,
      { id: Date.now().toString(), itemName: '', description: '', quantity: 1, unitPrice: 0, gstPercentage: 18, discountPercentage: 0 },
    ]);
  };

  const addFromProduct = (product: Product) => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      itemName: product.name,
      description: product.description || '',
      quantity: 1,
      unitPrice: product.unitPrice,
      gstPercentage: product.gstPercentage,
      discountPercentage: 0,
      hsnCode: product.hsnCode,
      unit: product.unit,
      productId: product.id,
    };
    setLineItems((prev) => [...prev.filter((li) => li.itemName.trim() || prev.length === 1), newItem]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validItems = lineItems.filter((li) => li.itemName.trim());
    const purchaseId = Date.now().toString();
    const billNum = billNumber || generateDocumentNumber('BILL', state.purchases.length);

    const purchase: Purchase = {
      id: purchaseId,
      vendorName: vendorName || 'Unknown Vendor',
      vendorGstNumber: vendorGst,
      billNumber: billNum,
      date: dateObj.toISOString(),
      lineItems: validItems,
      notes,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PURCHASE', payload: purchase });

    // Auto stock-in for product line items
    validItems.forEach((li) => {
      if (!li.productId) return;
      const product = state.products.find((p) => p.id === li.productId);
      if (!product || product.type !== 'product') return;
      const balanceAfter = product.stockQuantity + li.quantity;
      dispatch({
        type: 'ADD_STOCK_TRANSACTION',
        payload: {
          id: `${purchaseId}-${li.id}`,
          productId: product.id,
          productName: product.name,
          type: 'in',
          quantity: li.quantity,
          balanceAfter,
          reason: `Purchase ${billNum}`,
          referenceId: purchaseId,
          referenceType: 'purchase',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      });
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...product, stockQuantity: balanceAfter } });
    });

    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
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
        <TextInput label="Vendor GST Number" value={vendorGst} onChangeText={setVendorGst} mode="outlined" style={styles.input} />
        <TextInput label="Bill Number" value={billNumber} onChangeText={setBillNumber} mode="outlined" style={styles.input} />
        <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)} activeOpacity={0.75}>
          <View style={styles.dateFieldInner}>
            <Text style={styles.dateFieldLabel}>Date</Text>
            <Text style={styles.dateFieldValue}>{formatDisplayDate(dateObj)}</Text>
          </View>
          <Ionicons name="calendar-outline" size={20} color="#0D9488" />
        </TouchableOpacity>

        <View style={styles.lineItemsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Line Items</Text>
          {productItems.length > 0 && (
            <TouchableOpacity
              style={[styles.addFromCatalogBtn, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => setShowProductPicker(true)}
            >
              <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.addFromCatalogText, { color: theme.colors.primary }]}>From Catalog</Text>
            </TouchableOpacity>
          )}
        </View>

        {lineItems.map((item, index) => (
          <LineItemInput key={item.id} item={item} index={index} onChange={updateLineItem} onRemove={removeLineItem} />
        ))}
        <Button mode="text" onPress={addLineItem} icon="plus" style={styles.addItemBtn}>Add Item</Button>

        <CalculationSummary lineItems={lineItems} />

        <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={3}
          style={[styles.input, { marginTop: Spacing.lg }]} />

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>Save Purchase</Button>
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
          <Searchbar placeholder="Search vendors..." value={vendorSearch} onChangeText={setVendorSearch}
            style={[styles.modalSearch, { backgroundColor: theme.colors.surface }]} />
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

      <ProductPickerModal
        visible={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={addFromProduct}
        products={productItems}
      />

      <DatePickerModal
        visible={showDatePicker}
        value={dateObj}
        title="Purchase Date"
        onConfirm={(d) => setDateObj(d)}
        onDismiss={() => setShowDatePicker(false)}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  vendorSelector: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md, marginBottom: Spacing.md },
  vendorSelectorText: { flex: 1, fontSize: FontSize.md },
  input: { marginBottom: Spacing.md },
  lineItemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.md },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  addFromCatalogBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round },
  addFromCatalogText: { fontSize: FontSize.sm, fontWeight: '600' },
  addItemBtn: { marginBottom: Spacing.lg },
  saveBtn: { marginTop: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xxxl },
  dateField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md, backgroundColor: '#fff' },
  dateFieldInner: { flex: 1 },
  dateFieldLabel: { fontSize: FontSize.xs, color: '#64748B', marginBottom: 2 },
  dateFieldValue: { fontSize: FontSize.md, color: '#0F172A', fontWeight: '500' },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingTop: 52 },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  modalSearch: { margin: Spacing.lg, elevation: 0 },
  vendorList: { paddingHorizontal: Spacing.lg },
  vendorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, gap: Spacing.md },
  vendorRowAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  vendorRowAvatarText: { fontSize: FontSize.md, fontWeight: '700' },
  vendorRowInfo: { flex: 1 },
  vendorRowName: { fontSize: FontSize.md, fontWeight: '600' },
  vendorRowSub: { fontSize: FontSize.sm, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '75%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.md },
  pickerTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  pickerSearch: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: BorderRadius.md },
  pickerList: { paddingHorizontal: Spacing.lg },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  pickerIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  pickerInfo: { flex: 1 },
  pickerName: { fontSize: FontSize.md, fontWeight: '600' },
  pickerSub: { fontSize: FontSize.sm, marginTop: 2 },
  pickerPrice: { fontSize: FontSize.md, fontWeight: '700' },
  pickerEmpty: { textAlign: 'center', padding: Spacing.xl },
});
