import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { LineItemTable } from '../../components/LineItemTable';
import { CalculationSummary } from '../../components/CalculationSummary';
import { DocumentActions } from '../../components/DocumentActions';
import { formatDate, formatCurrency } from '../../utils';
import { printQuotation, generateQuotationPdf, sharePdf } from '../../services/pdf';

const interstitial = InterstitialAd.createForAdRequest('ca-app-pub-3940256099942544/1033173712');

export default function QuotationDetailScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const [busy, setBusy] = useState(false);
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

  const quotation = state.quotations.find((q) => q.id === route.params.quotationId);

  if (!quotation) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Quotation not found</Text>
      </View>
    );
  }

  const handleConvertToInvoice = () => {
    navigation.navigate('CreateInvoice', { quotationId: quotation.id });
  };

  const handlePrint = async () => {
    try {
      setBusy(true);
      await printQuotation(quotation, state.company);
    } catch {
      Alert.alert('Print Failed', 'Unable to print. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    try {
      setBusy(true);
      const uri = await generateQuotationPdf(quotation, state.company);
      await sharePdf(uri);
      if (adLoaded) interstitial.show();
    } catch {
      Alert.alert('Share Failed', 'Unable to share PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePdf = async () => {
    try {
      setBusy(true);
      const uri = await generateQuotationPdf(quotation, state.company);
      await sharePdf(uri);
    } catch {
      Alert.alert('PDF Failed', 'Unable to generate PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.docLabel}>QUOTATION</Text>
        <Text style={styles.docNumber}>{quotation.quotationNumber}</Text>
        <Text style={styles.docDate}>Date: {formatDate(quotation.date)}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{quotation.status.toUpperCase()}</Text>
        </View>
      </View>

      <DocumentActions
        actions={[
          { icon: 'print', label: busy ? '...' : 'Print', onPress: handlePrint },
          { icon: 'share', label: busy ? '...' : 'Share', onPress: handleShare },
          { icon: 'download', label: busy ? '...' : 'PDF', onPress: handleSavePdf },
          { icon: 'swap-horizontal', label: 'To Invoice', onPress: handleConvertToInvoice, color: '#10B981' },
        ]}
      />

      {quotation.customerName && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Customer</Text>
          <Text style={[styles.customerName, { color: theme.colors.onSurface }]}>
            {quotation.customerName}
          </Text>
          {quotation.customerAddress ? (
            <Text style={[styles.customerDetail, { color: theme.colors.onSurfaceVariant }]}>
              {quotation.customerAddress}
            </Text>
          ) : null}
          {quotation.customerGst ? (
            <Text style={[styles.customerDetail, { color: theme.colors.onSurfaceVariant }]}>
              GST: {quotation.customerGst}
            </Text>
          ) : null}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Items</Text>
        <LineItemTable items={quotation.lineItems} />
      </View>

      <View style={styles.section}>
        <CalculationSummary lineItems={quotation.lineItems} />
      </View>

      {quotation.notes ? (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Notes</Text>
          <Text style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
            {quotation.notes}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#0F172A',
    padding: Spacing.xl,
    alignItems: 'center',
  },
  docLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  docNumber: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  docDate: {
    fontSize: FontSize.sm,
    color: '#94A3B8',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  customerName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  customerDetail: {
    fontSize: FontSize.md,
    marginBottom: 2,
  },
  notes: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
});
