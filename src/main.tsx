import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import App from "./App";
import ProtectedRoute from "./components/ui/protected-route";
import "./index.css";
import Canva from "./pages/Canva";
// import VistaGeneral from "./pages/VistaGeneral";
import UbicacionesTecnicas from "./pages/UbicacionesTecnicas";
import GruposTrabajo from "./components/GruposTrabajo";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();

// Inicializar router de la aplicación
const router = createBrowserRouter([
  {
    path: "/iniciar-sesion",
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
      // {
      //   path: "general",
      //   element: <VistaGeneral />,
      // },
      {
        path: "ubicaciones-tecnicas",
        element: <UbicacionesTecnicas />,
      },
      {
        path: "grupos",
        element: <GruposTrabajo />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-center" theme="light" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
