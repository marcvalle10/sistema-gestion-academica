// src/app/api/LO_QUE_SEA_REPORTE/route.ts
import { NextRequest, NextResponse } from "next/server";

type ReportType = "Practicas Profesionales" | "Servicio Social";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(req: NextRequest) {
  try {
    const { searchParams, pathname } = req.nextUrl;
    const reportType = searchParams.get("type") as ReportType | null;

    // Validación del tipo de reporte (igual que antes, pero sin DB)
    if (
      !reportType ||
      (reportType !== "Practicas Profesionales" &&
        reportType !== "Servicio Social")
    ) {
      return NextResponse.json(
        { error: "Parámetro 'type' inválido." },
        { status: 400 }
      );
    }

    // Construimos la URL remota preservando path y query params
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
        "[Proxy reporte créditos] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error:
            "Error al obtener reporte de créditos desde el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway regresa las filas (alumnos) ya calculadas
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en reporte (proxy):", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
