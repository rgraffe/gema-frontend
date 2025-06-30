import type { Tecnico } from "@/types/tecnicos.types";

/**
 * Obtiene listado de técnicos
 * @author AndresChacon00
 */
export async function getTecnicos() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }
  const resp = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/tecnicos`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al obtener los técnicos.");
  }
  const data = (await resp.json()) as { data: Tecnico[] };
  return data;
}

/**
 * Crea un nuevo técnico.
 * @author AndresChacon00
 */
export async function createTecnico({
  Nombre,
  Correo,
}: {
Nombre: string;
  Correo: string;
}) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }
  const resp = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/tecnicos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ Nombre, Correo }),
    }
  );
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al creaar el técnico.");
  }
  const data = await resp.json();
  return data;
}