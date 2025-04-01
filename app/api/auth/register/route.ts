import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation basique
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    try {
      // Créer l'utilisateur avec la nouvelle fonction registerUser
      const userId = await convex.mutation(api.auth.registerUser, {
        name,
        email,
        password,
      });

      return NextResponse.json({ userId }, { status: 201 });
    } catch (error: any) {
      // Gérer les erreurs spécifiques de Convex
      if (error.message === "Cet email est déjà utilisé") {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
} 