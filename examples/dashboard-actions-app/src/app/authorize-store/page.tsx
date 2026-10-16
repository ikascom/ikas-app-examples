"use client";

import React, { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * AuthorizeStorePage
 * - Renders a form for the user to enter their store name and authorize the app.
 * - Handles error display if redirected back with a failure status.
 */
function AuthorizeStoreForm() {
  const searchParams = useSearchParams();
  // State for the store name input
  const [storeName, setStoreName] = useState(searchParams.get("storeName") ?? "");
  // State to control error message visibility
  const [showError, setShowError] = useState(searchParams.get("status") === "fail");

  // Handler for input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStoreName(e.target.value);
      if (showError) setShowError(false); // Hide error on user input
    },
    [showError]
  );

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Image src="/logo.svg" alt="ikas" width={192} height={48} priority className="h-auto w-48 object-contain" />
        <Card className="w-full">
          <form method="GET" action="/api/oauth/authorize/ikas" autoComplete="off" className="flex flex-col gap-(--card-spacing)">
            <CardHeader>
              <CardTitle>ikas mağazanızı bağlayın</CardTitle>
              <CardDescription>Uygulamayı yetkilendirmek için mağaza adınızı girin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Field data-invalid={showError || undefined}>
                <FieldLabel htmlFor="storeName">Mağaza adı</FieldLabel>
                <Input
                  id="storeName"
                  name="storeName"
                  value={storeName}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  aria-invalid={showError || undefined}
                />
                {showError && <FieldError>Mağaza bağlanamadı. Mağaza adını kontrol edip tekrar deneyin.</FieldError>}
              </Field>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={!storeName.trim()} className="w-full">
                Mağazama ekle
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}

const AuthorizeStorePage: React.FC = () => (
  <Suspense>
    <AuthorizeStoreForm />
  </Suspense>
);

export default AuthorizeStorePage;
