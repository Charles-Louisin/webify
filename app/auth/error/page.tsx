"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold tracking-tight text-destructive">
          Erreur d'authentification
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error === "AccessDenied"
            ? "Accès refusé. Vous n'avez pas les permissions nécessaires."
            : "Une erreur s'est produite lors de l'authentification. Veuillez réessayer."}
        </p>
        <Link href="/auth/signin">
          <Button className="mt-4">
            Retour à la connexion
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ErrorContent />
    </Suspense>
  );
} 