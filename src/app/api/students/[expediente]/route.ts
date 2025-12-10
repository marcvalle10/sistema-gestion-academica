// src/app/api/students/[expediente]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(
  req: NextRequest,
  _context: { params: Promise<{ expediente: string }> } // lo dejamos por compat, no lo usamos
) {
  try {
    const { pathname, searchParams } = req.nextUrl;

    // Construimos la URL remota preservando el path dinámico:
    // /api/students/12345 -> https://...railway.app/api/students/12345
    const remoteUrl = new URL(pathname, API_BASE_URL);

    // Si algún día le agregas query params (?foo=bar), también los copiamos:
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
        "[Proxy /api/students/[expediente]] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error:
            "Error al obtener datos del alumno desde el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 } // Bad Gateway
      );
    }

    const data = await res.json();
    // Railway ya devuelve el objeto con name, expediente, email, records, etc.
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error en proxy /api/students/[expediente]:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
