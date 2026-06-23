import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { Text, useTheme, TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { InterstitialAd, RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { LineItemTable } from '../../components/LineItemTable';
import { CalculationSummary } from '../../components/CalculationSummary';
import { DocumentActions } from '../../components/DocumentActions';
import { formatDate } from '../../utils';
import { printInvoice, generateInvoicePdf, sharePdf } from '../../services/pdf';
import { Payment } from '../../types';

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'upi', 'cheque', 'other'] as const;

const interstitial = InterstitialAd.createForAdRequest('ca-app-pub-7848427116394025/1715449067');
const rewarded = RewardedAd.createForAdRequest('ca-app-pub-7848427116394025/1522510394');

function totalAmount(lineItems: any[]): number {
  return lineItems.reduce((sum, item) => {
    const base = item.quantity * item.unitPrice;
    const afterDiscount = base * (1 - (item.discountPercentage || 0) / 100);
    const gst = afterDiscount * ((item.gstPercentage || 0) / 100);
    return sum + afterDiscount + gst;
  }, 0);
}

function totalPaid(payments: Payment[] = []): number {
  return payments.reduce((s, p) => s + p.amount, 0);
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#94A3B8',
  sent: '#3B82F6',
  paid: '#10B981',
  partially_paid: '#F59E0B',
  overdue: '#EF4444',
  cancelled: '#6B7280',
};

export default function InvoiceDetailScreen({ route }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const [busy, setBusy] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<Payment['method']>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [adLoaded, setAdLoaded] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);

  useEffect(() => {
    const unsubLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => setAdLoaded(true));
    const unsubClose = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      interstitial.load();
    });
    interstitial.load();

    const unsubRewLoad = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => setRewardedLoaded(true));
    const unsubRewClose = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setRewardedLoaded(false);
      rewarded.load();
    });
    const unsubRewEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      setRewardEarned(true);
      Alert.alert('Thank You!', 'You unlocked free PDF export for this invoice.');
    });
    rewarded.load();

    return () => { unsubLoad(); unsubClose(); unsubRewLoad(); unsubRewClose(); unsubRewEarned(); };
  }, []);

  const invoice = state.invoices.find((inv) => inv.id === route.params.invoiceId);

  if (!invoice) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Invoice not found</Text>
      </View>
    );
  }

  const payments: Payment[] = invoice.payments || [];
  const grand = totalAmount(invoice.lineItems);
  const paid = totalPaid(payments);
  const balance = grand - paid;

  const handlePrint = async () => {
    try { setBusy(true); await printInvoice(invoice, state.company); }
    catch { Alert.alert('Print Failed', 'Unable to print. Please try again.'); }
    finally { setBusy(false); }
  };

  const handleShare = async () => {
    try { setBusy(true); const uri = await generateInvoicePdf(invoice, state.company); await sharePdf(uri); if (adLoaded) interstitial.show(); }
    catch { Alert.alert('Share Failed', 'Unable to share PDF. Please try again.'); }
    finally { setBusy(false); }
  };

  const handleSavePdf = async () => {
    try { setBusy(true); const uri = await generateInvoicePdf(invoice, state.company); await sharePdf(uri); }
    catch { Alert.alert('PDF Failed', 'Unable to generate PDF. Please try again.'); }
    finally { setBusy(false); }
  };

  const handleWatchAd = () => {
    if (rewardedLoaded) {
      rewarded.show();
    } else {
      Alert.alert('Ad not ready', 'Please try again in a moment.');
    }
  };

  const handleRecordPayment = () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { Alert.alert('Invalid Amount', 'Enter a valid payment amount.'); return; }
    if (amount > balance + 0.01) { Alert.alert('Overpayment', `Balance is ₹${balance.toFixed(2)}`); return; }

    const payment: Payment = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString(),
      method: payMethod,
      notes: payNotes.trim(),
    };

    const newPayments = [...payments, payment];
    const newPaid = totalPaid(newPayments);
    const newStatus = newPaid >= grand - 0.01 ? 'paid' : 'partially_paid';

    dispatch({
      type: 'UPDATE_INVOICE',
      payload: { ...invoice, payments: newPayments, status: newStatus },
    });

    setShowPayModal(false);
    setPayAmount('');
    setPayNotes('');
    setPayMethod('cash');
  };

  const statusColor = STATUS_COLORS[invoice.status] || '#94A3B8';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.docNumber}>{invoice.invoiceNumber}</Text>
        <Text style={styles.docDate}>
          Date: {formatDate(invoice.invoiceDate)}  |  Due: {formatDate(invoice.dueDate)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{invoice.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      <DocumentActions
        actions={[
          { icon: 'print', label: busy ? '...' : 'Print', onPress: handlePrint },
          { icon: 'share', label: busy ? '...' : 'Share', onPress: handleShare },
          { icon: 'download', label: busy ? '...' : 'PDF', onPress: handleSavePdf },
          { icon: rewardEarned ? 'gift' : 'play-circle', label: rewardEarned ? 'Unlocked!' : 'Watch Ad', onPress: handleWatchAd, color: rewardEarned ? '#10B981' : '#F59E0B' },
        ]}
      />

      {/* Payment Summary Card */}
      <View style={[styles.payCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.payRow}>
          <Text style={[styles.payLabel, { color: theme.colors.onSurfaceVariant }]}>Invoice Total</Text>
          <Text style={[styles.payValue, { color: theme.colors.onSurface }]}>₹{grand.toFixed(2)}</Text>
        </View>
        <View style={styles.payRow}>
          <Text style={[styles.payLabel, { color: theme.colors.onSurfaceVariant }]}>Paid</Text>
          <Text style={[styles.payValue, { color: '#10B981' }]}>₹{paid.toFixed(2)}</Text>
        </View>
        <View style={[styles.payDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
        <View style={styles.payRow}>
          <Text style={[styles.payBalanceLabel, { color: theme.colors.onSurface }]}>Balance Due</Text>
          <Text style={[styles.payBalance, { color: balance > 0.01 ? '#EF4444' : '#10B981' }]}>
            ₹{balance.toFixed(2)}
          </Text>
        </View>
        {balance > 0.01 && invoice.status !== 'cancelled' && (
          <TouchableOpacity
            style={[styles.recordPayBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowPayModal(true)}
          >
            <Ionicons name="card-outline" size={18} color="#fff" />
            <Text style={styles.recordPayText}>Record Payment</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Payment History */}
      {payments.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Payment History</Text>
          {payments.map((p) => (
            <View key={p.id} style={[styles.payHistRow, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.payHistIcon}>
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              </View>
              <View style={styles.payHistInfo}>
                <Text style={[styles.payHistMethod, { color: theme.colors.onSurface }]}>
                  {p.method.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  {p.notes ? `  •  ${p.notes}` : ''}
                </Text>
                <Text style={[styles.payHistDate, { color: theme.colors.onSurfaceVariant }]}>
                  {formatDate(p.date)}
                </Text>
              </View>
              <Text style={[styles.payHistAmt, { color: '#10B981' }]}>₹{p.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {invoice.customerName && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Bill To</Text>
          <Text style={[styles.customerName, { color: theme.colors.onSurface }]}>{invoice.customerName}</Text>
          {invoice.customerAddress ? (
            <Text style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>{invoice.customerAddress}</Text>
          ) : null}
          {invoice.customerGst ? (
            <Text style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>GST: {invoice.customerGst}</Text>
          ) : null}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Items</Text>
        <LineItemTable items={invoice.lineItems} />
      </View>

      <View style={styles.section}>
        <CalculationSummary lineItems={invoice.lineItems} />
      </View>

      {invoice.notes ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Notes</Text>
          <Text style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>{invoice.notes}</Text>
        </View>
      ) : null}

      {/* Record Payment Modal */}
      <Modal visible={showPayModal} animationType="slide" transparent onRequestClose={() => setShowPayModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Record Payment</Text>
              <TouchableOpacity onPress={() => setShowPayModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalBalance, { color: theme.colors.onSurfaceVariant }]}>
              Balance Due: <Text style={{ color: '#EF4444', fontWeight: '700' }}>₹{balance.toFixed(2)}</Text>
            </Text>

            <TextInput
              label="Amount (₹) *"
              value={payAmount}
              onChangeText={setPayAmount}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodScroll}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodChip, payMethod === m && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setPayMethod(m)}
                >
                  <Text style={[styles.methodText, { color: payMethod === m ? '#fff' : theme.colors.onSurface }]}>
                    {m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              label="Notes (Optional)"
              value={payNotes}
              onChangeText={setPayNotes}
              mode="outlined"
              style={[styles.input, { marginTop: Spacing.md }]}
            />

            <Button mode="contained" onPress={handleRecordPayment} style={styles.saveBtn}>
              Record Payment
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { padding: Spacing.xl, alignItems: 'center' },
  docNumber: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: Spacing.xs },
  docDate: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.md },
  statusBadge: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: 20 },
  statusText: { color: 'white', fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 1 },
  payCard: { margin: Spacing.lg, padding: Spacing.xl, borderRadius: BorderRadius.xl, ...Shadow.sm },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  payLabel: { fontSize: FontSize.md },
  payValue: { fontSize: FontSize.md, fontWeight: '600' },
  payDivider: { height: 1, marginVertical: Spacing.sm },
  payBalanceLabel: { fontSize: FontSize.lg, fontWeight: '700' },
  payBalance: { fontSize: FontSize.xl, fontWeight: '900' },
  recordPayBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.lg },
  recordPayText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  section: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  customerName: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: Spacing.xs },
  detail: { fontSize: FontSize.md, marginBottom: 2 },
  payHistRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, ...Shadow.sm },
  payHistIcon: { marginRight: Spacing.md },
  payHistInfo: { flex: 1 },
  payHistMethod: { fontSize: FontSize.md, fontWeight: '600' },
  payHistDate: { fontSize: FontSize.sm, marginTop: 2 },
  payHistAmt: { fontSize: FontSize.lg, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  modalBalance: { fontSize: FontSize.md, marginBottom: Spacing.lg },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  methodScroll: { marginBottom: Spacing.md },
  methodChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: '#F3F4F6', marginRight: Spacing.sm },
  methodText: { fontSize: FontSize.sm, fontWeight: '600' },
  input: { marginBottom: Spacing.sm },
  saveBtn: { marginTop: Spacing.md, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, marginBottom: Spacing.lg },
});
