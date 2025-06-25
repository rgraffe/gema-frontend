/**
 * Servicio para manejar las operaciones de Ubicaciones Técnicas.
 * Realiza peticiones fetch a los endpoints del backend para gestionar las ubicaciones técnicas.
 * @author janbertorelli
 */

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
      data.error || "Error al obtener las ubicaciones técnicas, por favor intente de nuevo."
    );
  }
  return resp.json();
}

/**
 * Obtiene las ubicaciones técnicas dependientes de una ubicación dada.
 * @param {number} id El ID de la ubicación técnica para obtener sus dependientes.
 * @param {number} [nivel] Parámetro opcional para filtrar las ubicaciones dependientes por nivel.
 * @throws {Error} Si falla la petición o no se encuentra la ubicación.
 * @returns La respuesta del backend en formato JSON.
 */
export async function getUbicacionesDependientes(id: number, nivel?: number) {
  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const token = localStorage.getItem("authToken");
  let url = `${BASE_URL}/ubicaciones-tecnicas/ramas/${id}`;
  if (nivel !== undefined) {
    url += `?nivel=${nivel}`;
  }
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(
      data.error || "Error al obtener ubicaciones dependientes, por favor intente de nuevo."
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
 * @throws {Error} Si faltan parámetros o si algunos de ellos son inválidos.
 * @returns La respuesta del backend en formato JSON.
 */
export async function createUbicacionTecnica(params: {
  descripcion: string;
  abreviacion: string;
  padres?: Array<{ idPadre: number; esUbicacionFisica?: boolean }>;
}) {
  // Validamos parámetros y listamos los que faltan o son inválidos.
  const missingParams: string[] = [];
  if (typeof params.descripcion !== 'string' || params.descripcion.trim() === '') {
    missingParams.push("descripcion (debe ser una cadena no vacía)");
  }
  if (typeof params.abreviacion !== 'string' || params.abreviacion.trim() === '') {
    missingParams.push("abreviacion (debe ser una cadena no vacía)");
  }
  if (missingParams.length > 0) {
    throw new Error(`Faltan o son inválidos los siguientes parámetros: ${missingParams.join(', ')}.`);
  }

  try {
    const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
    const token = localStorage.getItem("authToken");
    const resp = await fetch(`${BASE_URL}/ubicaciones-tecnicas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });
    
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Error al crear la ubicación técnica, por favor intente de nuevo.");
    }
    return resp.json();
  } catch (error) {
    throw new Error(`createUbicacionTecnica: ${(error as Error).message}`);
  }
}

/**
 * Actualiza una ubicación técnica.
 * @param {number} id El ID de la ubicación técnica a actualizar.
 * @param {Object} params Objeto con los datos a actualizar.
 * @param {string} [params.descripcion] Nueva descripción de la ubicación técnica.
 * @param {string} [params.abreviacion] Nueva abreviación de la ubicación técnica.
 * @param {Array<{ idPadre: number, esUbicacionFisica?: boolean }>} [params.padres] Opcional. Arreglo con los padres de la ubicación.
 * @throws {Error} Si no se proporciona ningún dato para actualizar o si el id es inválido.
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
  // Validar el id
  if (typeof id !== 'number' || isNaN(id) || id <= 0) {
    throw new Error("El parámetro 'id' debe ser un número positivo válido.");
  }
  // Verificamos que al menos se haya proporcionado un parámetro de actualización válido.
  const providedFields: string[] = [];
  if (typeof params.descripcion === 'string' && params.descripcion.trim() !== '') {
    providedFields.push("descripcion");
  }
  if (typeof params.abreviacion === 'string' && params.abreviacion.trim() !== '') {
    providedFields.push("abreviacion");
  }
  if (params.padres && Array.isArray(params.padres) && params.padres.length > 0) {
    providedFields.push("padres");
  }
  if (providedFields.length === 0) {
    throw new Error("Debe proporcionar al menos uno de los siguientes parámetros válidos para actualizar: descripcion, abreviacion o padres.");
  }

  try {
    const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
    const token = localStorage.getItem("authToken");
    const resp = await fetch(`${BASE_URL}/ubicaciones-tecnicas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });
    
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Error al actualizar la ubicación técnica, por favor intente de nuevo.");
    }
    return resp.json();
  } catch (error) {
    throw new Error(`updateUbicacionTecnica: ${(error as Error).message}`);
  }
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
      data.error || "Error al eliminar la ubicación técnica, por favor intente de nuevo."
    );
  }
  return resp.json();
}