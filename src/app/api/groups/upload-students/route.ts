// src/app/api/LO_QUE_SEA_UPLOAD_EXCEL/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const grupoId = formData.get("grupoId") as string | null;

    if (!file || !grupoId) {
      return NextResponse.json(
        { error: "Faltan datos: file y grupoId son requeridos." },
        { status: 400 }
      );
    }

    // Construimos la URL remota con el mismo path
    const { pathname } = req.nextUrl;
    const remoteUrl = new URL(pathname, API_BASE_URL);

    // Armamos un nuevo FormData para reenviar al backend remoto
    const forwardFormData = new FormData();
    forwardFormData.append("file", file);
    forwardFormData.append("grupoId", grupoId);

    // Si tuvieras más campos en el formData original (profesorId, etc.), se copian también:
    formData.forEach((value, key) => {
      if (key !== "file" && key !== "grupoId") {
        // Evitamos duplicar estos dos porque ya se agregaron arriba
        forwardFormData.append(key, value);
      }
    });

    const res = await fetch(remoteUrl.toString(), {
      method: "POST",
      // OJO: NO pongas Content-Type manualmente, fetch lo setea con el boundary correcto
      body: forwardFormData,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Proxy upload Excel] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error: "Error al procesar Excel en el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway devuelve el mismo JSON de éxito/error que tenías antes
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error upload (proxy):", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
