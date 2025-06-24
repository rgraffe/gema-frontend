import React, { useEffect, useState } from "react";
import { UserCheck, ClipboardPen, Trash2, CirclePlus, UserPlus, UserMinus } from "lucide-react";
import {
  addTecnicoToGrupo,
  createGrupoDeTrabajo,
  deleteTecnicoFromGrupo,
  getAllWorkersInALLGroups,
  getGruposDeTrabajo,
} from "@/services/gruposDeTrabajo";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { getTecnicos } from "@/services/tecnicos";

interface GrupoTrabajo {
  id: number;
  codigo: string;
  nombre: string;
  supervisorId: number | null;
}



const GruposTrabajo: React.FC = () => {
  const [trabajadoresPorGrupo, setTrabajadoresPorGrupo] = useState<Record<number, any[]>>({});
  const [tecnicosDisponibles, setTecnicosDisponibles] = useState<any[]>([])
  const [grupos, setGrupos] = useState<GrupoTrabajo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTecnicosModalOpen, setIsTecnicosModalOpen] = useState(false);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | null>(null);
  const [nuevoGrupo, setNuevoGrupo] = useState({
    codigo: "",
    nombre: "",
    supervisorId: 0,
  });
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<number>(0);

   useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await getGruposDeTrabajo();
        setGrupos(response.data);
        
        // Obtener los trabajadores por grupo 
        const trabajadoresResp = await getAllWorkersInALLGroups();
        // Mapear la respuesta a un objeto { grupoId: usuarios[] }
        const map: Record<number, any[]> = {};
        trabajadoresResp.data.forEach((item: any) => {
          map[item.grupoDeTrabajoId] = item.usuarios;
        });
        setTrabajadoresPorGrupo(map);
        

        // Obtener tecnicos existentes
        const tecnicosResp = await getTecnicos();
        setTecnicosDisponibles(tecnicosResp.data);

      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrupos();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNuevoGrupo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTecnicoSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTecnicoSeleccionado(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supervisorId = nuevoGrupo.supervisorId;

      const nuevoGrupoCreado = await createGrupoDeTrabajo({
        codigo: nuevoGrupo.codigo,
        nombre: nuevoGrupo.nombre,
        supervisorId: nuevoGrupo.supervisorId,
      });

      setGrupos((prev) => [...prev, nuevoGrupoCreado.data]);

      setIsModalOpen(false);
      setNuevoGrupo({ codigo: "", nombre: "", supervisorId: 0 });
    } catch (error: any) {
      alert(`Error al crear el grupo: ${error.message}`);
    }
  };

  const handleAddTecnico = async () => {
    if (!selectedGrupoId || !tecnicoSeleccionado) return;

    try {
      await addTecnicoToGrupo({
        tecnicoId: tecnicoSeleccionado,
        grupoDeTrabajoId: selectedGrupoId
      })
      setTrabajadoresPorGrupo((prev) => {
      const nuevos = tecnicosDisponibles.find(t => t.Id === tecnicoSeleccionado);
      if (!nuevos) return prev;
      return {
        ...prev,
        [selectedGrupoId]: [...(prev[selectedGrupoId] || []), nuevos],
      };
    });
    setTecnicoSeleccionado(0);
  } catch (error: any) {
    alert(error.message || "Error al agregar técnico");
  }
};

const handleRemoveTecnico = async (tecnicoId: number) => {
  if (!selectedGrupoId) return;
  try {
    await deleteTecnicoFromGrupo({
      tecnicoId,
      grupoDeTrabajoId: selectedGrupoId,
    });
    setTrabajadoresPorGrupo((prev) => ({
      ...prev,
      [selectedGrupoId]: prev[selectedGrupoId].filter((t: any) => t.Id !== tecnicoId),
    }));
  } catch (error: any) {
    alert(error.message || "Error al eliminar técnico");
  }
};


  const openTecnicosModal = (grupoId: number) => {
    setSelectedGrupoId(grupoId);
    setIsTecnicosModalOpen(true);
  };

  const getSupervisorNombre = (id: number | null) => {
    return tecnicosDisponibles.find(s => s.id === id)?.nombre || "No asignado";
  };

  if (isLoading) {
    return <div className="p-6 text-center">Cargando grupos de trabajo...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">Grupos de Trabajo</h1>

      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-gema-green hover:bg-green-700 mb-6"
      >
        <CirclePlus />
        Crear nuevo
      </Button>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="codigo"
              >
                Código
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                value={nuevoGrupo.codigo}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="nombre"
              >
                Nombre del Grupo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={nuevoGrupo.nombre}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="supervisor"
              >
                Supervisor
              </label>
              <select
                id="supervisor"
                name="supervisorId"
                value={nuevoGrupo.supervisorId}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Seleccione un supervisor</option>
                {tecnicosDisponibles.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.Nombre} ({sup.Correo})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para gestión de técnicos */}
      <Dialog open={isTecnicosModalOpen} onOpenChange={setIsTecnicosModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Técnicos del Grupo {grupos.find(g => g.id === selectedGrupoId)?.codigo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedGrupoId && (
            <div className="space-y-4">
              {/* Formulario para agregar técnico */}
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="tecnico"
                >
                  Agregar Técnico
                </label>
                <select
                  id="tecnico"
                  name="tecnicoId"
                  value={tecnicoSeleccionado || ''}
                  onChange={handleTecnicoSelectChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="0">Seleccione un técnico</option>
                  {tecnicosDisponibles
                  .filter(tec =>
                    !(trabajadoresPorGrupo[selectedGrupoId]?.some((t: any) => t.Id === tec.Id))
                  )
                  .map((tec) => (
                    <option key={tec.Id} value={tec.Id}>
                      {tec.Nombre} ({tec.Correo})
                    </option>
                  ))}
                </select>
                <div className="flex justify-end mt-2">
                  <Button 
                    className="bg-gema-green hover:bg-green-700"
                    onClick={handleAddTecnico}
                    disabled={!tecnicoSeleccionado}
                    type='button'
                  >
                    <UserPlus className="mr-2" />
                    Agregar Técnico
                  </Button>
                </div>
              </div>
              
              {/* Lista de técnicos */}
              <div className="border rounded-lg divide-y">
                {trabajadoresPorGrupo[selectedGrupoId]?.length ? (
                  trabajadoresPorGrupo[selectedGrupoId].map(tecnico => (
                    <div key={tecnico.Id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{tecnico.Nombre}</p>
                        <p className="text-sm text-gray-600">{tecnico.Correo}</p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveTecnico(tecnico.Id)}
                      >
                        <UserMinus />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-gray-500 text-center">No hay técnicos en este grupo</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto">
        {/* Tabla en desktop */}
        <table className="hidden md:table min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supervisor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Técnicos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {grupos.map((grupo) => (
              <tr key={grupo.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center justify-center border-2 border-gray-300 rounded-lg font-bold">
                    {grupo.codigo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {grupo.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-500" />
                    <span>{getSupervisorNombre(grupo.supervisorId)}</span>
                  </div>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer"
                  onClick={() => openTecnicosModal(grupo.id)}
                >
                  <div className="flex items-center justify-center border-2 border-gray-300 rounded-lg bg-gray-200 font-medium hover:bg-gray-300 transition">
                    {trabajadoresPorGrupo[grupo.id]?.length || 0}
                  </div>
                </td>
                <td className="flex items-center justify-evenly gap-2 px-6 py-4 whitespace-nowrap text-sm">
                  <div className="inline-block p-1 border-2 border-gray-200 rounded-sm">
                    <ClipboardPen className="h-5 w-5 text-blue-500 cursor-pointer" />
                  </div>
                  <div className="inline-block p-1 border-2 border-gray-200 rounded-sm">
                    <Trash2 className="h-5 w-5 text-red-500 cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cards en móvil */}
        <div className="md:hidden space-y-4">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="border-2 border-gray-300 rounded-lg font-bold px-3 py-1 text-sm">
                    {grupo.codigo}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 border-2 border-gray-200 rounded-sm">
                      <ClipboardPen className="h-5 w-5 text-blue-500" />
                    </button>
                    <button className="p-1 border-2 border-gray-200 rounded-sm">
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-900">{grupo.nombre}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{getSupervisorNombre(grupo.supervisorId)}</span>
                </div>

                <div 
                  className="border-2 border-gray-300 rounded-lg bg-gray-200 font-medium px-3 py-1 inline-block text-sm cursor-pointer hover:bg-gray-300"
                  onClick={() => openTecnicosModal(grupo.id)}
                >
                  {trabajadoresPorGrupo[grupo.id]?.length || 0} Técnicos
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GruposTrabajo;