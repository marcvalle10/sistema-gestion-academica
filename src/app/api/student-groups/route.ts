import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

export async function GET(req: NextRequest) {
  const { searchParams, pathname } = req.nextUrl;
  const grupoId = searchParams.get("grupoId");
  const profesorId = searchParams.get("profesorId");

  if (!grupoId || !profesorId) {
    return NextResponse.json(
      { error: "Faltan parámetros." },
      { status: 400 }
    );
  }

  try {
    // Construimos la URL remota conservando path y query params
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
        "[Proxy alumnos grupo] Error remoto:",
        res.status,
        text.substring(0, 300)
      );
      return NextResponse.json(
        {
          error:
            "Error al obtener alumnos del grupo desde el servidor remoto",
          statusCode: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Railway ya devuelve los alumnos con nombreCompleto, faltas, etc.
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en proxy alumnos grupo:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
