import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';
import { EmptyState } from '../../components/EmptyState';

const TYPE_CONFIG: Record<AppNotification['type'], { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  invoice:     { icon: 'receipt',         color: '#10B981' },
  quotation:   { icon: 'document-text',   color: '#3B82F6' },
  purchase:    { icon: 'cart',            color: '#8B5CF6' },
  credit_note: { icon: 'remove-circle',   color: '#F59E0B' },
  debit_note:  { icon: 'add-circle',      color: '#EF4444' },
  customer:    { icon: 'person',          color: '#0D9488' },
  vendor:      { icon: 'business',        color: '#0891B2' },
  general:     { icon: 'notifications',   color: '#64748B' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen({ navigation }: any) {
  const theme = useTheme();
  const { state, dispatch } = useApp();

  const sorted = useMemo(
    () => [...state.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.notifications]
  );

  const unreadCount = sorted.filter((n) => !n.read).length;

  const handlePress = (notif: AppNotification) => {
    if (!notif.read) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id });
    }
    // Navigate to related document
    if (notif.relatedId) {
      switch (notif.type) {
        case 'invoice':     navigation.navigate('InvoiceDetail', { invoiceId: notif.relatedId }); break;
        case 'quotation':   navigation.navigate('QuotationDetail', { quotationId: notif.relatedId }); break;
        case 'purchase':    navigation.navigate('PurchaseDetail', { purchaseId: notif.relatedId }); break;
        case 'credit_note': navigation.navigate('CreditNoteDetail', { creditNoteId: notif.relatedId }); break;
        case 'debit_note':  navigation.navigate('DebitNoteDetail', { debitNoteId: notif.relatedId }); break;
        case 'customer':    navigation.navigate('CustomerDetail', { customerId: notif.relatedId }); break;
        case 'vendor':      navigation.navigate('VendorDetail', { vendorId: notif.relatedId }); break;
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {unreadCount > 0 && (
        <View style={[styles.topBar, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.unreadText, { color: theme.colors.onSurfaceVariant }]}>
            {unreadCount} unread
          </Text>
          <Button
            mode="text"
            compact
            onPress={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
          >
            Mark all read
          </Button>
        </View>
      )}

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const cfg = TYPE_CONFIG[item.type];
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: theme.colors.surface },
                !item.read && styles.unreadCard,
                !item.read && { borderLeftColor: cfg.color },
              ]}
              onPress={() => handlePress(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, { backgroundColor: cfg.color + '18' }]}>
                <Ionicons name={cfg.icon} size={22} color={cfg.color} />
              </View>
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: theme.colors.onSurface }, !item.read && styles.boldTitle]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read && <View style={[styles.dot, { backgroundColor: cfg.color }]} />}
                </View>
                <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
                  {timeAgo(item.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[styles.list, sorted.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState
            title="No Notifications"
            message="You'll see activity here when you create invoices, quotations, and more"
            icon="notifications-outline"
          />
        }
      />

      {sorted.length > 0 && (
        <TouchableOpacity
          style={[styles.clearBtn, { borderTopColor: theme.colors.outline }]}
          onPress={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={styles.clearText}>Clear all notifications</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  unreadText: { fontSize: FontSize.sm, fontWeight: '500' },
  list: { padding: Spacing.lg, paddingBottom: 80 },
  emptyList: { flex: 1 },
  card: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  unreadCard: {
    borderLeftWidth: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  title: { fontSize: FontSize.md, flex: 1 },
  boldTitle: { fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { fontSize: FontSize.sm, marginBottom: 4, lineHeight: 18 },
  time: { fontSize: FontSize.xs },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  clearText: { fontSize: FontSize.sm, color: '#EF4444', fontWeight: '500' },
});
