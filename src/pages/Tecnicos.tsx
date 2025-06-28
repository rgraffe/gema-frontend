import { useState } from "react";
import FormNuevoTecnico from "@/components/FormNuevoTecnico";
import { useQuery } from "@tanstack/react-query";
import { getTecnicos } from "@/services/tecnicos";
import { getAllWorkersInALLGroups, getGruposDeTrabajo } from "@/services/gruposDeTrabajo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Tecnicos = () => {
  const [open, setOpen] = useState(false);
  const [modalTecnicoId, setModalTecnicoId] = useState<number | null>(null);

  const tecnicos = useQuery({ queryKey: ["tecnicos"], queryFn: getTecnicos });
  const grupos = useQuery({queryKey: ["gruposDeTrabajo"], queryFn: getGruposDeTrabajo});
  const trabajadoresPorGrupo = useQuery({
    queryKey: ["trabajadoresPorGrupo"],
    queryFn: getAllWorkersInALLGroups,
    select: (data) => {
        // Mapea la respuesta a un objeto { grupoId: usuarios [] }
        const map: Record<number, any[]> = {};
        data.data.forEach((item: any) => {
            map[item.grupoDeTrabajoId] = item.usuarios;
        });
        return map;
    },
  });

  if (tecnicos.isLoading || grupos.isLoading || trabajadoresPorGrupo.isLoading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  // Mapeo: técnicoId -> array de grupos a los que pertenece
  const tecnicoGruposMap: Record<number, any[]> = {};
  if (trabajadoresPorGrupo.data) {
    Object.entries(trabajadoresPorGrupo.data).forEach(([grupoId, usuarios]) => {
      usuarios.forEach((usuario: any) => {
        if (!tecnicoGruposMap[usuario.Id]) tecnicoGruposMap[usuario.Id] = [];
        const grupo = grupos.data?.data?.find((g: any) => g.id === Number(grupoId));
        if (grupo) tecnicoGruposMap[usuario.Id].push(grupo);
      });
    });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Técnicos</h1>
      <button
        className="mb-4 px-4 py-2 bg-gema-green text-white rounded hover:bg-green-700"
        onClick={() => setOpen(true)}
      >
        Agregar Técnico
      </button>
      <FormNuevoTecnico
        open={open}
        onClose={() => setOpen(false)}
      />

        <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupos de Trabajo</th>
            </tr>
          </thead>
          <tbody>
            {tecnicos.data?.data?.map((tecnico: any) => (
              <tr key={tecnico.Id}>
                <td className="px-6 py-4">{tecnico.Nombre}</td>
                <td className="px-6 py-4">{tecnico.Correo}</td>
                <td className="px-6 py-4">
                  <button
                    className="underline text-gema-green hover:text-green-700"
                    onClick={() => setModalTecnicoId(tecnico.Id)}
                  >
                    {tecnicoGruposMap[tecnico.Id]?.length || 0}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de grupos del técnico */}
      <Dialog open={modalTecnicoId !== null} onOpenChange={() => setModalTecnicoId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grupos de Trabajo</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {modalTecnicoId &&
              (tecnicoGruposMap[modalTecnicoId]?.length ? (
                tecnicoGruposMap[modalTecnicoId].map((grupo) => (
                  <div key={grupo.id} className="border rounded px-3 py-2">
                    <div className="font-medium">{grupo.nombre}</div>
                    <div className="text-xs text-gray-500">Código: {grupo.codigo}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center">No pertenece a ningún grupo</div>
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