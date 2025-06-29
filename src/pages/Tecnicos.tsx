import { useState } from "react";
import FormNuevoTecnico from "@/components/FormNuevoTecnico";
import { useQuery } from "@tanstack/react-query";
import { getTecnicos } from "@/services/tecnicos";
import {
  getAllWorkersInALLGroups,
  getGruposDeTrabajo,
} from "@/services/gruposDeTrabajo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Tecnico } from "@/types/tecnicos.types";
import { CirclePlus, LoaderCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GrupoTrabajo {
  id: number;
  codigo: string;
  nombre: string;
  supervisorId: number | null;
}

interface TrabajaEnGrupo {
  grupoDeTrabajoId: number;
  usuarios: Tecnico[];
}

const Tecnicos = () => {
  const [open, setOpen] = useState(false);
  const [modalTecnicoId, setModalTecnicoId] = useState<number | null>(null);

  const tecnicos = useQuery<{ data: Tecnico[] }>({
    queryKey: ["tecnicos"],
    queryFn: getTecnicos,
  });
  const grupos = useQuery<{ data: GrupoTrabajo[] }>({
    queryKey: ["gruposDeTrabajo"],
    queryFn: getGruposDeTrabajo,
  });
  const trabajadoresPorGrupo = useQuery({
    queryKey: ["trabajadoresPorGrupo"],
    queryFn: getAllWorkersInALLGroups,
    select: (data: { data: TrabajaEnGrupo[] }) => {
      // Mapea la respuesta a un objeto { grupoId: usuarios [] }
      const map: Record<number, Tecnico[]> = {};
      data.data.forEach((item) => {
        map[item.grupoDeTrabajoId] = item.usuarios;
      });
      return map;
    },
  });

  if (
    tecnicos.isLoading ||
    grupos.isLoading ||
    trabajadoresPorGrupo.isLoading
  ) {
    return (
      <div className="p-6 text-center">
        <LoaderCircle className="animate-spin h-5 w-5" />
      </div>
    );
  }

  // Mapeo: técnicoId -> array de grupos a los que pertenece
  const tecnicoGruposMap: Record<number, GrupoTrabajo[]> = {};
  if (trabajadoresPorGrupo.data && grupos.data) {
    Object.entries(trabajadoresPorGrupo.data).forEach(([grupoId, usuarios]) => {
      usuarios.forEach((usuario) => {
        if (!tecnicoGruposMap[usuario.Id]) tecnicoGruposMap[usuario.Id] = [];
        const grupo = grupos.data?.data?.find((g) => g.id === Number(grupoId));
        if (grupo) tecnicoGruposMap[usuario.Id].push(grupo);
      });
    });
  }

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-3">Técnicos</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-5 bg-gema-green hover:bg-green-700">
            <CirclePlus className="mr-2" />
            Crear nuevo técnico
          </Button>
        </DialogTrigger>
        <FormNuevoTecnico open={open} onClose={() => setOpen(false)} />
      </Dialog>

      <div className="overflow-x-auto">
        <table className="hidden md:table min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Grupos de Trabajo
              </th>
            </tr>
          </thead>
          <tbody>
            {tecnicos.data?.data?.map((tecnico) => (
              <tr key={tecnico.Id}>
                <td className="px-6 py-4 text-sm">{tecnico.Nombre}</td>
                <td className="px-6 py-4 text-sm">{tecnico.Correo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        role="button"
                        className="flex items-center justify-center border-2 border-gray-300 rounded-lg bg-gray-200 hover:bg-gray-300 transition w-fit px-4 cursor-pointer"
                        onClick={() => setModalTecnicoId(tecnico.Id)}
                      >
                        Pertenece a {tecnicoGruposMap[tecnico.Id]?.length || 0}{" "}
                        grupo
                        {tecnicoGruposMap[tecnico.Id]?.length === 1 ? "" : "s"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Ver grupos</span>
                    </TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de grupos del técnico */}
      <Dialog
        open={modalTecnicoId !== null}
        onOpenChange={() => setModalTecnicoId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grupos de Trabajo</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-3">
            {modalTecnicoId &&
              (tecnicoGruposMap[modalTecnicoId]?.length ? (
                tecnicoGruposMap[modalTecnicoId].map((grupo) => (
                  <div key={grupo.id} className="border rounded px-3 py-2">
                    <div className="font-medium">{grupo.nombre}</div>
                    <div className="text-xs text-gray-500">
                      Código: {grupo.codigo}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center">
                  No pertenece a ningún grupo
                </div>
              ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setModalTecnicoId(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tecnicos;
