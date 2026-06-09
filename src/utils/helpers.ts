import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

export function warrantyDaysRemaining(warrantyEnd: string): number {
  if (!warrantyEnd) return 0;
  try {
    return differenceInDays(parseISO(warrantyEnd), new Date());
  } catch {
    return 0;
  }
}

export function warrantyStatus(warrantyEnd: string): 'expired' | 'expiring' | 'active' {
  const days = warrantyDaysRemaining(warrantyEnd);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'active';
}

export function warrantyColor(warrantyEnd: string): string {
  const status = warrantyStatus(warrantyEnd);
  switch (status) {
    case 'expired': return 'text-red-600 bg-red-50';
    case 'expiring': return 'text-yellow-700 bg-yellow-50';
    case 'active': return 'text-green-600 bg-green-50';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'Em uso': return 'bg-blue-100 text-blue-800';
    case 'Em estoque': return 'bg-green-100 text-green-800';
    case 'Em manutenção': return 'bg-yellow-100 text-yellow-800';
    case 'Reservado': return 'bg-purple-100 text-purple-800';
    case 'Baixado': return 'bg-gray-100 text-gray-800';
    case 'Extraviado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function generateCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.join(';');
  const dataLines = rows.map(row => row.join(';'));
  return [headerLine, ...dataLines].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\ufeff' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
