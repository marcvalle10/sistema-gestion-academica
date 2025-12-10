// src/app/api/LO_QUE_SEA_UPLOAD_GRADES/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("excel") as File | null;
    const grupoId = formData.get("grupoId") as string | null;

    if (!file || !grupoId) {
      return NextResponse.json(
        { mensaje: "Faltan datos." },
        { status: 400 }
      );
    }

    // Construimos la URL remota con el mismo path dinámico
    const { pathname } = req.nextUrl;
    const remoteUrl = new URL(pathname, API_BASE_URL);

    // Ensamblamos un nuevo FormData para reenviar al backend remoto
    const forwardFormData = new FormData();
    forwardFormData.append("excel", file);
    forwardFormData.append("grupoId", grupoId);

    // Copiamos cualquier otro campo que venga en el formData original
    formData.forEach((value, key) => {
      if (key !== "excel" && key !== "grupoId") {
        forwardFormData.append(key, value);
      }
    });

    // Hacemos la petición al backend real (Railway)
    const res = await fetch(remoteUrl.toString(), {
      method: "POST",
      body: forwardFormData,
      cache: "no-store",
      // Muy importante: NO poner Content-Type manual
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Proxy subir calificaciones] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          mensaje:
            "Error procesando calificaciones en el servidor remoto.",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    // Railway devolverá:
    // { mensaje, totalActualizados, totalErrores, erroresList }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error global upload (proxy):", err);
    return NextResponse.json(
      { mensaje: "Error interno del servidor local." },
      { status: 500 }
    );
  }
}
