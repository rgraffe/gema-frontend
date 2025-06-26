import { useState } from "react";
import {
  UserCheck,
  ClipboardPen,
  Trash2,
  CirclePlus,
  UserPlus,
  UserMinus,
  LoaderCircle,
} from "lucide-react";
import {
  addTecnicoToGrupo,
  createGrupoDeTrabajo,
  deleteGrupoDeTrabajo,
  deleteTecnicoFromGrupo,
  editGrupoDeTrabajo,
  getAllWorkersInALLGroups,
  getGruposDeTrabajo,
} from "@/services/gruposDeTrabajo";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { getTecnicos } from "@/services/tecnicos";
import { z } from "zod";
import { grupoTrabajoSchema } from "@/validators/grupoTrabajoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Usuario } from "@/types/usuarios.types";
import { toast } from "sonner";
import type { Tecnico } from "@/types/tecnicos.types";
import { Label } from "./ui/label";

interface GrupoTrabajo {
  id: number;
  codigo: string;
  nombre: string;
  supervisorId: number | null;
}

const GruposTrabajo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTecnicosModalOpen, setIsTecnicosModalOpen] = useState(false);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | null>(null);
  const [grupoEditar, setGrupoEditar] = useState<GrupoTrabajo | null>(null);
  const [grupoEliminar, setGrupoEliminar] = useState<GrupoTrabajo | null>(null);

  const gruposTrabajo = useQuery({
    queryKey: ["gruposTrabajo"],
    queryFn: () => getGruposDeTrabajo(),
  });

  const tecnicos = useQuery({
    queryKey: ["tecnicos"],
    queryFn: () => getTecnicos(),
  });

  const trabajadoresPorGrupo = useQuery({
    queryKey: ["trabajadoresPorGrupo"],
    queryFn: () => getAllWorkersInALLGroups(),
    select: (data) => {
      // Mapear la respuesta a un objeto { grupoId: usuarios[] }
      const map: Record<number, Usuario[]> = {};
      data.data.forEach((item) => {
        map[item.grupoDeTrabajoId] = item.usuarios;
      });
      return map;
    },
  });

  const isLoading =
    gruposTrabajo.isLoading ||
    tecnicos.isLoading ||
    trabajadoresPorGrupo.isLoading;

  const openTecnicosModal = (grupoId: number) => {
    setSelectedGrupoId(grupoId);
    setIsTecnicosModalOpen(true);
  };

  const getSupervisorNombre = (id: number | null) =>
    tecnicos.data?.data.find((s) => s.Id === id)?.Nombre || "No asignado";

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <LoaderCircle className="animate-spin text-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-3">Grupos de Trabajo</h1>

      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-gema-green hover:bg-green-700 mb-6"
      >
        <CirclePlus />
        Crear nuevo
      </Button>

      <CreateGrupoForm
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        tecnicosDisponibles={tecnicos.data?.data || []}
      />

      <GestionTecnicosForm
        isTecnicosModalOpen={isTecnicosModalOpen}
        setIsTecnicosModalOpen={setIsTecnicosModalOpen}
        grupoTrabajo={
          gruposTrabajo.data?.data.find((g) => g.id === selectedGrupoId) || null
        }
        tecnicosDisponibles={tecnicos.data?.data || []}
        trabajadoresPorGrupo={trabajadoresPorGrupo.data || {}}
      />

      {grupoEditar && (
        <EditGrupoForm
          grupo={grupoEditar}
          setGrupo={setGrupoEditar}
          tecnicosDisponibles={tecnicos.data?.data || []}
        />
      )}

      <EliminarGrupoForm grupo={grupoEliminar} setGrupo={setGrupoEliminar} />

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
            {gruposTrabajo.data?.data.map((grupo) => (
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
                    {trabajadoresPorGrupo.data?.[grupo.id]?.length || 0}
                  </div>
                </td>
                <td className="flex items-center justify-evenly gap-2 px-6 py-4 whitespace-nowrap text-sm">
                  <div className="inline-block p-1 border-2 border-gray-200 rounded-sm">
                    <ClipboardPen
                      className="h-5 w-5 text-blue-500 cursor-pointer"
                      onClick={() => setGrupoEditar(grupo)}
                    />
                  </div>
                  <div className="inline-block p-1 border-2 border-gray-200 rounded-sm">
                    <Trash2
                      className="h-5 w-5 text-red-500 cursor-pointer"
                      onClick={() => setGrupoEliminar(grupo)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cards en móvil */}
        <div className="md:hidden space-y-4">
          {gruposTrabajo.data?.data.map((grupo) => (
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
                      <Trash2
                        className="h-5 w-5 text-red-500"
                        onClick={() => setGrupoEliminar(grupo)}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-900">{grupo.nombre}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <span className="text-sm">
                    {getSupervisorNombre(grupo.supervisorId)}
                  </span>
                </div>

                <div
                  className="border-2 border-gray-300 rounded-lg bg-gray-200 font-medium px-3 py-1 inline-block text-sm cursor-pointer hover:bg-gray-300"
                  onClick={() => openTecnicosModal(grupo.id)}
                >
                  {trabajadoresPorGrupo.data?.[grupo.id]?.length || 0} Técnicos
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function CreateGrupoForm({
  isModalOpen,
  setIsModalOpen,
  tecnicosDisponibles,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  tecnicosDisponibles: Tecnico[];
}) {
  const grupoForm = useForm<z.infer<typeof grupoTrabajoSchema>>({
    resolver: zodResolver(grupoTrabajoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
    },
  });

  const queryClient = useQueryClient();

  const createGrupoMutation = useMutation({
    mutationFn: createGrupoDeTrabajo,
    onSuccess: () => {
      grupoForm.reset();
      setIsModalOpen(false);
      toast.success("Grupo creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["gruposTrabajo"] });
      queryClient.invalidateQueries({ queryKey: ["trabajadoresPorGrupo"] });
    },
    onError: (error: Error) => {
      console.error("Error al crear el grupo:", error.message);
      toast.error("Error al crear el grupo");
    },
  });

  const handleSubmit = (values: z.infer<typeof grupoTrabajoSchema>) => {
    createGrupoMutation.mutate({
      codigo: values.codigo,
      nombre: values.nombre,
      supervisorId: Number(values.supervisor),
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Grupo</DialogTitle>
        </DialogHeader>
        <Form {...grupoForm}>
          <form
            onSubmit={grupoForm.handleSubmit((values) => handleSubmit(values))}
            className="p-6 space-y-4"
          >
            <FormField
              control={grupoForm.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: SGMREF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={grupoForm.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Grupo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ejemplo: Grupo de Mantenimiento de Refrigeración"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={grupoForm.control}
              name="supervisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tecnicosDisponibles.map((sup) => (
                        <SelectItem key={sup.Id} value={String(sup.Id)}>
                          {sup.Nombre} ({sup.Correo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gema-green hover:bg-green-700"
              >
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function GestionTecnicosForm({
  isTecnicosModalOpen,
  setIsTecnicosModalOpen,
  grupoTrabajo,
  tecnicosDisponibles,
  trabajadoresPorGrupo,
}: {
  isTecnicosModalOpen: boolean;
  setIsTecnicosModalOpen: (open: boolean) => void;
  grupoTrabajo: GrupoTrabajo | null;
  tecnicosDisponibles: Tecnico[];
  trabajadoresPorGrupo: Record<number, Usuario[]>;
}) {
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<string | null>(
    null
  );

  const queryClient = useQueryClient();

  const addTecnicoMutation = useMutation({
    mutationFn: addTecnicoToGrupo,
    onSuccess: () => {
      setTecnicoSeleccionado(null);
      toast.success("Técnico agregado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["trabajadoresPorGrupo"] });
    },
    onError: (error: Error) => {
      console.error("Error al agregar técnico:", error.message);
      toast.error("Error al agregar técnico");
    },
  });

  const handleAddTecnico = () => {
    if (!grupoTrabajo || !tecnicoSeleccionado) return;
    addTecnicoMutation.mutate({
      tecnicoId: Number(tecnicoSeleccionado),
      grupoDeTrabajoId: grupoTrabajo.id,
    });
  };

  const removeTecnicoMutation = useMutation({
    mutationFn: deleteTecnicoFromGrupo,
    onSuccess: () => {
      toast.success("Técnico eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["trabajadoresPorGrupo"] });
    },
    onError: (error: Error) => {
      console.error("Error al eliminar técnico:", error.message);
      toast.error("Error al eliminar técnico");
    },
  });

  const handleRemoveTecnico = (tecnicoId: number) => {
    if (!grupoTrabajo) return;
    removeTecnicoMutation.mutate({
      tecnicoId,
      grupoDeTrabajoId: grupoTrabajo.id,
    });
  };

  return (
    <Dialog open={isTecnicosModalOpen} onOpenChange={setIsTecnicosModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Técnicos del Grupo {grupoTrabajo?.codigo}
          </DialogTitle>
        </DialogHeader>

        {grupoTrabajo && (
          <div className="space-y-4 mt-3">
            {/* Formulario para agregar técnico */}
            <div className="mb-6 space-y-2">
              <Label htmlFor="tecnico">Agregar Técnico</Label>
              <Select
                value={tecnicoSeleccionado || ""}
                onValueChange={setTecnicoSeleccionado}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicosDisponibles
                    .filter(
                      (tec) =>
                        !trabajadoresPorGrupo[grupoTrabajo.id]?.some(
                          (t) => t.Id === tec.Id
                        )
                    )
                    .map((tec) => (
                      <SelectItem key={tec.Id} value={String(tec.Id)}>
                        {tec.Nombre} ({tec.Correo})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex justify-end mt-2">
                <Button
                  className="bg-gema-green hover:bg-green-700"
                  onClick={handleAddTecnico}
                  disabled={!tecnicoSeleccionado}
                  type="button"
                >
                  <UserPlus className="mr-2" />
                  Agregar Técnico
                </Button>
              </div>
            </div>

            {/* Lista de técnicos */}
            <div className="border rounded-lg divide-y">
              {trabajadoresPorGrupo[grupoTrabajo.id]?.length ? (
                trabajadoresPorGrupo[grupoTrabajo.id].map((tecnico) => (
                  <div
                    key={tecnico.Id}
                    className="p-4 flex justify-between items-center hover:bg-gray-50"
                  >
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
                <p className="p-4 text-gray-500 text-center">
                  No hay técnicos en este grupo
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditGrupoForm({
  grupo,
  setGrupo,
  tecnicosDisponibles,
}: {
  grupo: GrupoTrabajo | null;
  setGrupo: (grupo: GrupoTrabajo | null) => void;
  tecnicosDisponibles: Tecnico[];
}) {
  const grupoForm = useForm<z.infer<typeof grupoTrabajoSchema>>({
    resolver: zodResolver(grupoTrabajoSchema),
    defaultValues: {
      codigo: grupo?.codigo || "",
      nombre: grupo?.nombre || "",
      supervisor: grupo?.supervisorId ? grupo.supervisorId : undefined,
    },
  });

  const queryClient = useQueryClient();

  const editGrupoMutation = useMutation({
    mutationFn: editGrupoDeTrabajo,
    onSuccess: () => {
      grupoForm.reset();
      setGrupo(null);
      toast.success("Grupo editado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["gruposTrabajo"] });
      queryClient.invalidateQueries({ queryKey: ["trabajadoresPorGrupo"] });
    },
    onError: (error: Error) => {
      console.error("Error al editar el grupo:", error.message);
      toast.error("Error al editar el grupo");
    },
  });

  const handleSubmit = (values: z.infer<typeof grupoTrabajoSchema>) => {
    if (!grupo) return;
    editGrupoMutation.mutate({
      id: grupo.id,
      codigo: values.codigo,
      nombre: values.nombre,
      supervisorId: Number(values.supervisor),
    });
  };

  return (
    <Dialog
      open={grupo !== null}
      onOpenChange={(open) => {
        if (!open) setGrupo(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
        </DialogHeader>
        <Form {...grupoForm}>
          <form
            onSubmit={grupoForm.handleSubmit((values) => handleSubmit(values))}
            className="p-6 space-y-4"
          >
            <FormField
              control={grupoForm.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: SGMREF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={grupoForm.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Grupo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ejemplo: Grupo de Mantenimiento de Refrigeración"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={grupoForm.control}
              name="supervisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tecnicosDisponibles.map((sup) => (
                        <SelectItem key={sup.Id} value={String(sup.Id)}>
                          {sup.Nombre} ({sup.Correo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGrupo(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gema-green hover:bg-green-700"
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EliminarGrupoForm({
  grupo,
  setGrupo,
}: {
  grupo: GrupoTrabajo | null;
  setGrupo: (grupo: GrupoTrabajo | null) => void;
}) {
  const queryClient = useQueryClient();

  const deleteGrupoMutation = useMutation({
    mutationFn: deleteGrupoDeTrabajo,
    onSuccess: () => {
      toast.success("Grupo eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["gruposTrabajo"] });
      queryClient.invalidateQueries({ queryKey: ["trabajadoresPorGrupo"] });
      setGrupo(null);
    },
    onError: (error: Error) => {
      console.error("Error al eliminar el grupo:", error.message);
      toast.error("Error al eliminar el grupo");
    },
  });

  const handleDelete = () => {
    if (!grupo) return;
    deleteGrupoMutation.mutate(grupo.id);
  };

  return (
    <Dialog
      open={grupo !== null}
      onOpenChange={(open) => {
        if (!open) setGrupo(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Grupo</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="mb-4">
            ¿Estás seguro de que deseas eliminar el grupo{" "}
            <strong>{grupo?.nombre}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGrupo(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GruposTrabajo;
