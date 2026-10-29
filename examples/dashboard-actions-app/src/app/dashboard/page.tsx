'use client';

import { useEffect, useState, useCallback } from 'react';
import { TokenHelpers } from '@/helpers/token-helpers';
import { ApiRequests } from '@/lib/api-requests';
import HomePage from '../../components/home-page';

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');

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

  useEffect(() => {
    let cancelled = false;

    TokenHelpers.getTokenForIframeApp()
      .then(async (fetchedToken) => {
        if (cancelled) return;
        setToken(fetchedToken || null);
        if (fetchedToken) {
          await fetchStoreName(fetchedToken);
        }
      })
      .catch((error) => console.error('Error initializing dashboard:', error));

    return () => {
      cancelled = true;
    };
  }, [fetchStoreName]);

  // HomePage
  return <HomePage token={token} storeName={storeName} />;
}
