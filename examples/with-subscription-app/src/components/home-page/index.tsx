import React from 'react';
import { CheckCircle2, Crown } from 'lucide-react';
import { MerchantAppSubscription } from '@/types/subscription';
import { SubscriptionPeriodEnum } from '@/lib/ikas-client/generated/graphql';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PERIOD_LABELS: Record<SubscriptionPeriodEnum, string> = {
  [SubscriptionPeriodEnum.MONTHLY]: 'monthly',
  [SubscriptionPeriodEnum.YEARLY]: 'annual',
  [SubscriptionPeriodEnum.ONE_TIME]: 'one-time',
};

interface HomePageProps {
  token: string | null;
  storeName?: string;
  activeSubscription?: MerchantAppSubscription | null;
}

/**
 * HomePage component - displays dashboard for authenticated users with active subscriptions
 */
const HomePage: React.FC<HomePageProps> = ({ token, storeName, activeSubscription }) => {
  if (!token) {
    return (
      <div className="max-w-[1200px] mx-auto p-6 bg-background min-h-[100vh]">
        <div className="text-center p-20 bg-muted rounded-xl border border-dashed">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please authenticate to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 bg-background min-h-[100vh]">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle2 className="mx-auto text-green-600" size={56} />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Welcome to Your Dashboard!</h2>
        <p className="mt-2 text-muted-foreground">
          You are authenticated to <span className="font-medium">{storeName}</span>
        </p>
      </div>

      {/* Subscription Info Card */}
      {activeSubscription && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Active Subscription
            </CardTitle>
            <CardDescription>Your current plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{activeSubscription.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              {activeSubscription.lastPaymentDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Payment:</span>
                  <span className="font-medium">
                    {new Date(activeSubscription.lastPaymentDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">
                  {activeSubscription.lastPaymentPrice}{' '}
                  {activeSubscription.currencyCode ?? ''} /{' '}
                  {PERIOD_LABELS[activeSubscription.lastPaymentPeriod]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
