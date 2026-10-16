import React from 'react';
import { Spinner } from '@/components/ui/spinner';

function Loading() {
  return (
    <div className="flex h-svh w-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      <span>Yükleniyor</span>
    </div>
  );
}

export default Loading;
