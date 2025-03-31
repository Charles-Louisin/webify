"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/app/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Bienvenue sur Webify
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Continuer avec Google
          </Button>
        </div>
      </div>
    </div>
  );
} 