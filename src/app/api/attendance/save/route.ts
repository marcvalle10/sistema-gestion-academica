// src/app/api/LO_QUE_SEA_ASISTENCIA/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const { grupoId, profesorId, faltas } = await req.json(); // 'faltas' es un array de IDs de alumnos

    if (!grupoId || !profesorId) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Construimos la URL remota usando el mismo path del endpoint local
    const { pathname } = req.nextUrl;
    const remoteUrl = new URL(pathname, API_BASE_URL);

    const res = await fetch(remoteUrl.toString(), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grupoId,
        profesorId,
        faltas,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Proxy guardar asistencia] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error: "Error al guardar asistencia en el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway devuelve algo como { success: true, message: 'Asistencia guardada correctamente' }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error guardando asistencia (proxy):", error);
    return NextResponse.json(
      { error: "Error interno al guardar" },
      { status: 500 }
    );
  }
}
