// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://deploy-carga-archivos-backend-production.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const resp = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error("Error en login (frontend -> backend cargas):", error);
    return NextResponse.json(
      { error: "No se pudo conectar con el backend de autenticación." },
      { status: 502 }
    );
  }
}
