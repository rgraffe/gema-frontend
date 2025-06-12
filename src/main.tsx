import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "./Auth/Login";
import App from "./App";
import ProtectedRoute from "./components/ui/protected-route";
import "./index.css";
import Canva from "./pages/Canva";
import VistaGeneral from "./pages/VistaGeneral";
import UbicacionesTecnicas from "./pages/UbicacionesTecnicas";
import GruposTrabajo from "./components/GruposTrabajo";

// Inicializar router de la aplicación
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Canva />,
      },
      {
        path: "general",
        element: <VistaGeneral />,
      },
      {
        path: "locations",
        element: <UbicacionesTecnicas />,
      },
      {
        path: "groups",
        element: <GruposTrabajo />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
