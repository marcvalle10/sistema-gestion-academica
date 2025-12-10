// src/app/api/LO_QUE_SEA/route.ts  (el mismo archivo donde estaba tu código)
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(req: NextRequest) {
  try {
    const { searchParams, pathname } = req.nextUrl;
    const grupoId = searchParams.get("grupoId");
    const profesorId = searchParams.get("profesorId");

    if (!grupoId && !profesorId) {
      return NextResponse.json(
        { error: "Se requiere grupoId o profesorId" },
        { status: 400 }
      );
    }

    // Construimos la URL remota preservando el mismo path
    // Ej: si aquí es /api/alertas, irá a https://...railway.app/api/alertas
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
        "[Proxy alertas] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        { error: "Error al obtener alertas desde el servidor remoto" },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway ya hace toda la lógica de faltas, tipos, etc.
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error alertas (proxy):", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
