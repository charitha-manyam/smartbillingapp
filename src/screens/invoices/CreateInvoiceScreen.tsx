import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, Button, useTheme, Menu, SegmentedButtons, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { LineItem, Invoice, InvoiceTemplate, Product } from '../../types';
import { LineItemInput } from '../../components/LineItemInput';
import { CalculationSummary } from '../../components/CalculationSummary';
import { generateDocumentNumber } from '../../utils';
import { DatePickerModal, formatDisplayDate } from '../../components/DatePickerModal';

const interstitial = InterstitialAd.createForAdRequest('ca-app-pub-3940256099942544/1033173712');

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
          <Searchbar
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            style={[styles.pickerSearch, { backgroundColor: theme.colors.surfaceVariant }]}
            elevation={0}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, { borderBottomColor: theme.colors.surfaceVariant }]}
                onPress={() => { onSelect(item); onClose(); setSearch(''); }}
              >
                <View style={[styles.pickerIcon, { backgroundColor: item.type === 'service' ? '#ECFEFF' : '#F0FDFA' }]}>
                  <Ionicons
                    name={item.type === 'service' ? 'construct-outline' : 'cube-outline'}
                    size={18}
                    color={item.type === 'service' ? '#0891B2' : '#0D9488'}
                  />
                </View>
                <View style={styles.pickerItemInfo}>
                  <Text style={[styles.pickerItemName, { color: theme.colors.onSurface }]}>{item.name}</Text>
                  <Text style={[styles.pickerItemSub, { color: theme.colors.onSurfaceVariant }]}>
                    ₹{item.unitPrice}/{item.unit}  •  HSN: {item.hsnCode || '—'}  •  GST: {item.gstPercentage}%
                    {item.type === 'product' ? `  •  Stock: ${item.stockQuantity}` : ''}
                  </Text>
                </View>
                <Text style={[styles.pickerItemPrice, { color: theme.colors.primary }]}>₹{item.unitPrice}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.pickerEmpty, { color: theme.colors.onSurfaceVariant }]}>No products found</Text>
            }
            style={styles.pickerList}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function CreateInvoiceScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const { company, customers, invoices, quotations, products } = state;
  const quotationId = route.params?.quotationId;

  const [customerId, setCustomerId] = useState('');
  const [customerMenu, setCustomerMenu] = useState(false);
  const [notes, setNotes] = useState('');
  const [dueDateObj, setDueDateObj] = useState<Date | null>(null);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>('classic');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', itemName: '', description: '', quantity: 1, unitPrice: 0, gstPercentage: 18, discountPercentage: 0 },
  ]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const unsubLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
    const unsubClose = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      interstitial.load();
    });
    interstitial.load();
    return () => { unsubLoad(); unsubClose(); };
  }, []);

  useEffect(() => {
    if (quotationId) {
      const quotation = quotations.find((q) => q.id === quotationId);
      if (quotation) {
        setCustomerId(quotation.customerId);
        setLineItems(quotation.lineItems);
        setNotes(quotation.notes);
      }
    }
  }, [quotationId]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
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
    const validItems = lineItems.filter((li) => li.itemName.trim());

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateDocumentNumber('INV', invoices.length),
      invoiceDate: new Date().toISOString(),
      dueDate: dueDateObj ? dueDateObj.toISOString() : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      customerId: customerId || 'walk-in',
      customerName: selectedCustomer?.customerName || 'Walk-in Customer',
      customerGst: selectedCustomer?.gstNumber || '',
      customerAddress: selectedCustomer?.address || '',
      lineItems: validItems,
      notes,
      status: 'draft',
      quotationId,
      createdAt: new Date().toISOString(),
      invoiceTemplate,
      payments: [],
    };

    dispatch({ type: 'ADD_INVOICE', payload: invoice });

    // Auto stock-out for product line items
    validItems.forEach((li) => {
      if (!li.productId) return;
      const product = products.find((p) => p.id === li.productId);
      if (!product || product.type !== 'product') return;
      const balanceAfter = product.stockQuantity - li.quantity;
      dispatch({
        type: 'ADD_STOCK_TRANSACTION',
        payload: {
          id: `${invoice.id}-${li.id}`,
          productId: product.id,
          productName: product.name,
          type: 'out',
          quantity: li.quantity,
          balanceAfter,
          reason: `Invoice ${invoice.invoiceNumber}`,
          referenceId: invoice.id,
          referenceType: 'invoice',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      });
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...product, stockQuantity: balanceAfter } });
    });

    if (quotationId) {
      const quotation = quotations.find((q) => q.id === quotationId);
      if (quotation) {
        dispatch({ type: 'UPDATE_QUOTATION', payload: { ...quotation, status: 'converted' } });
      }
    }

    if (adLoaded) interstitial.show();
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {quotationId && (
          <View style={[styles.conversionBanner, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.conversionText, { color: theme.colors.primary }]}>
              Creating invoice from quotation
            </Text>
          </View>
        )}

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

        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowDueDatePicker(true)}
          activeOpacity={0.75}
        >
          <View style={styles.dateFieldInner}>
            <Text style={styles.dateFieldLabel}>Due Date</Text>
            <Text style={styles.dateFieldValue}>
              {dueDateObj ? formatDisplayDate(dueDateObj) : 'Tap to select (default: +15 days)'}
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
          <LineItemInput
            key={item.id}
            item={item}
            index={index}
            onChange={updateLineItem}
            onRemove={removeLineItem}
          />
        ))}

        <Button mode="text" onPress={addLineItem} icon="plus" style={styles.addItemBtn}>
          Add Item
        </Button>

        <CalculationSummary lineItems={lineItems} />

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.notesInput]}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Invoice Template</Text>
        <SegmentedButtons
          value={invoiceTemplate}
          onValueChange={(v) => setInvoiceTemplate(v as InvoiceTemplate)}
          buttons={[
            { value: 'classic', label: 'Classic' },
            { value: 'modern', label: 'Modern' },
            { value: 'minimal', label: 'Minimal' },
          ]}
          style={styles.templateSelector}
        />

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
          Create Invoice
        </Button>
      </View>

      <ProductPickerModal
        visible={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={addFromProduct}
        products={products}
      />

      <DatePickerModal
        visible={showDueDatePicker}
        value={dueDateObj ?? undefined}
        title="Due Date"
        onConfirm={(d) => setDueDateObj(d)}
        onDismiss={() => setShowDueDatePicker(false)}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  conversionBanner: { padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, alignItems: 'center' },
  conversionText: { fontSize: FontSize.md, fontWeight: '600' },
  customerBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  selectedCustomer: { padding: Spacing.lg, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  customerInfo: { fontSize: FontSize.md, marginBottom: 2 },
  input: { marginBottom: Spacing.md },
  lineItemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.md },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  addFromCatalogBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round },
  addFromCatalogText: { fontSize: FontSize.sm, fontWeight: '600' },
  addItemBtn: { marginBottom: Spacing.lg },
  notesInput: { marginTop: Spacing.lg },
  templateSelector: { marginBottom: Spacing.lg },
  saveBtn: { marginTop: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xxxl },
  dateField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md, backgroundColor: '#fff' },
  dateFieldInner: { flex: 1 },
  dateFieldLabel: { fontSize: FontSize.xs, color: '#64748B', marginBottom: 2 },
  dateFieldValue: { fontSize: FontSize.md, color: '#0F172A', fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '75%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.md },
  pickerTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  pickerSearch: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: BorderRadius.md },
  pickerList: { paddingHorizontal: Spacing.lg },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  pickerIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  pickerItemInfo: { flex: 1 },
  pickerItemName: { fontSize: FontSize.md, fontWeight: '600' },
  pickerItemSub: { fontSize: FontSize.sm, marginTop: 2 },
  pickerItemPrice: { fontSize: FontSize.md, fontWeight: '700' },
  pickerEmpty: { textAlign: 'center', padding: Spacing.xl },
});
