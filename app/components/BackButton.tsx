"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      className="absolute top-4 left-4"
      onClick={() => router.back()}
    >
      <FaArrowLeft className="mr-2" />
      Retour
    </Button>
  );
} 