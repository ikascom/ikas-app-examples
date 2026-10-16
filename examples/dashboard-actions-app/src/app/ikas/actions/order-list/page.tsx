'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Page, PageHeader } from '@/components/ikas/page';
import { RecordTable, type RecordTableColumn } from '@/components/ikas/record-table';
import { EmptyState } from '@/components/ikas/empty-state';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/Loading';
import { TokenHelpers } from '@/helpers/token-helpers';
import { ApiRequests } from '@/lib/api-requests';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { t, SupportedLocale } from '@/lib/i18n';
import { formatMoney, formatOrderDate, orderStatusTone } from '@/lib/order-format';

type OrderData = {
  id: string;
  orderNumber?: string;
  orderedAt?: number;
  status: string;
  orderPaymentStatus?: string;
  orderPackageStatus?: string;
  totalFinalPrice: number;
  currencyCode: string;
  customer?: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  orderLineItems: Array<{
    id: string;
    quantity: number;
  }>;
};

/**
 * Order List Action Page Content (IFRAME Version)
 * This component contains the logic that uses search params.
 */
function OrderListActionContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const actionRunId = searchParams.get('actionRunId');
  const idList = searchParams.get('idList');
  const userLocale = (searchParams.get('userLocale') || 'en') as SupportedLocale | string;

  // Memoize translations to avoid recalculating on every render
  const translations = useMemo(() => ({
    error: {
      noOrderId: t('page.order_detail.error.no_order_id', userLocale),
      invalidOrderId: t('page.order_detail.error.invalid_order_id', userLocale),
      notFound: t('page.order_detail.error.not_found', userLocale),
      failed: t('page.order_detail.error.failed', userLocale),
      unableToAuth: t('page.order_detail.error.unable_to_authenticate', userLocale),
    },
    title: t('page.order_list.title', userLocale),
    empty: t('page.order_list.empty', userLocale),
    actionRunId: t('page.order_detail.action_run_id', userLocale),
    order: t('page.order_list.order', userLocale),
    date: t('page.order_list.date', userLocale),
    customer: t('page.order_list.customer', userLocale),
    items: t('page.order_list.items', userLocale),
    status: t('page.order_detail.status', userLocale),
    paymentStatus: t('page.order_detail.payment_status', userLocale),
    packageStatus: t('page.order_detail.package_status', userLocale),
    totalAmount: t('page.order_detail.total_amount', userLocale),
  }), [userLocale]);

  const orderIds = useMemo(() => (idList ?? '').split(',').filter((id) => id.trim() !== ''), [idList]);

  const inputError = !idList ? translations.error.noOrderId : orderIds.length === 0 ? translations.error.invalidOrderId : null;

  /**
   * Fetches order details using the provided token.
   */
  const fetchOrderDetails = useCallback(async (currentToken: string, ids: string[]) => {
    try {
      const responses = await Promise.all(ids.map((orderId) => ApiRequests.ikas.getOrder(currentToken, orderId)));

      const fetchedOrders: OrderData[] = [];
      responses.forEach((res) => {
        if (res.status === 200 && res.data?.data?.order) {
          fetchedOrders.push(res.data.data.order);
        }
      });
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(translations.error.failed);
    } finally {
      setLoading(false);
    }
  }, [translations]);

  // Close the loader shown by ikas platform when opening the iframe
  useEffect(() => {
    AppBridgeHelper.closeLoader();
  }, []);

  useEffect(() => {
    if (inputError) return;
    let cancelled = false;

    TokenHelpers.getTokenForIframeApp()
      .then(async (fetchedToken) => {
        if (cancelled) return;
        if (!fetchedToken) {
          setError(translations.error.unableToAuth);
          setLoading(false);
          return;
        }
        await fetchOrderDetails(fetchedToken, orderIds);
      })
      .catch((err) => {
        console.error('Error initializing page:', err);
        setError(translations.error.failed);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inputError, orderIds, fetchOrderDetails, translations, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  const columns: RecordTableColumn<OrderData>[] = [
    { id: 'order', header: translations.order, cell: (o) => <span className="font-medium">#{o.orderNumber}</span> },
    { id: 'date', header: translations.date, hideOnMobile: true, cell: (o) => formatOrderDate(o.orderedAt, userLocale) },
    { id: 'customer', header: translations.customer, cell: (o) => o.customer?.fullName ?? '' },
    {
      id: 'payment',
      header: translations.paymentStatus,
      cell: (o) => (o.orderPaymentStatus ? <Badge status={orderStatusTone(o.orderPaymentStatus)}>{o.orderPaymentStatus}</Badge> : null),
    },
    {
      id: 'package',
      header: translations.packageStatus,
      hideOnMobile: true,
      cell: (o) => (o.orderPackageStatus ? <Badge status={orderStatusTone(o.orderPackageStatus)}>{o.orderPackageStatus}</Badge> : null),
    },
    { id: 'items', header: translations.items, align: 'end', hideOnMobile: true, cell: (o) => o.orderLineItems?.length ?? 0 },
    { id: 'total', header: translations.totalAmount, align: 'end', cell: (o) => formatMoney(o.totalFinalPrice, o.currencyCode, userLocale) },
  ];

  return (
    <Page width="wide">
      <PageHeader
        title={translations.title}
        badges={!inputError && !loading && !error ? <Badge>{orders.length}</Badge> : null}
        description={actionRunId ? <span className="font-mono text-xs">{translations.actionRunId}: {actionRunId}</span> : undefined}
      />
      {inputError ? (
        <EmptyState status="danger" title={translations.error.failed} description={inputError} />
      ) : (
        <RecordTable
          label={translations.title}
          columns={columns}
          rows={orders}
          getRowId={(o) => o.id}
          loading={loading}
          error={error ?? undefined}
          onRetry={retry}
          emptyState={<EmptyState size="inline" title={translations.error.notFound} description={translations.empty} />}
        />
      )}
    </Page>
  );
}

/**
 * Order List Action Page (IFRAME Version)
 * This page is loaded in an iframe from the ikas platform.
 * It receives multiple order IDs via query parameters and displays order list.
 */
export default function OrderListActionPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrderListActionContent />
    </Suspense>
  );
}
