"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Suspense } from "react";

const getErrorMessage = (error: string | null) => {
  switch (error) {
    case "AccessDenied":
      return "Accès refusé. Vous n'avez pas les permissions nécessaires.";
    case "Configuration":
      return "Il y a un problème avec la configuration de l'authentification. Veuillez contacter l'administrateur.";
    case "OAuthSignin":
      return "Erreur lors de la connexion avec Google. Veuillez réessayer.";
    case "OAuthCallback":
      return "Erreur lors de la réponse de Google. Veuillez réessayer.";
    case "OAuthCreateAccount":
      return "Impossible de créer un compte utilisateur. Veuillez réessayer.";
    case "EmailCreateAccount":
      return "Impossible de créer un compte avec cet email. Veuillez réessayer.";
    case "Callback":
      return "Erreur lors du processus d'authentification. Veuillez réessayer.";
    default:
      return "Une erreur s'est produite lors de l'authentification. Veuillez réessayer.";
  }
};

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
          {getErrorMessage(error)}
        </p>
        <div className="text-xs text-muted-foreground mt-2">
          Code d'erreur : {error}
        </div>
        <Link href="/auth/signin">
          <Button className="mt-4 w-full">
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