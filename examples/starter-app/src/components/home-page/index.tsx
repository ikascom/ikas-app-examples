import React from 'react';
import { LockIcon, StoreIcon } from 'lucide-react';
import { Page, PageHeader } from '@/components/ikas/page';
import { EmptyState } from '@/components/ikas/empty-state';
import { Banner } from '@/components/ikas/banner';

// Props for HomePage component
interface HomePageProps {
  token: string | null;
  storeName?: string;
}

/**
 * HomePage component
 */
const HomePage: React.FC<HomePageProps> = ({ token, storeName }) => {
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
      <PageHeader title="Genel bakış" description="Uygulamanız mağazanıza bağlandı." />
      <Banner status="success" title="Bağlantı başarılı">
        {storeName ? `${storeName} mağazası için yetkilendirme tamamlandı.` : 'Mağaza yetkilendirmesi tamamlandı.'}
      </Banner>
      <EmptyState
        media={<StoreIcon />}
        title="Henüz içerik yok"
        description="Uygulamanızın ekranlarını @/components/ikas bileşenleriyle buraya ekleyin."
      />
    </Page>
  );
};

export default HomePage;
