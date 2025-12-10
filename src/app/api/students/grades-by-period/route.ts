// src/app/api/lo-que-sea/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(req: NextRequest) {
  const { searchParams, pathname } = req.nextUrl;
  const expediente = searchParams.get("expediente");
  const periodoId = searchParams.get("periodoId");

  if (!expediente || !periodoId) {
    return NextResponse.json(
      { error: "Faltan datos." },
      { status: 400 }
    );
  }

  try {
    // Construimos la URL remota manteniendo path y query params
    // /api/kardex?expediente=...&periodoId=... ->
    // https://...railway.app/api/kardex?expediente=...&periodoId=...
    const remoteUrl = new URL(pathname, API_BASE_URL);
    searchParams.forEach((value, key) => {
      remoteUrl.searchParams.set(key, value);
    });

    const res = await fetch(remoteUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Proxy calificaciones por periodo] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error: "Error al buscar calificaciones en el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway ya devuelve las filas con código, materia, créditos, calificación, etc.
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error buscando calificaciones (proxy):", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
