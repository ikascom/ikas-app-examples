'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/Loading';
import { TokenHelpers } from '@/helpers/token-helpers';
import { ApiRequests } from '@/lib/api-requests';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { t, SupportedLocale } from '@/lib/i18n';

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

/**
 * Order Detail Action Page Content (IFRAME Version)
 * This component contains the logic that uses search params.
 */
function OrderDetailActionContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actionRunId = searchParams.get('actionRunId');
  const idList = searchParams.get('idList');
  const userLocale = (searchParams.get('userLocale') || 'en') as SupportedLocale | string;
  
  // Memoize translations to avoid recalculating on every render
  const translations = useMemo(() => ({
    loading: t('page.order_detail.loading', userLocale),
    error: {
      noOrderId: t('page.order_detail.error.no_order_id', userLocale),
      invalidOrderId: t('page.order_detail.error.invalid_order_id', userLocale),
      notFound: t('page.order_detail.error.not_found', userLocale),
      failed: t('page.order_detail.error.failed', userLocale),
      unableToAuth: t('page.order_detail.error.unable_to_authenticate', userLocale),
    },
    title: t('page.order_detail.title', userLocale),
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
    sku: t('page.order_detail.sku', userLocale),
    quantity: t('page.order_detail.quantity', userLocale),
    each: t('page.order_detail.each', userLocale),
    unknownProduct: t('page.order_detail.unknown_product', userLocale),
    noCustomerInfo: t('page.order_detail.no_customer_info', userLocale),
  }), [userLocale]);

  /**
   * Fetches order details using the provided token.
   */
  const fetchOrderDetails = useCallback(async (currentToken: string, orderId: string) => {
    try {
      const res = await ApiRequests.ikas.getOrder(currentToken, orderId);
      if (res.status === 200 && res.data?.data?.order) {
        setOrder(res.data.data.order);
      } else {
        setError(translations.error.notFound);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : translations.error.failed);
    } finally {
      setLoading(false);
    }
  }, [translations]);

  /**
   * Initializes the page by fetching the token and order details.
   */
  const initializePage = useCallback(async () => {
    try {
      if (!idList) {
        setError(translations.error.noOrderId);
        setLoading(false);
        return;
      }

      // Extract the first order ID from comma-separated list
      const orderIds = idList.split(',');
      const orderId = orderIds[0];

      if (!orderId) {
        setError(translations.error.invalidOrderId);
        setLoading(false);
        return;
      }

      // Get token from app bridge
      const fetchedToken = await TokenHelpers.getTokenForIframeApp();

      if (fetchedToken) {
        await fetchOrderDetails(fetchedToken, orderId);
      } else {
        setError(translations.error.unableToAuth);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error initializing page:', err);
      setError(translations.error.failed);
      setLoading(false);
    }
  }, [idList, fetchOrderDetails, translations]);

  // Close the loader shown by ikas platform when opening the iframe
  useEffect(() => {
    AppBridgeHelper.closeLoader();
  }, []);

  // Run initialization on mount
  useEffect(() => {
    initializePage();
  }, [initializePage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{translations.error.failed}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{translations.error.notFound}</CardTitle>
            <CardDescription>{translations.error.notFound}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{translations.title} #{order.orderNumber}</CardTitle>
                <CardDescription>
                  {order.orderedAt && new Date(order.orderedAt * 1000).toLocaleDateString(userLocale === 'tr' ? 'tr-TR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{translations.actionRunId}</div>
                <div className="text-xs font-mono text-gray-600">{actionRunId}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">{translations.status}</div>
                <div className="mt-1 text-sm font-semibold">{order.status}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">{translations.paymentStatus}</div>
                <div className="mt-1 text-sm font-semibold">{order.orderPaymentStatus}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">{translations.packageStatus}</div>
                <div className="mt-1 text-sm font-semibold">{order.orderPackageStatus}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">{translations.totalAmount}</div>
                <div className="mt-1 text-sm font-semibold">
                  {order.totalFinalPrice.toFixed(2)} {order.currencyCode}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        {order.customer && (
          <Card>
            <CardHeader>
              <CardTitle>{translations.customerInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">{translations.name}</div>
                  <div className="mt-1 text-sm">{order.customer.fullName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">{translations.email}</div>
                  <div className="mt-1 text-sm">{order.customer.email || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">{translations.phone}</div>
                  <div className="mt-1 text-sm">{order.customer.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">{translations.customerId}</div>
                  <div className="mt-1 text-sm font-mono text-xs">{order.customer.id}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>{translations.shippingAddress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </div>
                    <div className="text-gray-600">{order.shippingAddress.phone}</div>
                  </div>
                  <div className="text-gray-700">
                    <div>{order.shippingAddress.addressLine1}</div>
                    {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                    <div>
                      {order.shippingAddress.city?.name}
                      {order.shippingAddress.state?.name && `, ${order.shippingAddress.state.name}`}
                      {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                    </div>
                    <div>{order.shippingAddress.country?.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>{translations.billingAddress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium">
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </div>
                    <div className="text-gray-600">{order.billingAddress.phone}</div>
                  </div>
                  <div className="text-gray-700">
                    <div>{order.billingAddress.addressLine1}</div>
                    {order.billingAddress.addressLine2 && <div>{order.billingAddress.addressLine2}</div>}
                    <div>
                      {order.billingAddress.city?.name}
                      {order.billingAddress.state?.name && `, ${order.billingAddress.state.name}`}
                      {order.billingAddress.postalCode && ` ${order.billingAddress.postalCode}`}
                    </div>
                    <div>{order.billingAddress.country?.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Items */}
        {order.orderLineItems && order.orderLineItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{translations.orderItems} ({order.orderLineItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderLineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium">{item.variant?.name || translations.unknownProduct}</div>
                      <div className="text-sm text-gray-500">{translations.sku}: {item.variant?.sku || 'N/A'}</div>
                      <div className="text-sm text-gray-600 mt-1">{translations.quantity}: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {item.finalPrice?.toFixed(2) || '0.00'} {order.currencyCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.finalPrice ? (item.finalPrice / item.quantity).toFixed(2) : '0.00'} {translations.each}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Order Detail Action Page (IFRAME Version)
 * This page is loaded in an iframe from the ikas platform.
 * It receives order ID(s) via query parameters and displays order details.
 */
export default function OrderDetailActionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading />
      </div>
    }>
      <OrderDetailActionContent />
    </Suspense>
  );
}

