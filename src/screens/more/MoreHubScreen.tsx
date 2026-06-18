import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';

const MENU_SECTIONS = [
  {
    title: 'Documents',
    items: [
      { label: 'Purchases', icon: 'cart-outline' as const, screen: 'PurchaseList', color: '#8B5CF6', bg: '#F5F3FF' },
      { label: 'Credit Notes', icon: 'remove-circle-outline' as const, screen: 'CreditNoteList', color: '#F59E0B', bg: '#FFFBEB' },
      { label: 'Debit Notes', icon: 'add-circle-outline' as const, screen: 'DebitNoteList', color: '#EF4444', bg: '#FEF2F2' },
    ],
  },
  {
    title: 'Contacts',
    items: [
      { label: 'Vendors', icon: 'business-outline' as const, screen: 'VendorList', color: '#0891B2', bg: '#ECFEFF' },
    ],
  },
  {
    title: 'Catalog & Inventory',
    items: [
      { label: 'Products & Services', icon: 'cube-outline' as const, screen: 'ProductList', color: '#0D9488', bg: '#F0FDFA' },
      { label: 'Inventory', icon: 'layers-outline' as const, screen: 'Inventory', color: '#8B5CF6', bg: '#F5F3FF' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Reports', icon: 'stats-chart-outline' as const, screen: 'Reports', color: '#0891B2', bg: '#ECFEFF' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Profile & Company', icon: 'person-circle-outline' as const, screen: 'Profile', color: '#0D9488', bg: '#F0FDFA' },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function MoreHubScreen({ navigation }: any) {
  const theme = useTheme();
  const { state } = useApp();
  const { customers, vendors, quotations, invoices, purchases, creditNotes, debitNotes, products, company } = state;

  const companyName = company?.companyName || 'Smart Billing';
  const companyLogo = company?.companyLogo;

  const summaryItems = [
    { label: 'Invoices', value: invoices.length, color: '#10B981', bg: '#ECFDF5', icon: 'receipt' as const },
    { label: 'Quotations', value: quotations.length, color: '#3B82F6', bg: '#EFF6FF', icon: 'document-text' as const },
    { label: 'Customers', value: customers.length, color: '#0D9488', bg: '#F0FDFA', icon: 'people' as const },
    { label: 'Vendors', value: vendors.length, color: '#0891B2', bg: '#ECFEFF', icon: 'business' as const },
    { label: 'Purchases', value: purchases.length, color: '#8B5CF6', bg: '#F5F3FF', icon: 'cart' as const },
    { label: 'Credit Notes', value: creditNotes.length, color: '#F59E0B', bg: '#FFFBEB', icon: 'remove-circle' as const },
    { label: 'Debit Notes', value: debitNotes.length, color: '#EF4444', bg: '#FEF2F2', icon: 'add-circle' as const },
    { label: 'Products', value: products.length, color: '#0D9488', bg: '#F0FDFA', icon: 'cube' as const },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Company Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatarWrap}>
          {companyLogo ? (
            <Image source={{ uri: companyLogo }} style={styles.profileAvatarImage} />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{getInitials(companyName)}</Text>
            </View>
          )}
          <View style={styles.profileBadge}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>{companyName}</Text>
          {company?.gstNumber ? (
            <Text style={styles.profileGst}>GST: {company.gstNumber}</Text>
          ) : null}
          {company?.email ? (
            <Text style={styles.profileEmail} numberOfLines={1}>{company.email}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.75}
        >
          <Ionicons name="pencil" size={16} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Summary Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.summaryRow}
        style={styles.summaryScroll}
      >
        {summaryItems.map((s, i) => (
          <View key={i} style={[styles.summaryChip, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon} size={18} color={s.color} />
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Menu Sections */}
      <View style={styles.menuContainer}>
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              {section.title}
            </Text>
            <View style={[styles.menuGroup, { backgroundColor: theme.colors.surface }]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.screen}
                  style={[
                    styles.menuRow,
                    idx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.colors.onSurface }]}>
                    {item.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingTop: 52,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  profileAvatarWrap: {
    position: 'relative',
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  profileAvatarText: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#fff',
  },
  profileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  profileGst: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 1,
  },
  profileEmail: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },

  /* Summary Row */
  summaryScroll: {
    backgroundColor: '#0D9488',
  },
  summaryRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 2,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  summaryValue: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },

  /* Menu */
  menuContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
  },
  menuSection: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: Spacing.xs,
    marginBottom: 2,
  },
  menuGroup: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
