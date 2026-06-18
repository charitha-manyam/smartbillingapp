export interface Company {
  id: string;
  companyName: string;
  companyLogo?: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  email: string;
  phoneNumber: string;
  bankDetails: string;
  termsConditions: string;
  digitalSignature?: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  gstNumber: string;
  address: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  vendorName: string;
  mobileNumber: string;
  email: string;
  gstNumber: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  hsnCode: string;
  unitPrice: number;
  gstPercentage: number;
  unit: string;
  type: 'product' | 'service';
  stockQuantity: number;
  minStockAlert: number;
  createdAt: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  balanceAfter: number;
  reason: string;
  referenceId?: string;
  referenceType?: 'invoice' | 'purchase' | 'manual';
  date: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  itemName: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  gstPercentage: number;
  discountPercentage: number;
  productId?: string;
}

export interface CalculatedLineItem extends LineItem {
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'other';
  notes: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerGst: string;
  customerAddress: string;
  lineItems: LineItem[];
  notes: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  createdAt: string;
}

export type InvoiceTemplate = 'classic' | 'modern' | 'minimal';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerGst: string;
  customerAddress: string;
  lineItems: LineItem[];
  notes: string;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  payments: Payment[];
  quotationId?: string;
  createdAt: string;
  invoiceTemplate?: InvoiceTemplate;
}

export interface Purchase {
  id: string;
  vendorName: string;
  vendorGstNumber: string;
  billNumber: string;
  date: string;
  lineItems: LineItem[];
  notes: string;
  status: 'draft' | 'completed';
  createdAt: string;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  reason: string;
  amount: number;
  status: 'draft' | 'issued';
  invoiceId?: string;
  createdAt: string;
}

export interface DebitNote {
  id: string;
  debitNoteNumber: string;
  vendorName: string;
  date: string;
  reason: string;
  amount: number;
  status: 'draft' | 'issued';
  purchaseId?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'invoice' | 'quotation' | 'purchase' | 'credit_note' | 'debit_note' | 'customer' | 'vendor' | 'general';
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface ReportFilter {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Main: undefined;
  Dashboard: undefined;
  CustomerList: undefined;
  AddCustomer: { customer?: Customer } | undefined;
  CustomerDetail: { customerId: string };
  QuotationList: undefined;
  CreateQuotation: undefined;
  QuotationDetail: { quotationId: string };
  InvoiceList: undefined;
  CreateInvoice: { quotationId?: string } | undefined;
  InvoiceDetail: { invoiceId: string };
  PurchaseList: undefined;
  CreatePurchase: undefined;
  VendorList: undefined;
  AddVendor: { vendor?: Vendor } | undefined;
  VendorDetail: { vendorId: string };
  PurchaseDetail: { purchaseId: string };
  CreditNoteList: undefined;
  CreateCreditNote: undefined;
  CreditNoteDetail: { creditNoteId: string };
  DebitNoteList: undefined;
  CreateDebitNote: undefined;
  DebitNoteDetail: { debitNoteId: string };
  ProductList: undefined;
  AddProduct: { product?: Product } | undefined;
  ProductDetail: { productId: string };
  Inventory: undefined;
  Reports: undefined;
  Profile: undefined;
};
