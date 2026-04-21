'use client';

import { useEffect } from 'react';
import { AppBridgeHelper } from '@ikas/app-helpers';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubscriptionPage() {
  useEffect(() => {
    AppBridgeHelper.closeLoader();
  }, []);

  return (
    <main className="max-w-[1200px] mx-auto p-6 bg-background min-h-[100vh]">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle>No Active Licence</CardTitle>
          <CardDescription>You don&apos;t have an active licence for this app yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            Please purchase a licence using the{' '}
            <span className="font-medium text-foreground">Manage</span> button in the top-right
            corner.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
