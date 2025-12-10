// src/lib/remoteClient.ts
const baseUrl =
  process.env.API_PROFESORES_URL ??
  "https://deploy-sistema-gestion-academica-production.up.railway.app";

if (!baseUrl) {
  throw new Error("API_PROFESORES_URL no está definida");
}

export async function fetchGroups() {
  const res = await fetch(`${baseUrl}/api/groups`, {
    // Para que no se cachee en el server
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Error remoto /api/groups: ${res.status} - ${text.slice(0, 200)}`
    );
  }

  return res.json();
}

export async function fetchStudentByExpediente(expediente: string) {
  const res = await fetch(`${baseUrl}/api/students/${encodeURIComponent(expediente)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Error remoto /api/students/${expediente}: ${res.status} - ${text.slice(
        0,
        200
      )}`
    );
  }

  return res.json();
}
