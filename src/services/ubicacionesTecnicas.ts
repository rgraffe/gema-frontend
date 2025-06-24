import type { UbicacionTecnica } from "@/types/ubicacionesTecnicas.types";

/**
 * Obtiene todas las ubicaciones técnicas.
 * @throws {Error} Si falla la petición.
 * @returns La respuesta del backend en formato JSON.
 */
export async function getUbicacionesTecnicas() {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const token = localStorage.getItem("authToken");
  const resp = await fetch(`${BASE_URL}/ubicaciones-tecnicas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(
      data.error ||
        "Error al obtener las ubicaciones técnicas, por favor intente de nuevo."
    );
  }
  return resp.json();
}

/**
 * Crea una nueva ubicación técnica.
 * @param {Object} params Objeto con los datos de la ubicación técnica a crear.
 * @param {string} params.descripcion Descripción de la ubicación técnica.
 * @param {string} params.abreviacion Abreviación de la ubicación técnica.
 * @param {Array<{ idPadre: number, esUbicacionFisica?: boolean }>} [params.padres] Opcional. Arreglo con los padres de la ubicación.
 * @throws {Error} Si falla la creación.
 * @returns La respuesta del backend en formato JSON.
 */
export async function createUbicacionTecnica(params: {
  descripcion: string;
  abreviacion: string;
  padres?: Array<{ idPadre: number; esUbicacionFisica?: boolean }>;
}) {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const token = localStorage.getItem("authToken");
  const resp = await fetch(`${BASE_URL}/ubicaciones-tecnicas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(
      data.error ||
        "Error al crear la ubicación técnica, por favor intente de nuevo."
    );
  }
  return resp.json();
}

/**
 * Actualiza una ubicación técnica.
 * @param {number} id El ID de la ubicación técnica a actualizar.
 * @param {Object} params Objeto con los datos a actualizar.
 * @param {string} [params.descripcion] Nueva descripción de la ubicación técnica.
 * @param {string} [params.abreviacion] Nueva abreviación de la ubicación técnica.
 * @param {Array<{ idPadre: number, esUbicacionFisica?: boolean }>} [params.padres] Opcional. Arreglo con los padres de la ubicación.
 * @throws {Error} Si falla la actualización.
 * @returns La respuesta del backend en formato JSON.
 */
export async function updateUbicacionTecnica(
  id: number,
  params: {
    descripcion?: string;
    abreviacion?: string;
    padres?: Array<{ idPadre: number; esUbicacionFisica?: boolean }>;
  }
) {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const token = localStorage.getItem("authToken");
  const resp = await fetch(`${BASE_URL}/ubicaciones-tecnicas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(
      data.error ||
        "Error al actualizar la ubicación técnica, por favor intente de nuevo."
    );
  }
  return resp.json();
}

/**
 * Elimina una ubicación técnica.
 * @param {number} id El ID de la ubicación técnica a eliminar.
 * @throws {Error} Si falla la eliminación.
 * @returns La respuesta del backend en formato JSON.
 */
export async function deleteUbicacionTecnica(id: number) {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const token = localStorage.getItem("authToken");
  const resp = await fetch(`${BASE_URL}/ubicaciones-tecnicas/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(
      data.error ||
        "Error al eliminar la ubicación técnica, por favor intente de nuevo."
    );
  }
  return resp.json();
}

/**
 * Obtiene la cantidad de ubicaciones dependientes de una ubicación técnica.
 * @author gabrielm
 * @param id
 */
export async function getUbicacionesDependientes(id: number) {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const token = localStorage.getItem("authToken");
  const resp = await fetch(`${BASE_URL}/ubicaciones-tecnicas/ramas/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(
      data.error || "Error al obtener dependencias de la ubicación técnica"
    );
  }
  return resp.json() as Promise<{ data: UbicacionTecnica[] }>;
}
