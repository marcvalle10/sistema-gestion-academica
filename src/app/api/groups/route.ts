// src/app/api/groups/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profesorId = searchParams.get("profesorId");

    if (!profesorId) {
      return NextResponse.json(
        { error: "Profesor ID es requerido." },
        { status: 400 }
      );
    }

    // Construimos la URL remota: https://...railway.app/api/groups?profesorId=...
    const remoteUrl = new URL("/api/groups", API_BASE_URL);
    remoteUrl.searchParams.set("profesorId", profesorId);

    const res = await fetch(remoteUrl.toString(), {
      method: "GET",
      // Evitar cache raro en el server
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Proxy /api/groups] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        { error: "Error al obtener grupos desde el servidor remoto" },
        { status: 502 } // Bad Gateway (falló el backend remoto)
      );
    }

    const data = await res.json();
    // Se asume que Railway ya regresa el JSON con los grupos en el formato correcto
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en /api/groups (proxy):", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
