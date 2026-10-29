'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Page, PageHeader } from '@/components/ikas/page';
import { Layout, LayoutColumn } from '@/components/ikas/layout';
import { RecordTable, type RecordTableColumn } from '@/components/ikas/record-table';
import { DescriptionList } from '@/components/ikas/description-list';
import { EmptyState } from '@/components/ikas/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Loading from '@/components/Loading';
import { TokenHelpers } from '@/helpers/token-helpers';
import { ApiRequests } from '@/lib/api-requests';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { t, SupportedLocale } from '@/lib/i18n';
import { formatMoney, formatOrderDate, orderStatusTone } from '@/lib/order-format';

type OrderAddress = NonNullable<OrderData['shippingAddress']>;

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
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: { name: string };
    state?: { name?: string };
    country: { name: string };
    postalCode?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: { name: string };
    state?: { name?: string };
    country: { name: string };
    postalCode?: string;
  };
  orderLineItems: Array<{
    id: string;
    quantity: number;
    finalPrice?: number;
    variant: {
      id?: string;
      name: string;
      sku?: string;
    };
  }>;
};

function AddressCard({ title, address }: { title: string; address: OrderAddress }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 text-sm">
        <span className="font-medium text-foreground">
          {address.firstName} {address.lastName}
        </span>
        {address.phone && <span className="text-muted-foreground">{address.phone}</span>}
        <span>{address.addressLine1}</span>
        {address.addressLine2 && <span>{address.addressLine2}</span>}
        <span>
          {address.city?.name}
          {address.state?.name && `, ${address.state.name}`}
          {address.postalCode && ` ${address.postalCode}`}
        </span>
        <span>{address.country?.name}</span>
      </CardContent>
    </Card>
  );
}

/**
 * Order Detail Action Page Content (IFRAME Version)
 * This component contains the logic that uses search params.
 */
function OrderDetailActionContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
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
    title: t('page.order_detail.title', userLocale),
    summary: t('page.order_detail.summary', userLocale),
    actionRunId: t('page.order_detail.action_run_id', userLocale),
    status: t('page.order_detail.status', userLocale),
    paymentStatus: t('page.order_detail.payment_status', userLocale),
    packageStatus: t('page.order_detail.package_status', userLocale),
    totalAmount: t('page.order_detail.total_amount', userLocale),
    customerInfo: t('page.order_detail.customer_info', userLocale),
    name: t('page.order_detail.name', userLocale),
    email: t('page.order_detail.email', userLocale),
    phone: t('page.order_detail.phone', userLocale),
    customerId: t('page.order_detail.customer_id', userLocale),
    shippingAddress: t('page.order_detail.shipping_address', userLocale),
    billingAddress: t('page.order_detail.billing_address', userLocale),
    orderItems: t('page.order_detail.order_items', userLocale),
    product: t('page.order_detail.product', userLocale),
    sku: t('page.order_detail.sku', userLocale),
    quantity: t('page.order_detail.quantity', userLocale),
    unitPrice: t('page.order_detail.unit_price', userLocale),
    lineTotal: t('page.order_detail.line_total', userLocale),
    unknownProduct: t('page.order_detail.unknown_product', userLocale),
    noCustomerInfo: t('page.order_detail.no_customer_info', userLocale),
  }), [userLocale]);

  const orderId = (idList ?? '').split(',')[0]?.trim() ?? '';

  const inputError = !idList ? translations.error.noOrderId : !orderId ? translations.error.invalidOrderId : null;

  /**
   * Fetches order details using the provided token.
   */
  const fetchOrderDetails = useCallback(async (currentToken: string, id: string) => {
    try {
      const res = await ApiRequests.ikas.getOrder(currentToken, id);
      if (res.status === 200 && res.data?.data?.order) {
        setOrder(res.data.data.order);
      } else {
        setError(translations.error.notFound);
      }
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
        await fetchOrderDetails(fetchedToken, orderId);
      })
      .catch((err) => {
        console.error('Error initializing page:', err);
        setError(translations.error.failed);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inputError, orderId, fetchOrderDetails, translations, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  const failure = inputError ?? error;

  if (failure) {
    return (
      <Page>
        <EmptyState
          size="page"
          status="danger"
          title={translations.error.failed}
          description={failure}
          onRetry={inputError ? undefined : retry}
        />
      </Page>
    );
  }

  if (loading || !order) {
    return (
      <Page>
        <Skeleton className="h-8 w-56" />
        <Layout columns="main-aside">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </Layout>
      </Page>
    );
  }

  const lineItemColumns: RecordTableColumn<OrderData['orderLineItems'][number]>[] = [
    {
      id: 'product',
      header: translations.product,
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.variant?.name || translations.unknownProduct}</span>
          {item.variant?.sku && (
            <span className="text-xs text-muted-foreground">
              {translations.sku}: {item.variant.sku}
            </span>
          )}
        </div>
      ),
    },
    { id: 'quantity', header: translations.quantity, align: 'end', cell: (item) => item.quantity },
    {
      id: 'unitPrice',
      header: translations.unitPrice,
      align: 'end',
      hideOnMobile: true,
      cell: (item) => formatMoney(item.finalPrice ? item.finalPrice / item.quantity : 0, order.currencyCode, userLocale),
    },
    { id: 'lineTotal', header: translations.lineTotal, align: 'end', cell: (item) => formatMoney(item.finalPrice, order.currencyCode, userLocale) },
  ];

  return (
    <Page>
      <PageHeader
        title={`${translations.title} #${order.orderNumber}`}
        description={formatOrderDate(order.orderedAt, userLocale)}
        badges={<Badge status={orderStatusTone(order.status)}>{order.status}</Badge>}
      />
      <Layout columns="main-aside">
        <LayoutColumn>
          <RecordTable
            label={translations.orderItems}
            columns={lineItemColumns}
            rows={order.orderLineItems ?? []}
            getRowId={(item) => item.id}
          />
          {(order.shippingAddress || order.billingAddress) && (
            <Layout columns="half">
              {order.shippingAddress && <AddressCard title={translations.shippingAddress} address={order.shippingAddress} />}
              {order.billingAddress && <AddressCard title={translations.billingAddress} address={order.billingAddress} />}
            </Layout>
          )}
        </LayoutColumn>
        <LayoutColumn>
          <Card size="sm">
            <CardHeader>
              <CardTitle>{translations.summary}</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                items={[
                  {
                    label: translations.paymentStatus,
                    value: order.orderPaymentStatus ? <Badge status={orderStatusTone(order.orderPaymentStatus)}>{order.orderPaymentStatus}</Badge> : '-',
                  },
                  {
                    label: translations.packageStatus,
                    value: order.orderPackageStatus ? <Badge status={orderStatusTone(order.orderPackageStatus)}>{order.orderPackageStatus}</Badge> : '-',
                  },
                  { label: translations.totalAmount, value: formatMoney(order.totalFinalPrice, order.currencyCode, userLocale) },
                  ...(actionRunId ? [{ label: translations.actionRunId, value: <span className="font-mono text-xs break-all">{actionRunId}</span> }] : []),
                ]}
              />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>{translations.customerInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <DescriptionList
                  layout="stacked"
                  items={[
                    { label: translations.name, value: order.customer.fullName || '-' },
                    { label: translations.email, value: order.customer.email || '-' },
                    { label: translations.phone, value: order.customer.phone || '-' },
                    { label: translations.customerId, value: <span className="font-mono text-xs break-all">{order.customer.id}</span> },
                  ]}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{translations.noCustomerInfo}</p>
              )}
            </CardContent>
          </Card>
        </LayoutColumn>
      </Layout>
    </Page>
  );
}

/**
 * Order Detail Action Page (IFRAME Version)
 * This page is loaded in an iframe from the ikas platform.
 * It receives order ID(s) via query parameters and displays order details.
 */
export default function OrderDetailActionPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrderDetailActionContent />
    </Suspense>
  );
}
