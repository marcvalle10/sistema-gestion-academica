
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(
  req: NextRequest,
  _context: { params: Promise<{ id: string }> } // lo dejamos por compatibilidad, aunque no lo usamos
) {
  try {
    const { pathname } = req.nextUrl;

    // Construimos la URL remota preservando el path dinámico:
    // ej: /api/groups/123/detalles -> https://...railway.app/api/groups/123/detalles
    const remoteUrl = new URL(pathname, API_BASE_URL);

    const res = await fetch(remoteUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Proxy detalles grupo] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error: "Error al obtener detalles del grupo desde el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 } // Bad Gateway
      );
    }

    const data = await res.json();
    // Railway ya hace todo: joins, formato de horario, aula, etc.
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error obteniendo detalles del grupo (proxy):", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
