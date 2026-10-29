'use client';

import { useEffect } from 'react';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { KeyRoundIcon } from 'lucide-react';
import { Page } from '@/components/ikas/page';
import { EmptyState } from '@/components/ikas/empty-state';

export default function SubscriptionPage() {
  useEffect(() => {
    AppBridgeHelper.closeLoader();
  }, []);

  return (
    <Page>
      <EmptyState
        size="page"
        media={<KeyRoundIcon />}
        title="Aktif lisans yok"
        description="Uygulamayı kullanmak için sağ üstteki Planı Yönet butonundan bir plan seçin."
      />
    </Page>
  );
}
