import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils';

export default function VendorDetailScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const vendor = state.vendors.find((v) => v.id === route.params.vendorId);

  if (!vendor) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Text>Vendor not found</Text>
      </View>
    );
  }

  const vendorPurchases = state.purchases.filter((p) => p.vendorName === vendor.vendorName);
  const vendorDebitNotes = state.debitNotes.filter((dn) => dn.vendorName === vendor.vendorName);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {vendor.vendorName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.colors.primary }]}>{vendor.vendorName}</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Contact Details</Text>
          <DetailRow icon="call" label="Phone" value={vendor.mobileNumber} theme={theme} />
          <DetailRow icon="mail" label="Email" value={vendor.email} theme={theme} />
          <DetailRow icon="location" label="Address" value={vendor.address} theme={theme} />
          <DetailRow icon="card" label="GST" value={vendor.gstNumber} theme={theme} />
          <DetailRow icon="calendar" label="Since" value={formatDate(vendor.createdAt)} theme={theme} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Documents</Text>
          <View style={styles.statRow}>
            <View style={[styles.stat, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {vendorPurchases.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Purchases</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {vendorDebitNotes.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Debit Notes</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('AddVendor', { vendor })}
        >
          <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          <Text style={[styles.editText, { color: theme.colors.primary }]}>Edit Vendor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, theme }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; theme: any }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={theme.colors.onSurfaceVariant} />
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>{value || '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: 'white' },
  name: { fontSize: FontSize.xxl, fontWeight: '700' },
  content: { padding: Spacing.lg },
  card: { padding: Spacing.xl, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.lg },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.lg, gap: Spacing.md },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: FontSize.sm, marginBottom: 2 },
  detailValue: { fontSize: FontSize.md, fontWeight: '500' },
  statRow: { flexDirection: 'row', gap: Spacing.md },
  stat: { flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.md, alignItems: 'center' },
  statValue: { fontSize: FontSize.xxxl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  editText: { fontSize: FontSize.lg, fontWeight: '600' },
});
