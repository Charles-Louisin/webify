"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/app/components/ui/button";
import { FaGoogle } from "react-icons/fa";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="bg-card shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Inscription</h1>
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <FaGoogle />
          S'inscrire avec Google
        </Button>
      </div>
    </div>
  );
} 