import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { Company, Customer, Vendor, Product, StockTransaction, Quotation, Invoice, Purchase, CreditNote, DebitNote } from '../types';

function uid(): string {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

function userDoc() {
  return doc(getFirestore(), 'users', uid());
}

function userCol(name: string) {
  return collection(getFirestore(), 'users', uid(), name);
}

// ── Company ──────────────────────────────────────────────────────────────────

export async function saveCompany(company: Company): Promise<void> {
  await setDoc(userDoc(), { company }, { merge: true });
}

export async function loadCompany(): Promise<Company | null> {
  const snap = await getDoc(userDoc());
  return (snap.data()?.company as Company) ?? null;
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function saveCustomer(customer: Customer): Promise<void> {
  await setDoc(doc(userCol('customers'), customer.id), customer);
}

export async function loadCustomers(): Promise<Customer[]> {
  const snap = await getDocs(userCol('customers'));
  return snap.docs.map((d) => d.data() as Customer);
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteDoc(doc(userCol('customers'), id));
}

// ── Vendors ───────────────────────────────────────────────────────────────────

export async function saveVendor(vendor: Vendor): Promise<void> {
  await setDoc(doc(userCol('vendors'), vendor.id), vendor);
}

export async function loadVendors(): Promise<Vendor[]> {
  const snap = await getDocs(userCol('vendors'));
  return snap.docs.map((d) => d.data() as Vendor);
}

export async function deleteVendor(id: string): Promise<void> {
  await deleteDoc(doc(userCol('vendors'), id));
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function saveProduct(product: Product): Promise<void> {
  await setDoc(doc(userCol('products'), product.id), product);
}

export async function loadProducts(): Promise<Product[]> {
  const snap = await getDocs(userCol('products'));
  return snap.docs.map((d) => d.data() as Product);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(userCol('products'), id));
}

// ── Stock Transactions ────────────────────────────────────────────────────────

export async function saveStockTransaction(tx: StockTransaction): Promise<void> {
  await setDoc(doc(userCol('stockTransactions'), tx.id), tx);
}

export async function loadStockTransactions(): Promise<StockTransaction[]> {
  const snap = await getDocs(userCol('stockTransactions'));
  return snap.docs.map((d) => d.data() as StockTransaction);
}

// ── Quotations ────────────────────────────────────────────────────────────────

export async function saveQuotation(quotation: Quotation): Promise<void> {
  await setDoc(doc(userCol('quotations'), quotation.id), quotation);
}

export async function loadQuotations(): Promise<Quotation[]> {
  const snap = await getDocs(userCol('quotations'));
  return snap.docs.map((d) => d.data() as Quotation);
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export async function saveInvoice(invoice: Invoice): Promise<void> {
  await setDoc(doc(userCol('invoices'), invoice.id), invoice);
}

export async function loadInvoices(): Promise<Invoice[]> {
  const snap = await getDocs(userCol('invoices'));
  return snap.docs.map((d) => d.data() as Invoice);
}

// ── Purchases ─────────────────────────────────────────────────────────────────

export async function savePurchase(purchase: Purchase): Promise<void> {
  await setDoc(doc(userCol('purchases'), purchase.id), purchase);
}

export async function loadPurchases(): Promise<Purchase[]> {
  const snap = await getDocs(userCol('purchases'));
  return snap.docs.map((d) => d.data() as Purchase);
}

// ── Credit Notes ──────────────────────────────────────────────────────────────

export async function saveCreditNote(note: CreditNote): Promise<void> {
  await setDoc(doc(userCol('creditNotes'), note.id), note);
}

export async function loadCreditNotes(): Promise<CreditNote[]> {
  const snap = await getDocs(userCol('creditNotes'));
  return snap.docs.map((d) => d.data() as CreditNote);
}

// ── Debit Notes ───────────────────────────────────────────────────────────────

export async function saveDebitNote(note: DebitNote): Promise<void> {
  await setDoc(doc(userCol('debitNotes'), note.id), note);
}

export async function loadDebitNotes(): Promise<DebitNote[]> {
  const snap = await getDocs(userCol('debitNotes'));
  return snap.docs.map((d) => d.data() as DebitNote);
}

// ── Bulk Sync ─────────────────────────────────────────────────────────────────

export async function syncAll(data: {
  company: Company | null;
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  stockTransactions: StockTransaction[];
  quotations: Quotation[];
  invoices: Invoice[];
  purchases: Purchase[];
  creditNotes: CreditNote[];
  debitNotes: DebitNote[];
}): Promise<void> {
  const db = getFirestore();
  const batch = writeBatch(db);

  if (data.company) {
    batch.set(userDoc(), { company: data.company }, { merge: true });
  }

  const writeAll = (colName: string, items: { id: string }[]) =>
    items.forEach((item) => batch.set(doc(userCol(colName), item.id), item));

  writeAll('customers', data.customers);
  writeAll('vendors', data.vendors);
  writeAll('products', data.products);
  writeAll('stockTransactions', data.stockTransactions);
  writeAll('quotations', data.quotations);
  writeAll('invoices', data.invoices);
  writeAll('purchases', data.purchases);
  writeAll('creditNotes', data.creditNotes);
  writeAll('debitNotes', data.debitNotes);

  await batch.commit();
}

// ── Image Upload ──────────────────────────────────────────────────────────────

export async function uploadImage(_uri: string, _path: string): Promise<string> {
  throw new Error('Image upload requires @react-native-firebase/storage.');
}
