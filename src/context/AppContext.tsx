import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Company, Customer, Vendor, Product, StockTransaction, Quotation, Invoice, Purchase, CreditNote, DebitNote, AppNotification } from '../types';
import * as firestoreService from '../services/firestore';
import { saveData, loadData, KEYS } from '../services/storage';
import { sendLocalNotification, setupNotifications, setBadgeCount, scheduleEveningMotivation, DaySummary } from '../services/pushNotifications';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Get this from Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration
const WEB_CLIENT_ID = '788769136251-nt6jtm7d64j6d12oqem5a2b0n4simth8.apps.googleusercontent.com';

interface AppState {
  isAuthenticated: boolean;
  isDarkMode: boolean;
  user: { name: string; email: string; phone: string; uid?: string } | null;
  company: Company | null;
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  stockTransactions: StockTransaction[];
  notifications: AppNotification[];
  quotations: Quotation[];
  invoices: Invoice[];
  purchases: Purchase[];
  creditNotes: CreditNote[];
  debitNotes: DebitNote[];
  isLoading: boolean;
  isOnline: boolean;
}

type Action =
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'SET_COMPANY'; payload: Company }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_VENDORS'; payload: Vendor[] }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'UPDATE_VENDOR'; payload: Vendor }
  | { type: 'DELETE_VENDOR'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_STOCK_TRANSACTIONS'; payload: StockTransaction[] }
  | { type: 'ADD_STOCK_TRANSACTION'; payload: StockTransaction }
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_QUOTATIONS'; payload: Quotation[] }
  | { type: 'ADD_QUOTATION'; payload: Quotation }
  | { type: 'UPDATE_QUOTATION'; payload: Quotation }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'SET_PURCHASES'; payload: Purchase[] }
  | { type: 'ADD_PURCHASE'; payload: Purchase }
  | { type: 'UPDATE_PURCHASE'; payload: Purchase }
  | { type: 'SET_CREDIT_NOTES'; payload: CreditNote[] }
  | { type: 'ADD_CREDIT_NOTE'; payload: CreditNote }
  | { type: 'UPDATE_CREDIT_NOTE'; payload: CreditNote }
  | { type: 'SET_DEBIT_NOTES'; payload: DebitNote[] }
  | { type: 'ADD_DEBIT_NOTE'; payload: DebitNote }
  | { type: 'UPDATE_DEBIT_NOTE'; payload: DebitNote }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  isAuthenticated: false,
  isDarkMode: false,
  user: null,
  company: null,
  customers: [],
  vendors: [],
  products: [],
  stockTransactions: [],
  notifications: [],
  quotations: [],
  invoices: [],
  purchases: [],
  creditNotes: [],
  debitNotes: [],
  isLoading: false,
  isOnline: true,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_COMPANY':
      return { ...state, company: action.payload };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [action.payload, ...state.customers] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload),
      };
    case 'SET_VENDORS':
      return { ...state, vendors: action.payload };
    case 'ADD_VENDOR':
      return { ...state, vendors: [action.payload, ...state.vendors] };
    case 'UPDATE_VENDOR':
      return {
        ...state,
        vendors: state.vendors.map((v) =>
          v.id === action.payload.id ? action.payload : v
        ),
      };
    case 'DELETE_VENDOR':
      return {
        ...state,
        vendors: state.vendors.filter((v) => v.id !== action.payload),
      };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map((p) => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };
    case 'SET_STOCK_TRANSACTIONS':
      return { ...state, stockTransactions: action.payload };
    case 'ADD_STOCK_TRANSACTION':
      return { ...state, stockTransactions: [action.payload, ...state.stockTransactions] };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_QUOTATIONS':
      return { ...state, quotations: action.payload };
    case 'ADD_QUOTATION':
      return { ...state, quotations: [action.payload, ...state.quotations] };
    case 'UPDATE_QUOTATION':
      return {
        ...state,
        quotations: state.quotations.map((q) =>
          q.id === action.payload.id ? action.payload : q
        ),
      };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_INVOICE':
      return { ...state, invoices: [action.payload, ...state.invoices] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.payload.id ? action.payload : inv
        ),
      };
    case 'SET_PURCHASES':
      return { ...state, purchases: action.payload };
    case 'ADD_PURCHASE':
      return { ...state, purchases: [action.payload, ...state.purchases] };
    case 'UPDATE_PURCHASE':
      return {
        ...state,
        purchases: state.purchases.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'SET_CREDIT_NOTES':
      return { ...state, creditNotes: action.payload };
    case 'ADD_CREDIT_NOTE':
      return { ...state, creditNotes: [action.payload, ...state.creditNotes] };
    case 'UPDATE_CREDIT_NOTE':
      return {
        ...state,
        creditNotes: state.creditNotes.map((cn) =>
          cn.id === action.payload.id ? action.payload : cn
        ),
      };
    case 'SET_DEBIT_NOTES':
      return { ...state, debitNotes: action.payload };
    case 'ADD_DEBIT_NOTE':
      return { ...state, debitNotes: [action.payload, ...state.debitNotes] };
    case 'UPDATE_DEBIT_NOTE':
      return {
        ...state,
        debitNotes: state.debitNotes.map((dn) =>
          dn.id === action.payload.id ? action.payload : dn
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'LOGOUT':
      return { ...initialState, isAuthenticated: false, isDarkMode: state.isDarkMode };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  toggleDarkMode: () => void;
  syncToFirestore: () => Promise<void>;
  loadFromFirestore: () => Promise<void>;
  uploadImage: (uri: string, path: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(appReducer, initialState);

  // Smart dispatch: intercepts document-creation actions to auto-generate notifications
  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);

    let title = '';
    let body = '';
    let type: AppNotification['type'] = 'general';
    let relatedId: string | undefined;

    switch (action.type) {
      case 'ADD_INVOICE':
        title = 'Invoice Created';
        body = `Invoice ${action.payload.invoiceNumber} for ${action.payload.customerName}`;
        type = 'invoice'; relatedId = action.payload.id; break;
      case 'UPDATE_INVOICE':
        if (action.payload.status === 'paid') {
          title = 'Invoice Paid'; body = `Invoice ${action.payload.invoiceNumber} marked as paid`;
          type = 'invoice'; relatedId = action.payload.id;
        } break;
      case 'ADD_QUOTATION':
        title = 'Quotation Created';
        body = `Quotation ${action.payload.quotationNumber} for ${action.payload.customerName}`;
        type = 'quotation'; relatedId = action.payload.id; break;
      case 'ADD_PURCHASE':
        title = 'Purchase Recorded';
        body = `Bill ${action.payload.billNumber} from ${action.payload.vendorName}`;
        type = 'purchase'; relatedId = action.payload.id; break;
      case 'ADD_CREDIT_NOTE':
        title = 'Credit Note Created';
        body = `Credit Note ${action.payload.creditNoteNumber} for ${action.payload.customerName}`;
        type = 'credit_note'; relatedId = action.payload.id; break;
      case 'ADD_DEBIT_NOTE':
        title = 'Debit Note Created';
        body = `Debit Note ${action.payload.debitNoteNumber} for ${action.payload.vendorName}`;
        type = 'debit_note'; relatedId = action.payload.id; break;
      case 'ADD_CUSTOMER':
        title = 'Customer Added';
        body = `${action.payload.customerName} added to contacts`;
        type = 'customer'; relatedId = action.payload.id; break;
      case 'ADD_VENDOR':
        title = 'Vendor Added';
        body = `${action.payload.vendorName} added to contacts`;
        type = 'vendor'; relatedId = action.payload.id; break;
    }

    if (title) {
      const notif: AppNotification = {
        id: Date.now().toString(),
        title,
        body,
        type,
        relatedId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      rawDispatch({ type: 'ADD_NOTIFICATION', payload: notif });
      sendLocalNotification(title, body);

      // Refresh evening summary with updated today counts
      // Use a small delay so the reducer has processed the new item
      const isDocAction = [
        'ADD_INVOICE', 'ADD_QUOTATION', 'ADD_PURCHASE',
        'ADD_CREDIT_NOTE', 'ADD_DEBIT_NOTE', 'ADD_CUSTOMER', 'ADD_VENDOR',
      ].includes(action.type);
      if (isDocAction) {
        setTimeout(() => refreshEveningSummary(), 200);
      }
    }
  }, [rawDispatch]);

  // Auto-save individual documents to Firestore silently
  useEffect(() => {
    if (!state.isOnline) return;
    const last = state.invoices[0];
    if (last) firestoreService.saveInvoice(last).catch(() => {});
  }, [state.invoices]);

  useEffect(() => {
    if (!state.isOnline) return;
    const last = state.quotations[0];
    if (last) firestoreService.saveQuotation(last).catch(() => {});
  }, [state.quotations]);

  useEffect(() => {
    if (!state.isOnline) return;
    const last = state.purchases[0];
    if (last) firestoreService.savePurchase(last).catch(() => {});
  }, [state.purchases]);

  useEffect(() => {
    if (!state.isOnline) return;
    const last = state.customers[0];
    if (last) firestoreService.saveCustomer(last).catch(() => {});
  }, [state.customers]);

  useEffect(() => {
    if (!state.isOnline) return;
    const last = state.vendors[0];
    if (last) firestoreService.saveVendor(last).catch(() => {});
  }, [state.vendors]);

  useEffect(() => {
    if (!state.isOnline) return;
    const last = state.products[0];
    if (last) firestoreService.saveProduct(last).catch(() => {});
  }, [state.products]);

  useEffect(() => {
    if (!state.isOnline) return;
    const last = state.stockTransactions[0];
    if (last) firestoreService.saveStockTransaction(last).catch(() => {});
  }, [state.stockTransactions]);

  useEffect(() => {
    if (!state.isOnline || !state.company) return;
    firestoreService.saveCompany(state.company).catch(() => {});
  }, [state.company]);

  // Compute today's document counts and reschedule the evening notification
  const refreshEveningSummary = useCallback(() => {
    const today = new Date().toDateString();
    const isToday = (iso: string) => new Date(iso).toDateString() === today;
    const summary: DaySummary = {
      invoices:    state.invoices.filter((x) => isToday(x.createdAt)).length,
      quotations:  state.quotations.filter((x) => isToday(x.createdAt)).length,
      purchases:   state.purchases.filter((x) => isToday(x.createdAt)).length,
      customers:   state.customers.filter((x) => isToday(x.createdAt)).length,
      vendors:     state.vendors.filter((x) => isToday(x.createdAt)).length,
      creditNotes: state.creditNotes.filter((x) => isToday(x.createdAt)).length,
      debitNotes:  state.debitNotes.filter((x) => isToday(x.createdAt)).length,
    };
    scheduleEveningMotivation(summary);
  }, [state]);

  // Update badge count when notifications change
  useEffect(() => {
    const unread = state.notifications.filter((n) => !n.read).length;
    setBadgeCount(unread);
  }, [state.notifications]);

  // Firebase auth state listener — source of truth for authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        const storedUser = await loadData<any>(KEYS.USER);
        rawDispatch({
          type: 'SET_USER',
          payload: {
            name: storedUser?.name || firebaseUser.displayName || 'User',
            email: storedUser?.email || firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || storedUser?.phone || '',
            uid: firebaseUser.uid,
          },
        });
        rawDispatch({ type: 'SET_AUTH', payload: true });
        rawDispatch({ type: 'SET_ONLINE', payload: true });
      } else {
        rawDispatch({ type: 'SET_AUTH', payload: false });
      }
    });
    return unsubscribe;
  }, []);

  // Load app data from AsyncStorage on mount
  useEffect(() => {
    async function loadLocal() {
      rawDispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [company, customers, vendors, products, stockTransactions, quotations, invoices, purchases, creditNotes, debitNotes] =
          await Promise.all([
            loadData<any>(KEYS.COMPANY),
            loadData<any[]>(KEYS.CUSTOMERS),
            loadData<any[]>(KEYS.VENDORS),
            loadData<any[]>(KEYS.PRODUCTS),
            loadData<any[]>(KEYS.STOCK_TRANSACTIONS),
            loadData<any[]>(KEYS.QUOTATIONS),
            loadData<any[]>(KEYS.INVOICES),
            loadData<any[]>(KEYS.PURCHASES),
            loadData<any[]>(KEYS.CREDIT_NOTES),
            loadData<any[]>(KEYS.DEBIT_NOTES),
          ]);
        if (company)            rawDispatch({ type: 'SET_COMPANY', payload: company });
        if (customers)          rawDispatch({ type: 'SET_CUSTOMERS', payload: customers });
        if (vendors)            rawDispatch({ type: 'SET_VENDORS', payload: vendors });
        if (products)           rawDispatch({ type: 'SET_PRODUCTS', payload: products });
        if (stockTransactions)  rawDispatch({ type: 'SET_STOCK_TRANSACTIONS', payload: stockTransactions });
        if (quotations)         rawDispatch({ type: 'SET_QUOTATIONS', payload: quotations });
        if (invoices)           rawDispatch({ type: 'SET_INVOICES', payload: invoices });
        if (purchases)          rawDispatch({ type: 'SET_PURCHASES', payload: purchases });
        if (creditNotes)        rawDispatch({ type: 'SET_CREDIT_NOTES', payload: creditNotes });
        if (debitNotes)         rawDispatch({ type: 'SET_DEBIT_NOTES', payload: debitNotes });
      } catch (e) {
        console.warn('Local storage load failed', e);
      } finally {
        rawDispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadLocal();
  }, []);

  // Auto-save to AsyncStorage whenever data changes
  useEffect(() => {
    if (state.company)                   saveData(KEYS.COMPANY, state.company);
    if (state.customers.length)          saveData(KEYS.CUSTOMERS, state.customers);
    if (state.vendors.length)            saveData(KEYS.VENDORS, state.vendors);
    if (state.products.length)           saveData(KEYS.PRODUCTS, state.products);
    if (state.stockTransactions.length)  saveData(KEYS.STOCK_TRANSACTIONS, state.stockTransactions);
    if (state.quotations.length)         saveData(KEYS.QUOTATIONS, state.quotations);
    if (state.invoices.length)           saveData(KEYS.INVOICES, state.invoices);
    if (state.purchases.length)          saveData(KEYS.PURCHASES, state.purchases);
    if (state.creditNotes.length)        saveData(KEYS.CREDIT_NOTES, state.creditNotes);
    if (state.debitNotes.length)         saveData(KEYS.DEBIT_NOTES, state.debitNotes);
    if (state.user)                      saveData(KEYS.USER, state.user);
  }, [state.company, state.customers, state.vendors, state.products, state.stockTransactions,
      state.quotations, state.invoices, state.purchases, state.creditNotes, state.debitNotes, state.user]);

  useEffect(() => {
    setupNotifications().then((granted) => {
      if (granted) refreshEveningSummary();
    });
  }, []);


  useEffect(() => {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  }, []);

  const googleLogin = useCallback(async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    const idToken = (response as any)?.data?.idToken ?? (response as any)?.idToken;
    if (!idToken) throw new Error('Google Sign-In cancelled or failed');
    const credential = GoogleAuthProvider.credential(idToken);
    await getAuth().signInWithCredential(credential);
    // onAuthStateChanged handles SET_USER and SET_AUTH automatically
  }, []);

  const logout = useCallback(() => {
    signOut(getAuth()).catch(() => {});
    GoogleSignin.signOut().catch(() => {});
    dispatch({ type: 'LOGOUT' });
  }, []);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, []);

  const syncToFirestore = useCallback(async () => {
    try {
      await firestoreService.syncAll({
        company: state.company,
        customers: state.customers,
        vendors: state.vendors,
        products: state.products,
        stockTransactions: state.stockTransactions,
        quotations: state.quotations,
        invoices: state.invoices,
        purchases: state.purchases,
        creditNotes: state.creditNotes,
        debitNotes: state.debitNotes,
      });
      dispatch({ type: 'SET_ONLINE', payload: true });
    } catch (error) {
      console.warn('Firestore sync failed:', error);
      dispatch({ type: 'SET_ONLINE', payload: false });
    }
  }, [state]);

  const loadFromFirestore = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [company, customers, vendors, products, stockTransactions, quotations, invoices, purchases, creditNotes, debitNotes] =
        await Promise.all([
          firestoreService.loadCompany(),
          firestoreService.loadCustomers(),
          firestoreService.loadVendors(),
          firestoreService.loadProducts(),
          firestoreService.loadStockTransactions(),
          firestoreService.loadQuotations(),
          firestoreService.loadInvoices(),
          firestoreService.loadPurchases(),
          firestoreService.loadCreditNotes(),
          firestoreService.loadDebitNotes(),
        ]);
      if (company) dispatch({ type: 'SET_COMPANY', payload: company });
      dispatch({ type: 'SET_CUSTOMERS', payload: customers });
      dispatch({ type: 'SET_VENDORS', payload: vendors });
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_STOCK_TRANSACTIONS', payload: stockTransactions });
      dispatch({ type: 'SET_QUOTATIONS', payload: quotations });
      dispatch({ type: 'SET_INVOICES', payload: invoices });
      dispatch({ type: 'SET_PURCHASES', payload: purchases });
      dispatch({ type: 'SET_CREDIT_NOTES', payload: creditNotes });
      dispatch({ type: 'SET_DEBIT_NOTES', payload: debitNotes });
      dispatch({ type: 'SET_ONLINE', payload: true });
    } catch (error) {
      console.warn('Failed to load from Firestore:', error);
      dispatch({ type: 'SET_ONLINE', payload: false });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const uploadImage = useCallback(async (uri: string, path: string): Promise<string> => {
    return firestoreService.uploadImage(uri, path);
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      googleLogin,
      logout,
      toggleDarkMode,
      syncToFirestore,
      loadFromFirestore,
      uploadImage,
    }),
    [state, dispatch, googleLogin, logout, toggleDarkMode, syncToFirestore, loadFromFirestore, uploadImage]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
