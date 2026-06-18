import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getInitials } from '../../utils';

const BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3;

const QUICK_ACTIONS = [
  { label: 'New Quotation', icon: 'document-text' as const, screen: 'CreateQuotation', color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'New Invoice',   icon: 'receipt'        as const, screen: 'CreateInvoice',   color: '#10B981', bg: '#ECFDF5' },
  { label: 'New Customer',  icon: 'person-add'     as const, screen: 'AddCustomer',     color: '#0D9488', bg: '#F0FDFA' },
  { label: 'New Purchase',  icon: 'cart'           as const, screen: 'CreatePurchase',  color: '#8B5CF6', bg: '#F5F3FF' },
];

export default function DashboardScreen({ navigation }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const { customers, vendors, quotations, invoices, purchases, creditNotes, debitNotes } = state;

  const companyName = state.company?.companyName || 'Smart Billing';
  const companyLogo = state.company?.companyLogo;
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const summaryData = [
    { title: 'Quotations',   value: quotations.length,   icon: 'document-text'  as const, color: '#3B82F6', tab: 'SalesTab',     screen: undefined as string | undefined },
    { title: 'Invoices',     value: invoices.length,     icon: 'receipt'        as const, color: '#10B981', tab: 'SalesTab',     screen: undefined as string | undefined },
    { title: 'Purchases',    value: purchases.length,    icon: 'cart'           as const, color: '#8B5CF6', tab: 'MoreTab',      screen: 'PurchaseList' as string | undefined },
    { title: 'Credit Notes', value: creditNotes.length,  icon: 'remove-circle'  as const, color: '#F59E0B', tab: 'MoreTab',      screen: 'CreditNoteList' as string | undefined },
    { title: 'Debit Notes',  value: debitNotes.length,   icon: 'add-circle'     as const, color: '#EF4444', tab: 'MoreTab',      screen: 'DebitNoteList' as string | undefined },
    { title: 'Customers',    value: customers.length,    icon: 'people'         as const, color: '#06B6D4', tab: 'CustomersTab', screen: undefined as string | undefined },
    { title: 'Vendors',      value: vendors.length,      icon: 'business'       as const, color: '#0891B2', tab: 'MoreTab',      screen: 'VendorList' as string | undefined },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Clean Top Header ── */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerLeft}>
          {companyLogo ? (
            <Image source={{ uri: companyLogo }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(companyName)}</Text>
            </View>
          )}
          <View style={styles.companyNameWrap}>
            <Text style={[styles.companyName, { color: theme.colors.onSurface }]}>
              {companyName}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color="#94A3B8" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Greeting Banner ── */}
      <View style={styles.greetBanner}>
        <Text style={styles.greetTitle}>Good day! 👋</Text>
        <Text style={styles.greetSub}>Here's your business at a glance</Text>
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.colors.onSurface }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Overview Grid ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Overview</Text>
        {Array.from({ length: Math.ceil(summaryData.length / 3) }).map((_, row) => {
          const rowItems = summaryData.slice(row * 3, row * 3 + 3);
          return (
            <View key={row} style={[styles.overviewRow, rowItems.length < 3 && styles.overviewRowCentered]}>
              {rowItems.map((item, col) => (
                <TouchableOpacity
                  key={col}
                  style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}
                  onPress={() =>
                    item.screen
                      ? navigation.navigate(item.tab, { screen: item.screen })
                      : navigation.navigate(item.tab)
                  }
                  activeOpacity={0.75}
                >
                  <View style={[styles.overviewIconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={[styles.overviewValue, { color: theme.colors.onSurface }]}>
                    {item.value}
                  </Text>
                  <Text style={[styles.overviewTitle, { color: theme.colors.onSurfaceVariant }]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>

      <View style={styles.bannerContainer}>
        <BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 52,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...Shadow.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#fff',
  },
  companyNameWrap: {
    flex: 1,
    flexShrink: 1,
  },
  companyName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    flexWrap: 'wrap',
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },

  greetBanner: {
    backgroundColor: '#0D9488',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  greetTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  greetSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.78)',
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },

  overviewGrid: {
    marginBottom: Spacing.xl,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  overviewRowCentered: {
    justifyContent: 'flex-start',
    gap: Spacing.sm,
  },
  overviewCard: {
    width: CARD_W,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    ...Shadow.sm,
  },
  overviewIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  overviewValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: 2,
  },
  overviewTitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  bannerContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
});
