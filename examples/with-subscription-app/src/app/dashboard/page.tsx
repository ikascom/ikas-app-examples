'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TokenHelpers } from '@/helpers/token-helpers';
import { ApiRequests } from '@/lib/api-requests';
import { MerchantAppSubscription } from '@/types/subscription';
import { AppBridgeHelper } from '@ikas/app-helpers';
import HomePage from '../../components/home-page';
import Loading from '@/components/Loading';

function findActiveAppSubscription(
  subscriptions: MerchantAppSubscription[] | null | undefined
): MerchantAppSubscription | null {
  if (!subscriptions) return null;
  return subscriptions.find((s) => !s.deleted) ?? null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [activeSubscription, setActiveSubscription] =
    useState<MerchantAppSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches and sets the store name using the provided token.
   */
  const fetchStoreName = useCallback(async (currentToken: string) => {
    try {
      const res = await ApiRequests.ikas.getMerchant(currentToken);
      if (res.status === 200 && res.data?.data?.merchantInfo?.storeName) {
        setStoreName(res.data.data.merchantInfo.storeName);
      }
    } catch (error) {
      console.error('Error fetching store name:', error);
    }
  }, []);

  /**
   * Checks subscription status via the merchant licence and redirects if none is active.
   */
  const checkSubscription = useCallback(
    async (currentToken: string) => {
      try {
        const res = await ApiRequests.ikas.getMerchantLicence(currentToken);
        if (res.status === 200 && res.data?.data?.licence) {
          const subscription = findActiveAppSubscription(
            res.data.data.licence.appSubscriptions
          );
          if (!subscription) {
            router.push('/subscription');
            return false;
          }
          setActiveSubscription(subscription);
          return true;
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
      return true; // Allow access on error to avoid blocking
    },
    [router]
  );

  // Close loader on mount
  useEffect(() => {
    AppBridgeHelper.closeLoader();
  }, []);

  useEffect(() => {
    let cancelled = false;

    TokenHelpers.getTokenForIframeApp()
      .then(async (fetchedToken) => {
        if (cancelled) return;
        setToken(fetchedToken || null);

        if (fetchedToken) {
          const hasSubscription = await checkSubscription(fetchedToken);
          if (hasSubscription) {
            await fetchStoreName(fetchedToken);
          }
        }
      })
      .catch((error) => console.error('Error initializing dashboard:', error))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchStoreName, checkSubscription]);

  if (isLoading) {
    return <Loading />;
  }

  return <HomePage token={token} storeName={storeName} activeSubscription={activeSubscription} />;
}
