import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, Quotation, Invoice, Purchase, CreditNote, DebitNote, LineItem } from '../types';

export function useCustomers() {
  const { state, dispatch } = useApp();

  const customers = useMemo(() => state.customers, [state.customers]);

  const addCustomer = (customer: Customer) => {
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  };

  const updateCustomer = (customer: Customer) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
  };

  const deleteCustomer = (id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const getCustomer = (id: string) => {
    return customers.find((c) => c.id === id);
  };

  const searchCustomers = (query: string) => {
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  };

  return { customers, addCustomer, updateCustomer, deleteCustomer, getCustomer, searchCustomers };
}

export function useDocuments() {
  const { state, dispatch } = useApp();

  const quotations = useMemo(() => state.quotations, [state.quotations]);
  const invoices = useMemo(() => state.invoices, [state.invoices]);
  const purchases = useMemo(() => state.purchases, [state.purchases]);
  const creditNotes = useMemo(() => state.creditNotes, [state.creditNotes]);
  const debitNotes = useMemo(() => state.debitNotes, [state.debitNotes]);

  const addQuotation = (quotation: Quotation) => {
    dispatch({ type: 'ADD_QUOTATION', payload: quotation });
  };

  const updateQuotation = (quotation: Quotation) => {
    dispatch({ type: 'UPDATE_QUOTATION', payload: quotation });
  };

  const addInvoice = (invoice: Invoice) => {
    dispatch({ type: 'ADD_INVOICE', payload: invoice });
  };

  const updateInvoice = (invoice: Invoice) => {
    dispatch({ type: 'UPDATE_INVOICE', payload: invoice });
  };

  const addPurchase = (purchase: Purchase) => {
    dispatch({ type: 'ADD_PURCHASE', payload: purchase });
  };

  const updatePurchase = (purchase: Purchase) => {
    dispatch({ type: 'UPDATE_PURCHASE', payload: purchase });
  };

  const addCreditNote = (note: CreditNote) => {
    dispatch({ type: 'ADD_CREDIT_NOTE', payload: note });
  };

  const addDebitNote = (note: DebitNote) => {
    dispatch({ type: 'ADD_DEBIT_NOTE', payload: note });
  };

  const getQuotationsByDateRange = (startDate: string, endDate: string) => {
    return quotations.filter((q) => q.date >= startDate && q.date <= endDate);
  };

  const getInvoicesByDateRange = (startDate: string, endDate: string) => {
    return invoices.filter((inv) => inv.invoiceDate >= startDate && inv.invoiceDate <= endDate);
  };

  return {
    quotations,
    invoices,
    purchases,
    creditNotes,
    debitNotes,
    addQuotation,
    updateQuotation,
    addInvoice,
    updateInvoice,
    addPurchase,
    updatePurchase,
    addCreditNote,
    addDebitNote,
    getQuotationsByDateRange,
    getInvoicesByDateRange,
  };
}
