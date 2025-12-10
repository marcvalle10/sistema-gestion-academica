
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alumnoId, grupoId, cantidad, motivo, profesorId } = body;

    // Validación básica aquí también, para no mandar basura al remoto
    if (!alumnoId || !grupoId || !cantidad || !profesorId || cantidad < 1) {
      return NextResponse.json(
        { error: "Datos incompletos." },
        { status: 400 }
      );
    }

    // Construimos la URL remota con el mismo path del endpoint local
    const { pathname } = req.nextUrl;
    const remoteUrl = new URL(pathname, API_BASE_URL);

    const res = await fetch(remoteUrl.toString(), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        alumnoId,
        grupoId,
        cantidad,
        motivo,
        profesorId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        "[Proxy justificar faltas] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error: "Error al justificar faltas en el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 } // Bad Gateway
      );
    }

    const data = await res.json();
    // Railway devuelve { success: true, message: '...' } según tu backend original
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error justificando faltas (proxy):", error);
    return NextResponse.json(
      { error: "Error interno al justificar las faltas" },
      { status: 500 }
    );
  }
}
