import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(req: NextRequest) {
  try {
    const { searchParams, pathname } = req.nextUrl;
    const grupoId = searchParams.get("grupoId");

    if (!grupoId) {
      return NextResponse.json(
        { error: "Faltan datos: grupoId es requerido" },
        { status: 400 }
      );
    }

    // Proxy hacia la misma ruta en Railway
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
        "[Proxy yaTomada] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        { error: "Error al consultar lista en el servidor remoto" },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway devuelve { yaTomada: boolean } (según tu backend original)
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en proxy yaTomada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}