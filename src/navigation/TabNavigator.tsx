import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SalesHubScreen from '../screens/sales/SalesHubScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import AddCustomerScreen from '../screens/customers/AddCustomerScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import MoreHubScreen from '../screens/more/MoreHubScreen';
import CreateQuotationScreen from '../screens/quotations/CreateQuotationScreen';
import QuotationDetailScreen from '../screens/quotations/QuotationDetailScreen';
import CreateInvoiceScreen from '../screens/invoices/CreateInvoiceScreen';
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import PurchaseListScreen from '../screens/purchases/PurchaseListScreen';
import CreatePurchaseScreen from '../screens/purchases/CreatePurchaseScreen';
import PurchaseDetailScreen from '../screens/purchases/PurchaseDetailScreen';
import CreditNoteListScreen from '../screens/creditNotes/CreditNoteListScreen';
import CreateCreditNoteScreen from '../screens/creditNotes/CreateCreditNoteScreen';
import CreditNoteDetailScreen from '../screens/creditNotes/CreditNoteDetailScreen';
import DebitNoteListScreen from '../screens/debitNotes/DebitNoteListScreen';
import CreateDebitNoteScreen from '../screens/debitNotes/CreateDebitNoteScreen';
import DebitNoteDetailScreen from '../screens/debitNotes/DebitNoteDetailScreen';
import VendorListScreen from '../screens/vendors/VendorListScreen';
import AddVendorScreen from '../screens/vendors/AddVendorScreen';
import VendorDetailScreen from '../screens/vendors/VendorDetailScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SalesStack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTintColor: '#0F172A',
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <HomeStack.Screen name="CreateQuotation" component={CreateQuotationScreen} options={{ title: 'New Quotation' }} />
      <HomeStack.Screen name="CreateInvoice" component={CreateInvoiceScreen} options={{ title: 'New Invoice' }} />
      <HomeStack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Add Customer' }} />
      <HomeStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details' }} />
      <HomeStack.Screen name="QuotationDetail" component={QuotationDetailScreen} options={{ title: 'Quotation' }} />
      <HomeStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Invoice' }} />
      <HomeStack.Screen name="CreatePurchase" component={CreatePurchaseScreen} options={{ title: 'New Purchase' }} />
      <HomeStack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} options={{ title: 'Purchase' }} />
      <HomeStack.Screen name="CreditNoteDetail" component={CreditNoteDetailScreen} options={{ title: 'Credit Note' }} />
      <HomeStack.Screen name="DebitNoteDetail" component={DebitNoteDetailScreen} options={{ title: 'Debit Note' }} />
    </HomeStack.Navigator>
  );
}

function SalesStackScreen() {
  return (
    <SalesStack.Navigator screenOptions={screenOptions}>
      <SalesStack.Screen name="SalesHub" component={SalesHubScreen} options={{ title: 'Sales' }} />
      <SalesStack.Screen name="CreateQuotation" component={CreateQuotationScreen} options={{ title: 'New Quotation' }} />
      <SalesStack.Screen name="QuotationDetail" component={QuotationDetailScreen} options={{ title: 'Quotation' }} />
      <SalesStack.Screen name="CreateInvoice" component={CreateInvoiceScreen} options={{ title: 'New Invoice' }} />
      <SalesStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Invoice' }} />
    </SalesStack.Navigator>
  );
}

function CustomerStackScreen() {
  return (
    <CustomerStack.Navigator screenOptions={screenOptions}>
      <CustomerStack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
      <CustomerStack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Add Customer' }} />
      <CustomerStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details' }} />
    </CustomerStack.Navigator>
  );
}

function MoreStackScreen() {
  return (
    <MoreStack.Navigator screenOptions={screenOptions}>
      <MoreStack.Screen name="MoreHub" component={MoreHubScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="PurchaseList" component={PurchaseListScreen} options={{ title: 'Purchases' }} />
      <MoreStack.Screen name="CreatePurchase" component={CreatePurchaseScreen} options={{ title: 'New Purchase' }} />
      <MoreStack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} options={{ title: 'Purchase' }} />
      <MoreStack.Screen name="CreditNoteList" component={CreditNoteListScreen} options={{ title: 'Credit Notes' }} />
      <MoreStack.Screen name="CreateCreditNote" component={CreateCreditNoteScreen} options={{ title: 'New Credit Note' }} />
      <MoreStack.Screen name="CreditNoteDetail" component={CreditNoteDetailScreen} options={{ title: 'Credit Note' }} />
      <MoreStack.Screen name="DebitNoteList" component={DebitNoteListScreen} options={{ title: 'Debit Notes' }} />
      <MoreStack.Screen name="CreateDebitNote" component={CreateDebitNoteScreen} options={{ title: 'New Debit Note' }} />
      <MoreStack.Screen name="DebitNoteDetail" component={DebitNoteDetailScreen} options={{ title: 'Debit Note' }} />
      <MoreStack.Screen name="VendorList" component={VendorListScreen} options={{ title: 'Vendors' }} />
      <MoreStack.Screen name="AddVendor" component={AddVendorScreen} options={{ title: 'Add Vendor' }} />
      <MoreStack.Screen name="VendorDetail" component={VendorDetailScreen} options={{ title: 'Vendor Details' }} />
      <MoreStack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products & Services' }} />
      <MoreStack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add Product' }} />
      <MoreStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
      <MoreStack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <MoreStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </MoreStack.Navigator>
  );
}

type TabIcon = { focused: boolean; color: string; size: number };

export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.dark ? '#334155' : '#E2E8F0',
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }: TabIcon) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SalesTab"
        component={SalesStackScreen}
        options={{
          tabBarLabel: 'Sales',
          tabBarIcon: ({ focused, color, size }: TabIcon) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CustomersTab"
        component={CustomerStackScreen}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ focused, color, size }: TabIcon) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color, size }: TabIcon) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
