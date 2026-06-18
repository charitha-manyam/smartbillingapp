import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  COMPANY: '@billing_company',
  CUSTOMERS: '@billing_customers',
  VENDORS: '@billing_vendors',
  PRODUCTS: '@billing_products',
  STOCK_TRANSACTIONS: '@billing_stock_transactions',
  QUOTATIONS: '@billing_quotations',
  INVOICES: '@billing_invoices',
  PURCHASES: '@billing_purchases',
  CREDIT_NOTES: '@billing_credit_notes',
  DEBIT_NOTES: '@billing_debit_notes',
  THEME: '@billing_theme',
  USER: '@billing_user',
};

export async function saveData(key: string, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export async function loadData<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.removeMany(Object.values(KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

export { KEYS };
