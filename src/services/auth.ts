/**
 * Servicio para manejar el inicio de sesión de un usuario.
 * @author gabrielm
 * @author janbertorelli
 * @param params
 * @param params.email - El correo electrónico del usuario
 * @param params.password - La contraseña del usuario
 * @throws Error si el inicio de sesión falla
 */
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Correo: email, Contraseña: password }),
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(
      data.error || "Error al iniciar sesión, por favor intente de nuevo."
    );
  }
  return resp.json();
}

/**
 * Elimina los datos de sesión del usuario actual
 * @author gabrielm
 */
export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
}
