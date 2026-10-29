import React from 'react';
import { LockIcon } from 'lucide-react';
import { MerchantAppSubscription } from '@/types/subscription';
import { SubscriptionPeriodEnum } from '@/lib/ikas-client/generated/graphql';
import { Page, PageHeader } from '@/components/ikas/page';
import { EmptyState } from '@/components/ikas/empty-state';
import { DescriptionList } from '@/components/ikas/description-list';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PERIOD_LABELS: Record<SubscriptionPeriodEnum, string> = {
  [SubscriptionPeriodEnum.MONTHLY]: 'aylık',
  [SubscriptionPeriodEnum.YEARLY]: 'yıllık',
  [SubscriptionPeriodEnum.ONE_TIME]: 'tek seferlik',
};

interface HomePageProps {
  token: string | null;
  storeName?: string;
  activeSubscription?: MerchantAppSubscription | null;
}

function formatPrice(subscription: MerchantAppSubscription) {
  if (!subscription.currencyCode) return String(subscription.lastPaymentPrice);
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: subscription.currencyCode }).format(subscription.lastPaymentPrice);
}

/**
 * HomePage component - displays dashboard for authenticated users with active subscriptions
 */
const HomePage: React.FC<HomePageProps> = ({ token, storeName, activeSubscription }) => {
  if (!token) {
    return (
      <Page>
        <EmptyState
          size="page"
          media={<LockIcon />}
          title="Oturum bulunamadı"
          description="Bu ekranı görmek için uygulamayı ikas panelinden açın."
        />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Genel bakış"
        description={storeName ? `${storeName} mağazasına bağlısınız.` : 'Mağazanıza bağlısınız.'}
      />

      {activeSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Aktif abonelik</CardTitle>
            <CardDescription>Mevcut planınızın ayrıntıları</CardDescription>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                { label: 'Plan', value: activeSubscription.name },
                {
                  label: 'Durum',
                  value: (
                    <Badge status="success" dot>
                      Aktif
                    </Badge>
                  ),
                },
                ...(activeSubscription.lastPaymentDate
                  ? [{ label: 'Son ödeme', value: new Date(activeSubscription.lastPaymentDate).toLocaleDateString('tr-TR') }]
                  : []),
                {
                  label: 'Ücret',
                  value: `${formatPrice(activeSubscription)} / ${PERIOD_LABELS[activeSubscription.lastPaymentPeriod]}`,
                },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </Page>
  );
};

export default HomePage;
