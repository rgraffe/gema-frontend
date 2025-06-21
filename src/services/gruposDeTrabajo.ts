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