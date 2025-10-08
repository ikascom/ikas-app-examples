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
    title: userLocale === 'tr' ? 'Siparişler' : 'Orders',
    actionRunId: t('page.order_detail.action_run_id', userLocale),
    status: t('page.order_detail.status', userLocale),
    paymentStatus: t('page.order_detail.payment_status', userLocale),
    packageStatus: t('page.order_detail.package_status', userLocale),
    totalAmount: t('page.order_detail.total_amount', userLocale),
    customerInfo: t('page.order_detail.customer_info', userLocale),
    name: t('page.order_detail.name', userLocale),
    email: t('page.order_detail.email', userLocale),
    phone: t('page.order_detail.phone', userLocale),
    items: userLocale === 'tr' ? 'ürün' : 'items',
    orderNumber: userLocale === 'tr' ? 'Sipariş' : 'Order',
  }), [userLocale]);

  /**
   * Fetches order details using the provided token.
   */
  const fetchOrderDetails = useCallback(async (currentToken: string, orderIds: string[]) => {
    try {
      const orderPromises = orderIds.map(orderId => 
        ApiRequests.ikas.getOrder(currentToken, orderId)
      );

      const responses = await Promise.all(orderPromises);
      
      const fetchedOrders: OrderData[] = [];
      
      responses.forEach(res => {
        if (res.status === 200 && res.data?.data?.order) {
          fetchedOrders.push(res.data.data.order);
        }
      });

      if (fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
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

      // Extract order IDs from comma-separated list
      const orderIds = idList.split(',').filter(id => id.trim() !== '');

      if (orderIds.length === 0) {
        setError(translations.error.invalidOrderId);
        setLoading(false);
        return;
      }

      // Get token from app bridge
      const fetchedToken = await TokenHelpers.getTokenForIframeApp();

      if (fetchedToken) {
        await fetchOrderDetails(fetchedToken, orderIds);
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

  if (orders.length === 0) {
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
                <CardTitle className="text-2xl">{translations.title} ({orders.length})</CardTitle>
                <CardDescription>
                  {actionRunId && (
                    <span className="block text-xs font-mono mt-1">{translations.actionRunId}: {actionRunId}</span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Orders List */}
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{translations.orderNumber} #{order.orderNumber}</CardTitle>
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

              {/* Customer and Items Summary */}
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.customer && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">{translations.customerInfo}</div>
                    <div className="mt-1 text-sm">{order.customer.fullName}</div>
                    {order.customer.email && (
                      <div className="text-xs text-gray-600">{order.customer.email}</div>
                    )}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-500">{translations.items}</div>
                  <div className="mt-1 text-sm">
                    {order.orderLineItems?.length || 0} {translations.items}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Order List Action Page (IFRAME Version)
 * This page is loaded in an iframe from the ikas platform.
 * It receives multiple order IDs via query parameters and displays order list.
 */
export default function OrderListActionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading />
      </div>
    }>
      <OrderListActionContent />
    </Suspense>
  );
}

