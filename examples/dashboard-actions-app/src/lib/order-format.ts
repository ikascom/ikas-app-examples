import type { ComponentProps } from 'react';
import type { Badge } from '@/components/ui/badge';

type BadgeStatus = NonNullable<ComponentProps<typeof Badge>['status']>;

export function toIntlLocale(locale: string): string {
  return locale.toLowerCase() === 'tr' ? 'tr-TR' : 'en-US';
}

export function formatMoney(amount: number | undefined, currencyCode: string, locale: string): string {
  try {
    return new Intl.NumberFormat(toIntlLocale(locale), { style: 'currency', currency: currencyCode }).format(amount ?? 0);
  } catch {
    return `${(amount ?? 0).toFixed(2)} ${currencyCode}`;
  }
}

export function formatOrderDate(orderedAt: number | undefined, locale: string): string {
  if (!orderedAt) return '';
  return new Date(orderedAt * 1000).toLocaleDateString(toIntlLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function orderStatusTone(value: string | undefined): BadgeStatus {
  if (!value) return 'neutral';
  const v = value.toUpperCase();
  if (/CANCEL|FAIL|REFUND|REJECT|UNPAID/.test(v)) return 'danger';
  if (/PARTIAL|WAITING|UNFULFILLED|UNPACKED|PENDING|READY/.test(v)) return 'warning';
  if (/PAID|FULFILLED|DELIVERED|COMPLETED|APPROVED/.test(v)) return 'success';
  return 'neutral';
}
