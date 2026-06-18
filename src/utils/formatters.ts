export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateDocumentNumber(prefix: string, count: number): string {
  const num = String(count + 1).padStart(4, '0');
  return `${prefix}-${num}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: '#94A3B8',
    sent: '#3B82F6',
    accepted: '#10B981',
    rejected: '#EF4444',
    converted: '#8B5CF6',
    paid: '#10B981',
    overdue: '#F59E0B',
    cancelled: '#EF4444',
    completed: '#10B981',
    issued: '#10B981',
  };
  return colors[status] || '#94A3B8';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    accepted: 'Accepted',
    rejected: 'Rejected',
    converted: 'Converted',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    completed: 'Completed',
    issued: 'Issued',
  };
  return labels[status] || status;
}
