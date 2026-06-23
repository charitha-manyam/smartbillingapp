import React, { useState, useRef } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme, Menu, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { LineItem, Quotation, Product } from '../../types';
import { LineItemInput } from '../../components/LineItemInput';
import { CalculationSummary } from '../../components/CalculationSummary';
import { DatePickerModal, formatDisplayDate } from '../../components/DatePickerModal';

function nextQuotationNumber(existing: Quotation[]): string {
  const max = existing.reduce((m, q) => {
    const n = parseInt(q.quotationNumber.replace(/\D/g, ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `QT-${String(max + 1).padStart(3, '0')}`;
}

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
            <Text style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>Select Product / Service</Text>
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
                <View style={[styles.pickerIcon, { backgroundColor: item.type === 'service' ? '#ECFEFF' : '#F0FDFA' }]}>
                  <Ionicons name={item.type === 'service' ? 'construct-outline' : 'cube-outline'} size={18}
                    color={item.type === 'service' ? '#0891B2' : '#0D9488'} />
                </View>
                <View style={styles.pickerInfo}>
                  <Text style={[styles.pickerName, { color: theme.colors.onSurface }]}>{item.name}</Text>
                  <Text style={[styles.pickerSub, { color: theme.colors.onSurfaceVariant }]}>
                    ₹{item.unitPrice}/{item.unit}  •  HSN: {item.hsnCode || '—'}  •  GST: {item.gstPercentage}%
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

export default function CreateQuotationScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const { customers, quotations, products } = state;
  const upcomingNumber = nextQuotationNumber(quotations);
  const scrollRef = useRef<ScrollView>(null);

  const [customerId, setCustomerId] = useState('');
  const [customerMenu, setCustomerMenu] = useState(false);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [validUntilDate, setValidUntilDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showValidUntilPicker, setShowValidUntilPicker] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', itemName: '', description: '', quantity: 1, unitPrice: 0, gstPercentage: 18, discountPercentage: 0 },
  ]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === customerId);

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
    setLineItems(lineItems.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const quotation: Quotation = {
      id: Date.now().toString(),
      quotationNumber: upcomingNumber,
      date: date.toISOString(),
      validUntil: validUntilDate ? validUntilDate.toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customerId: customerId || 'walk-in',
      customerName: selectedCustomer?.customerName || 'Walk-in Customer',
      customerGst: selectedCustomer?.gstNumber || '',
      customerAddress: selectedCustomer?.address || '',
      lineItems: lineItems.filter((li) => li.itemName.trim()),
      notes,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_QUOTATION', payload: quotation });
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView ref={scrollRef} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.idBadge}>
          <View>
            <Text style={styles.idLabel}>QUOTATION NO.</Text>
            <Text style={styles.idValue}>{upcomingNumber}</Text>
          </View>
          <View style={styles.idIcon}><Text style={styles.idIconText}>#</Text></View>
        </View>

        <Menu
          visible={customerMenu}
          onDismiss={() => setCustomerMenu(false)}
          anchor={
            <Button mode="outlined" onPress={() => setCustomerMenu(true)} style={styles.customerBtn}>
              {selectedCustomer ? selectedCustomer.customerName : 'Select Customer (Optional)'}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setCustomerId(''); setCustomerMenu(false); }} title="Walk-in Customer" />
          {customers.map((c) => (
            <Menu.Item key={c.id} onPress={() => { setCustomerId(c.id); setCustomerMenu(false); }} title={c.customerName} />
          ))}
        </Menu>

        {selectedCustomer && (
          <View style={[styles.selectedCustomer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.customerInfo, { color: theme.colors.onSurface }]}>{selectedCustomer.customerName}</Text>
            <Text style={[styles.customerInfo, { color: theme.colors.onSurfaceVariant }]}>{selectedCustomer.address}</Text>
            <Text style={[styles.customerInfo, { color: theme.colors.onSurfaceVariant }]}>GST: {selectedCustomer.gstNumber}</Text>
          </View>
        )}

        {/* Dated */}
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.75}
        >
          <View style={styles.dateFieldInner}>
            <Text style={styles.dateFieldLabel}>Dated</Text>
            <Text style={styles.dateFieldValue}>{formatDisplayDate(date)}</Text>
          </View>
          <Ionicons name="calendar-outline" size={20} color="#0D9488" />
        </TouchableOpacity>

        {/* Valid Until */}
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowValidUntilPicker(true)}
          activeOpacity={0.75}
        >
          <View style={styles.dateFieldInner}>
            <Text style={styles.dateFieldLabel}>Valid Until</Text>
            <Text style={styles.dateFieldValue}>
              {validUntilDate ? formatDisplayDate(validUntilDate) : 'Tap to select (default: +30 days)'}
            </Text>
          </View>
          <Ionicons name="calendar-outline" size={20} color="#0D9488" />
        </TouchableOpacity>

        <View style={styles.lineItemsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Line Items</Text>
          {products.length > 0 && (
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

        <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined"
          multiline numberOfLines={3} style={[styles.input, styles.notesInput]} />

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>Create Quotation</Button>
      </View>

      <ProductPickerModal
        visible={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={addFromProduct}
        products={products}
      />

      <DatePickerModal
        visible={showDatePicker}
        value={date}
        title="Quotation Date"
        onConfirm={(d) => setDate(d)}
        onDismiss={() => setShowDatePicker(false)}
      />

      <DatePickerModal
        visible={showValidUntilPicker}
        value={validUntilDate ?? undefined}
        title="Valid Until"
        onConfirm={(d) => setValidUntilDate(d)}
        onDismiss={() => setShowValidUntilPicker(false)}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  idBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  idLabel: { fontSize: FontSize.xs, fontWeight: '700', color: '#64748B', letterSpacing: 1.5, marginBottom: 4 },
  idValue: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF' },
  idIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  idIconText: { fontSize: FontSize.xxl, fontWeight: '900', color: '#64748B' },
  customerBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  selectedCustomer: { padding: Spacing.lg, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  customerInfo: { fontSize: FontSize.md, marginBottom: 2 },
  input: { marginBottom: Spacing.md },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: '#fff',
  },
  dateFieldInner: { flex: 1 },
  dateFieldLabel: { fontSize: FontSize.xs, color: '#64748B', marginBottom: 2 },
  dateFieldValue: { fontSize: FontSize.md, color: '#0F172A', fontWeight: '500' },
  lineItemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.md },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  addFromCatalogBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round },
  addFromCatalogText: { fontSize: FontSize.sm, fontWeight: '600' },
  addItemBtn: { marginBottom: Spacing.lg },
  notesInput: { marginTop: Spacing.lg },
  saveBtn: { marginTop: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xxxl },
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
