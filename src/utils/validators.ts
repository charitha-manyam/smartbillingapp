export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\s/g, ''));
}

export function validateGst(gst: string): boolean {
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(gst.toUpperCase());
}

export function validatePan(pan: string): boolean {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan.toUpperCase());
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validatePositiveNumber(value: number, fieldName: string): string | null {
  if (isNaN(value) || value <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

export function validateLineItem(item: {
  itemName: string;
  quantity: number;
  unitPrice: number;
}): string | null {
  if (!item.itemName.trim()) return 'Item name is required';
  if (item.quantity <= 0) return 'Quantity must be greater than 0';
  if (item.unitPrice <= 0) return 'Unit price must be greater than 0';
  return null;
}
