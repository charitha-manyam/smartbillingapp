import { Company, LineItem, Quotation, Invoice, Purchase, CreditNote, DebitNote, InvoiceTemplate } from '../types';
import { calculateTotals } from '../utils';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function lineItemsToHtml(items: LineItem[]): string {
  const { calculatedItems, grandTotal } = calculateTotals(items);
  const rows = calculatedItems
    .map(
      (item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.itemName}${item.description ? `<br/><small>${item.description}</small>` : ''}</td>
      <td>${item.hsnCode || '—'}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td>${item.gstPercentage}%</td>
      <td>${item.discountPercentage}%</td>
      <td>${formatCurrency(item.total)}</td>
    </tr>`
    )
    .join('');

  return `
    <table class="items-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Item / Description</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>GST</th>
          <th>Disc</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="total-section">
      <div class="total-row"><span>Subtotal:</span><span>${formatCurrency(calculatedItems.reduce((s, i) => s + i.subtotal, 0))}</span></div>
      <div class="total-row"><span>Discount:</span><span>-${formatCurrency(calculatedItems.reduce((s, i) => s + i.discountAmount, 0))}</span></div>
      <div class="total-row"><span>GST:</span><span>${formatCurrency(calculatedItems.reduce((s, i) => s + i.gstAmount, 0))}</span></div>
      <div class="grand-total"><span>Grand Total:</span><span>${formatCurrency(grandTotal)}</span></div>
    </div>`;
}

function headerFooterHtml(company: Company | null, title: string): { header: string; footer: string } {
  const logo = company?.companyLogo;
  const sig  = company?.digitalSignature;

  const header = `
    <div class="company-header">
      ${logo ? `<div class="logo-wrap"><img src="${logo}" class="company-logo" alt="logo"/></div>` : ''}
      <div class="company-info">
        ${company?.companyName  ? `<h1>${company.companyName}</h1>`           : ''}
        ${company?.address      ? `<p>${company.address}</p>`                 : ''}
        ${company?.email        ? `<p>Email: ${company.email}</p>`            : ''}
        ${company?.phoneNumber  ? `<p>Phone: ${company.phoneNumber}</p>`      : ''}
        ${company?.gstNumber    ? `<p>GSTIN: ${company.gstNumber}</p>`        : ''}
        ${company?.panNumber    ? `<p>PAN: ${company.panNumber}</p>`          : ''}
      </div>
    </div>
    <h2 class="doc-title">${title}</h2>`;

  const footer = `
    <div class="footer">
      ${company?.bankDetails
        ? `<div class="bank-details"><strong>Bank Details:</strong> ${company.bankDetails}</div>`
        : ''}
      ${company?.termsConditions
        ? `<div class="terms"><strong>Terms &amp; Conditions:</strong> ${company.termsConditions}</div>`
        : ''}
      ${sig ? `
        <div class="signature">
          <img src="${sig}" class="signature-img" alt="Signature"/>
          <p class="sig-label">Authorized Signatory</p>
          ${company?.companyName ? `<p class="sig-name">${company.companyName}</p>` : ''}
        </div>` : ''}
      <div class="page-footer">This is a computer-generated document</div>
    </div>`;

  return { header, footer };
}

/* ── Styles ─────────────────────────────────────────────────────────── */

function getClassicStyles(): string {
  return `
    <style>
      @page { margin: 20px; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Helvetica', Arial, sans-serif; font-size: 12px; color: #333; padding: 20px; }

      /* Header */
      .company-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #111; }
      .logo-wrap { flex-shrink: 0; }
      .company-logo { width: 72px; height: 72px; object-fit: contain; border-radius: 6px; }
      .company-info { flex: 1; }
      .company-info h1 { font-size: 22px; color: #111; margin-bottom: 4px; }
      .company-info p  { font-size: 11px; color: #555; margin: 2px 0; }

      .doc-title { text-align: center; font-size: 18px; color: #111; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
      .doc-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .doc-info .left, .doc-info .right { width: 48%; }
      .doc-info p { margin: 3px 0; font-size: 11px; }
      .info-label { color: #666; }
      .customer-section { margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #111; }
      .customer-section h3 { font-size: 13px; color: #111; margin-bottom: 5px; }
      .customer-section p  { font-size: 11px; color: #555; margin: 2px 0; }

      table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
      table.items-table th { background: #111; color: white; padding: 8px 5px; font-size: 10px; text-align: left; }
      table.items-table td { padding: 6px 5px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
      table.items-table tr:nth-child(even) { background: #f8f9fa; }
      table.items-table small { color: #999; }

      .total-section { width: 300px; margin-left: auto; margin-bottom: 20px; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
      .grand-total { display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; font-weight: bold; border-top: 2px solid #111; margin-top: 4px; color: #111; }

      /* Footer */
      .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; }
      .bank-details { margin-bottom: 8px; font-size: 10px; color: #666; }
      .terms        { margin-bottom: 8px; font-size: 10px; color: #666; }
      .signature    { text-align: right; margin-top: 16px; }
      .signature-img { height: 64px; max-width: 220px; object-fit: contain; display: block; margin-left: auto; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
      .sig-label    { font-size: 10px; color: #666; margin-top: 4px; }
      .sig-name     { font-size: 11px; font-weight: 600; color: #333; margin-top: 2px; }
      .page-footer  { text-align: center; margin-top: 20px; font-size: 9px; color: #999; }
      .note-section { margin-top: 10px; font-size: 11px; color: #666; padding: 8px; background: #fff3cd; border-radius: 4px; }
    </style>`;
}

function getModernStyles(): string {
  return `
    <style>
      @page { margin: 15px; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 30px; background: #f1f5f9; }
      .invoice-wrap { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }

      /* Header – logo left, info right */
      .company-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 3px solid #0D9488; }
      .logo-wrap { flex-shrink: 0; }
      .company-logo { width: 72px; height: 72px; object-fit: contain; border-radius: 10px; }
      .company-info { text-align: right; flex: 1; padding-left: 16px; }
      .company-info h1 { font-size: 24px; color: #0D9488; margin-bottom: 4px; letter-spacing: -0.5px; }
      .company-info p  { font-size: 10px; color: #64748b; margin: 1px 0; }

      .doc-title { font-size: 16px; color: #0D9488; margin-bottom: 20px; font-weight: 700; }
      .doc-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f0fdfa; padding: 12px 16px; border-radius: 8px; }
      .doc-info p { margin: 2px 0; font-size: 10px; color: #334155; }
      .info-label { color: #0D9488; font-weight: 600; }
      .customer-section { margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
      .customer-section h3 { font-size: 12px; color: #0D9488; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
      .customer-section p  { font-size: 11px; color: #334155; margin: 2px 0; }

      table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border-radius: 8px; overflow: hidden; }
      table.items-table th { background: #0D9488; color: white; padding: 9px 7px; font-size: 10px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
      table.items-table td { padding: 7px; border-bottom: 1px solid #f1f5f9; font-size: 10px; }
      table.items-table tr:nth-child(even) { background: #f8fafc; }
      table.items-table small { color: #94a3b8; }

      .total-section { width: 300px; margin-left: auto; margin-bottom: 20px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
      .grand-total { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; font-weight: bold; border-top: 2px solid #0D9488; margin-top: 4px; color: #0D9488; }

      /* Footer */
      .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
      .bank-details { margin-bottom: 6px; font-size: 10px; color: #64748b; }
      .terms        { margin-bottom: 6px; font-size: 10px; color: #64748b; }
      .signature    { text-align: right; margin-top: 16px; }
      .signature-img { height: 64px; max-width: 220px; object-fit: contain; display: block; margin-left: auto; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
      .sig-label    { font-size: 9px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
      .sig-name     { font-size: 11px; font-weight: 600; color: #0D9488; margin-top: 2px; }
      .page-footer  { text-align: center; margin-top: 16px; font-size: 8px; color: #94a3b8; }
      .note-section { margin-top: 10px; font-size: 10px; color: #64748b; padding: 10px; background: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b; }
    </style>`;
}

function getMinimalStyles(): string {
  return `
    <style>
      @page { margin: 10px; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Avenir', 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #333; padding: 40px; background: #fff; }

      /* Header */
      .company-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
      .logo-wrap { flex-shrink: 0; }
      .company-logo { width: 60px; height: 60px; object-fit: contain; }
      .company-info { flex: 1; }
      .company-info h1 { font-size: 20px; color: #000; margin-bottom: 2px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
      .company-info p  { font-size: 9px; color: #999; margin: 1px 0; }

      .doc-title { font-size: 13px; color: #999; margin-bottom: 24px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; }
      .doc-info { display: flex; justify-content: space-between; margin-bottom: 24px; padding: 16px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
      .doc-info p { margin: 2px 0; font-size: 10px; color: #666; }
      .info-label { color: #999; }
      .customer-section { margin-bottom: 24px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
      .customer-section h3 { font-size: 10px; color: #999; margin-bottom: 6px; letter-spacing: 1px; text-transform: uppercase; }
      .customer-section p  { font-size: 12px; color: #333; margin: 2px 0; }

      table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      table.items-table th { padding: 8px 4px; font-size: 9px; color: #999; text-align: left; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #eee; }
      table.items-table td { padding: 8px 4px; border-bottom: 1px solid #f5f5f5; font-size: 11px; color: #444; }
      table.items-table tr:last-child td { border-bottom: none; }
      table.items-table small { color: #bbb; }

      .total-section { width: 280px; margin-left: auto; margin-bottom: 20px; }
      .total-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 10px; color: #666; }
      .grand-total { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; font-weight: 500; border-top: 1px solid #333; margin-top: 4px; color: #000; }

      /* Footer */
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
      .bank-details { margin-bottom: 6px; font-size: 9px; color: #999; }
      .terms        { margin-bottom: 6px; font-size: 9px; color: #999; }
      .signature    { text-align: right; margin-top: 20px; }
      .signature-img { height: 60px; max-width: 200px; object-fit: contain; display: block; margin-left: auto; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
      .sig-label    { font-size: 9px; color: #bbb; margin-top: 4px; letter-spacing: 1px; }
      .sig-name     { font-size: 10px; font-weight: 500; color: #333; margin-top: 2px; }
      .page-footer  { text-align: center; margin-top: 24px; font-size: 8px; color: #ccc; letter-spacing: 1px; }
      .note-section { margin-top: 10px; font-size: 10px; color: #666; padding: 8px 0; border-top: 1px solid #f0f0f0; }
    </style>`;
}

function getStyles(template: InvoiceTemplate = 'classic'): string {
  switch (template) {
    case 'modern':  return getModernStyles();
    case 'minimal': return getMinimalStyles();
    default:        return getClassicStyles();
  }
}

function documentFrame(content: string, company: Company | null, title: string, template: InvoiceTemplate = 'classic'): string {
  const { header, footer } = headerFooterHtml(company, title);
  const wrap    = template === 'modern' ? '<div class="invoice-wrap">' : '';
  const wrapEnd = template === 'modern' ? '</div>' : '';
  return `<html><head>${getStyles(template)}</head><body>${wrap}${header}${content}${footer}${wrapEnd}</body></html>`;
}

/* ── Public exports ─────────────────────────────────────────────────── */

export function quotationPdfHtml(quotation: Quotation, company: Company | null): string {
  const body = `
    <div class="doc-info">
      <div class="left">
        <p><span class="info-label">Quotation No:</span> ${quotation.quotationNumber}</p>
        <p><span class="info-label">Date:</span> ${formatDate(quotation.date)}</p>
      </div>
      <div class="right">
        <p><span class="info-label">Valid Until:</span> ${formatDate(quotation.validUntil)}</p>
        <p><span class="info-label">Status:</span> ${quotation.status.toUpperCase()}</p>
      </div>
    </div>
    <div class="customer-section">
      <h3>Customer Details</h3>
      <p><strong>${quotation.customerName}</strong></p>
      ${quotation.customerAddress ? `<p>${quotation.customerAddress}</p>` : ''}
      ${quotation.customerGst     ? `<p>GSTIN: ${quotation.customerGst}</p>` : ''}
    </div>
    ${lineItemsToHtml(quotation.lineItems)}
    ${quotation.notes ? `<div class="note-section"><strong>Notes:</strong> ${quotation.notes}</div>` : ''}`;
  return documentFrame(body, company, 'Quotation');
}

export function invoicePdfHtml(invoice: Invoice, company: Company | null): string {
  const template = invoice.invoiceTemplate || 'classic';
  const body = `
    <div class="doc-info">
      <div class="left">
        <p><span class="info-label">Invoice No:</span> ${invoice.invoiceNumber}</p>
        <p><span class="info-label">Invoice Date:</span> ${formatDate(invoice.invoiceDate)}</p>
      </div>
      <div class="right">
        <p><span class="info-label">Due Date:</span> ${formatDate(invoice.dueDate)}</p>
        <p><span class="info-label">Status:</span> ${invoice.status.toUpperCase()}</p>
      </div>
    </div>
    <div class="customer-section">
      <h3>Bill To</h3>
      <p><strong>${invoice.customerName}</strong></p>
      ${invoice.customerAddress ? `<p>${invoice.customerAddress}</p>` : ''}
      ${invoice.customerGst     ? `<p>GSTIN: ${invoice.customerGst}</p>` : ''}
    </div>
    ${lineItemsToHtml(invoice.lineItems)}
    ${invoice.notes ? `<div class="note-section"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}`;
  return documentFrame(body, company, 'Tax Invoice', template);
}

export function purchasePdfHtml(purchase: Purchase, company: Company | null): string {
  const body = `
    <div class="doc-info">
      <div class="left">
        <p><span class="info-label">Bill No:</span> ${purchase.billNumber}</p>
        <p><span class="info-label">Date:</span> ${formatDate(purchase.date)}</p>
      </div>
      <div class="right">
        <p><span class="info-label">Status:</span> ${purchase.status.toUpperCase()}</p>
      </div>
    </div>
    <div class="customer-section">
      <h3>Vendor Details</h3>
      <p><strong>${purchase.vendorName}</strong></p>
      ${purchase.vendorGstNumber ? `<p>GSTIN: ${purchase.vendorGstNumber}</p>` : ''}
    </div>
    ${lineItemsToHtml(purchase.lineItems)}
    ${purchase.notes ? `<div class="note-section"><strong>Notes:</strong> ${purchase.notes}</div>` : ''}`;
  return documentFrame(body, company, 'Purchase Bill');
}

export function creditNotePdfHtml(note: CreditNote, company: Company | null): string {
  const body = `
    <div class="doc-info">
      <div class="left">
        <p><span class="info-label">Credit Note No:</span> ${note.creditNoteNumber}</p>
        <p><span class="info-label">Date:</span> ${formatDate(note.date)}</p>
      </div>
      <div class="right">
        <p><span class="info-label">Status:</span> ${note.status.toUpperCase()}</p>
      </div>
    </div>
    <div class="customer-section">
      <h3>Customer</h3>
      <p><strong>${note.customerName}</strong></p>
    </div>
    <div class="note-section" style="margin-bottom:15px;">
      <strong>Reason:</strong> ${note.reason}
    </div>
    <div class="total-section" style="width:100%;">
      <div class="grand-total" style="border-top-color:#F59E0B;color:#F59E0B;">
        <span>Credit Amount:</span><span>₹${note.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>`;
  return documentFrame(body, company, 'Credit Note');
}

export function debitNotePdfHtml(note: DebitNote, company: Company | null): string {
  const body = `
    <div class="doc-info">
      <div class="left">
        <p><span class="info-label">Debit Note No:</span> ${note.debitNoteNumber}</p>
        <p><span class="info-label">Date:</span> ${formatDate(note.date)}</p>
      </div>
      <div class="right">
        <p><span class="info-label">Status:</span> ${note.status.toUpperCase()}</p>
      </div>
    </div>
    <div class="customer-section">
      <h3>Vendor</h3>
      <p><strong>${note.vendorName}</strong></p>
    </div>
    <div class="note-section" style="margin-bottom:15px;">
      <strong>Reason:</strong> ${note.reason}
    </div>
    <div class="total-section" style="width:100%;">
      <div class="grand-total" style="border-top-color:#EF4444;color:#EF4444;">
        <span>Debit Amount:</span><span>₹${note.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>`;
  return documentFrame(body, company, 'Debit Note');
}
