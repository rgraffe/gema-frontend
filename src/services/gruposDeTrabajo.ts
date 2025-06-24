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
        throw new Error(
            data.error || "Error al obtener los grupos de trabajo."
        );
    }

    return resp.json();
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
  grupoDeTrabajoId
} :
{
  grupoDeTrabajoId: number
}) {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }
  const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/trabajaEnGrupo/${grupoDeTrabajoId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

  })
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al crear el grupo de trabajo.");
  }

  return resp.json();

}

export async function getAllWorkersInALLGroups() {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }
  const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/trabajaEnGrupo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

  })
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Error al crear el grupo de trabajo.");
  }
  
  return resp.json();

}