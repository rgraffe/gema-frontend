import type { GrupoTrabajo, TrabajaEnGrupo } from "@/types/gruposTrabajo.types";

/**
 * Obtiene la lista de grupos de trabajo.
 * @author AndresChacon00
 */
export async function getGruposDeTrabajo() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }

  const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/grupos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al obtener los grupos de trabajo.");
  }

  const data = (await resp.json()) as { data: GrupoTrabajo[] };
  return data;
}

/**
 * Servicio para crear un nuevo grupo de trabajo.
 * @author AndresChacon00
 * @param params.codigo - El código del nuevo grupo.
 * @param params.nombre - El nombre del nuevo grupo.
 * @param params.supervisorId - El ID del supervisor asignado.
 * @throws Error si la petición falla o no hay token de autenticación.
 */
export async function createGrupoDeTrabajo({
  codigo,
  nombre,
  supervisorId,
}: {
  codigo: string;
  nombre: string;
  supervisorId: number | null;
}) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }

  const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/grupos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ codigo, nombre, supervisorId }),
  });

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al crear el grupo de trabajo.");
  }

  return resp.json();
}

export async function getAllWorkersInGroup({
  grupoDeTrabajoId,
}: {
  grupoDeTrabajoId: number;
}) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }
  const resp = await fetch(
    `${
      import.meta.env.VITE_BACKEND_BASE_URL
    }/trabajaEnGrupo/${grupoDeTrabajoId}`,
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
    throw new Error(data.error || "Error al crear el grupo de trabajo.");
  }

  return resp.json();
}

/**
 * Obtiene todos los trabajadores en todos los grupos de trabajo.
 * @author AndresChacon00
 */
export async function getAllWorkersInALLGroups() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }
  const resp = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/trabajaEnGrupo`,
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
    throw new Error(data.error || "Error al crear el grupo de trabajo.");
  }

  const data = (await resp.json()) as { data: TrabajaEnGrupo[] };
  return data;
}

/**
 * Asigna un técnico a un grupo de trabajo
 * @author AndresChacon00
 * @param tecnicoId - ID del tecnico a asignar
 * @param grupoDeTrabajoId - ID del grupo de trabajo
 */
export async function addTecnicoToGrupo({
  tecnicoId,
  grupoDeTrabajoId,
}: {
  tecnicoId: number;
  grupoDeTrabajoId: number;
}) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }

  const resp = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/trabajaEnGrupo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tecnicoId, grupoDeTrabajoId }),
    }
  );
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al agregar el técnico al grupo.");
  }
  return resp.json();
}

/**
 * Elimina un técnico de un grupo de trabajo.
 * @author AndresChacon00
 * @param tecnicoId - ID del técnico a eliminar
 * @param grupoDeTrabajoId - ID del grupo de trabajo
 */
export async function deleteTecnicoFromGrupo({
  tecnicoId,
  grupoDeTrabajoId,
}: {
  tecnicoId: number;
  grupoDeTrabajoId: number;
}) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }

  const resp = await fetch(
    `${
      import.meta.env.VITE_BACKEND_BASE_URL
    }/trabajaEnGrupo/${tecnicoId}/${grupoDeTrabajoId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al eliminar el técnico del grupo.");
  }

  return resp.json();
}

/**
 * Elimina un grupo de trabajo por su ID.
 * @author AndresChacon00
 * @param grupoDeTrabajoId - ID del grupo de trabajo a eliminar
 * @throws Error si la petición falla o no hay token de autenticación.
 */
export async function deleteGrupoDeTrabajo(grupoDeTrabajoId: number) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }

  const resp = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/grupos/${grupoDeTrabajoId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al eliminar el grupo de trabajo.");
  }

  return resp.json();
}

/**
 * Edita un grupo de trabajo existente.
 * @author gabrielm
 */
export async function editGrupoDeTrabajo({
  id,
  codigo,
  nombre,
  supervisorId,
}: {
  id: number;
  codigo: string;
  nombre: string;
  supervisorId: number;
}) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }

  const resp = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/grupos/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ codigo, nombre, supervisorId }),
    }
  );

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al crear el grupo de trabajo.");
  }

  return resp.json();
}
