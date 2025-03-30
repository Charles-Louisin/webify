"use client";

import { useUser } from "@/hooks/useUser";
import PermissionTester from "@/components/PermissionTester";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestPermissionsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Page de Test des Permissions
        </h1>
        
        <div className="mb-8">
          <p className="text-gray-600 text-center">
            Cette page permet de tester les permissions pour n'importe quel utilisateur.
            Seuls les administrateurs ont accès à cette page.
          </p>
        </div>

        <PermissionTester userId={user._id} />
      </div>
    </div>
  );
} 