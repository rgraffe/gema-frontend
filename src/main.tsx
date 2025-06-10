import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App"
import Canva from "./pages/Canva"
import VistaGeneral from "./pages/VistaGeneral"
import UbicacionesTecnicas from "./pages/UbicacionesTecnicas"
import GruposTrabajo from "./components/GruposTrabajo"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)