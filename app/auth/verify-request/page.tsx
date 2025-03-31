"use client";

import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function VerifyRequest() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Vérifiez votre email
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Un lien de connexion a été envoyé à votre adresse email.
          Veuillez vérifier votre boîte de réception et cliquer sur le lien pour vous connecter.
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