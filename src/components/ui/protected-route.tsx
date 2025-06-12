import { Navigate } from "react-router";

/**
 * Componente de ruta protegida.
 * @param params
 * @description Componente que protege las rutas de la aplicación, revisando si el usuario posee un token.
 * @author gabrielm
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // const isAuthenticated = localStorage.getItem("authToken") !== null;
  const isAuthenticated = true; // Simulación de autenticación, reemplazar con lógica real
  return isAuthenticated ? children : <Navigate to="/login" />;
}
