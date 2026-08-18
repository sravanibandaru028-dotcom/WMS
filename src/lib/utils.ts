import { clsx, type ClassValue } from './clsx';

export function cn(...args: ClassValue[]) {
  return clsx(...args);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeUntil(iso: string): string {
  const now = new Date();
  const target = new Date(iso);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff < 3600000) return `${Math.round(absDiff / 60000)}m overdue`;
    if (absDiff < 86400000) return `${Math.round(absDiff / 3600000)}h overdue`;
    return `${Math.round(absDiff / 86400000)}d overdue`;
  }

  if (diff < 3600000) return `in ${Math.round(diff / 60000)}m`;
  if (diff < 86400000) return `in ${Math.round(diff / 3600000)}h`;
  return `in ${Math.round(diff / 86400000)}d`;
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
