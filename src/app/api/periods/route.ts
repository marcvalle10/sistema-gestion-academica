// src/app/api/LO_QUE_SEA/route.ts
import { NextResponse, NextRequest } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(req: NextRequest) {
  try {
    const { pathname, searchParams } = req.nextUrl;

    // Construimos la URL remota:
    // Ej: /api/periodos → https://...railway.app/api/periodos
    const remoteUrl = new URL(pathname, API_BASE_URL);

    // Copiamos cualquier query param existente (si aplica)
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
        "[Proxy periodos] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error: "Error al obtener periodos desde el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en proxy periodos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
