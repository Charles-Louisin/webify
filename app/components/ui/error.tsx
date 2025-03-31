"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface ErrorProps {
  message?: string;
  className?: string;
  isGeneric?: boolean;
}

export function Error({
  message = "Une erreur est survenue",
  className,
  isGeneric = false,
}: ErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-x-2 w-full rounded-md border px-3 py-2",
        isGeneric ? "bg-destructive/10 border-destructive text-destructive" : "bg-rose-50 text-rose-500 border-rose-200",
        className
      )}
    >
      {isGeneric ? (
        <XCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
} 