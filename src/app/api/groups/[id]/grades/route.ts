// src/app/api/LO_QUE_SEA_CALIFICACIONES/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(
  req: NextRequest,
  _ctx: { params: Promise<{ id: string }> } // lo dejamos por compatibilidad, pero no lo usamos
) {
  try {
    const { pathname, searchParams } = req.nextUrl;

    // Ej: /api/grupos/123/calificaciones -> https://...railway.app/api/grupos/123/calificaciones
    const remoteUrl = new URL(pathname, API_BASE_URL);
    // Si hubiera query params, los copiamos también
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
        "[Proxy calificaciones grupo] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error:
            "Error al obtener calificaciones del grupo desde el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway ya regresa el arreglo de alumnos con calificaciones
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Error obteniendo calificaciones del grupo (proxy):",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
