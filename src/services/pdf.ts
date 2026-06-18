import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Company, Quotation, Invoice, Purchase, CreditNote, DebitNote } from '../types';
import {
  quotationPdfHtml,
  invoicePdfHtml,
  purchasePdfHtml,
  creditNotePdfHtml,
  debitNotePdfHtml,
} from '../pdf/templates';

let _imgIdx = 0;

async function uriToDataUrl(uri: string | null | undefined): Promise<string | undefined> {
  if (!uri) return undefined;
  if (uri.startsWith('data:')) return uri;
  try {
    let file: File;
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      const tmpFile = new File(Paths.cache, `pdf_img_${++_imgIdx}.png`);
      file = await File.downloadFileAsync(uri, tmpFile, { idempotent: true });
    } else if (uri.startsWith('content://')) {
      const tmpFile = new File(Paths.cache, `pdf_img_${++_imgIdx}.png`);
      await new File(uri).copy(tmpFile, { overwrite: true });
      file = tmpFile;
    } else {
      file = new File(uri);
    }
    const base64 = await file.base64();
    const mime = /\.(jpe?g)/i.test(uri) ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    console.warn('[PDF] image load failed:', uri?.slice(0, 80), String(e));
    return undefined;
  }
}

async function resolveCompanyImages(company: Company | null): Promise<Company | null> {
  if (!company) return null;
  const [logo, sig] = await Promise.all([
    uriToDataUrl(company.companyLogo),
    uriToDataUrl(company.digitalSignature),
  ]);
  return { ...company, companyLogo: logo, digitalSignature: sig };
}

async function generatePdf(html: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePdf(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share PDF' });
  }
}

export async function printQuotation(quotation: Quotation, company: Company | null): Promise<void> {
  const c = await resolveCompanyImages(company);
  await Print.printAsync({ html: quotationPdfHtml(quotation, c) });
}

export async function printInvoice(invoice: Invoice, company: Company | null): Promise<void> {
  const c = await resolveCompanyImages(company);
  await Print.printAsync({ html: invoicePdfHtml(invoice, c) });
}

export async function generateQuotationPdf(quotation: Quotation, company: Company | null): Promise<string> {
  const c = await resolveCompanyImages(company);
  return generatePdf(quotationPdfHtml(quotation, c));
}

export async function generateInvoicePdf(invoice: Invoice, company: Company | null): Promise<string> {
  const c = await resolveCompanyImages(company);
  return generatePdf(invoicePdfHtml(invoice, c));
}

export async function generatePurchasePdf(purchase: Purchase, company: Company | null): Promise<string> {
  const c = await resolveCompanyImages(company);
  return generatePdf(purchasePdfHtml(purchase, c));
}

export async function generateCreditNotePdf(note: CreditNote, company: Company | null): Promise<string> {
  const c = await resolveCompanyImages(company);
  return generatePdf(creditNotePdfHtml(note, c));
}

export async function generateDebitNotePdf(note: DebitNote, company: Company | null): Promise<string> {
  const c = await resolveCompanyImages(company);
  return generatePdf(debitNotePdfHtml(note, c));
}
