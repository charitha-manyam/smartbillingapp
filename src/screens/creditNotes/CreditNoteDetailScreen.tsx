import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Spacing, FontSize } from '../../constants';
import { useApp } from '../../context/AppContext';
import { DocumentActions } from '../../components/DocumentActions';
import { formatDate, formatCurrency } from '../../utils';
import { generateCreditNotePdf, sharePdf, printPdf } from '../../services/pdf';
import { creditNotePdfHtml } from '../../pdf/templates';

export default function CreditNoteDetailScreen({ route }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const [busy, setBusy] = useState(false);
  const note = state.creditNotes.find((cn) => cn.id === route.params.creditNoteId);

  if (!note) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Credit Note not found</Text>
      </View>
    );
  }

  const handlePrint = async () => {
    try {
      setBusy(true);
      await printPdf(creditNotePdfHtml(note, state.company));
    } catch {
      Alert.alert('Print Failed', 'Unable to print. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    try {
      setBusy(true);
      const uri = await generateCreditNotePdf(note, state.company);
      await sharePdf(uri);
    } catch {
      Alert.alert('Share Failed', 'Unable to share PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePdf = async () => {
    try {
      setBusy(true);
      const uri = await generateCreditNotePdf(note, state.company);
      await sharePdf(uri);
    } catch {
      Alert.alert('PDF Failed', 'Unable to generate PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: '#F59E0B' }]}>
        <Text style={styles.docNumber}>{note.creditNoteNumber}</Text>
        <Text style={styles.docDate}>Date: {formatDate(note.date)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={styles.statusText}>{note.status.toUpperCase()}</Text>
        </View>
      </View>

      <DocumentActions
        actions={[
          { icon: 'print', label: busy ? '...' : 'Print', onPress: handlePrint },
          { icon: 'share', label: busy ? '...' : 'Share', onPress: handleShare },
          { icon: 'download', label: busy ? '...' : 'PDF', onPress: handleSavePdf },
        ]}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Customer</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{note.customerName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Reason</Text>
        <Text style={[styles.detail, { color: theme.colors.onSurfaceVariant }]}>{note.reason}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Amount</Text>
        <Text style={[styles.amount, { color: theme.colors.error }]}>{formatCurrency(note.amount)}</Text>
      </View>
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
  section: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },
  value: { fontSize: FontSize.lg, fontWeight: '600' },
  detail: { fontSize: FontSize.md, lineHeight: 22 },
  amount: { fontSize: FontSize.xxxl, fontWeight: '700' },
});
