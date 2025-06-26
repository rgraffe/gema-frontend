import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CirclePlus,
  Building,
  LoaderCircle,
  Trash,
  CornerDownRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FormNuevaUbicacion from "@/components/FormNuevaUbicacion";
import { Button } from "@/components/ui/button";
import {
  deleteUbicacionTecnica,
  getUbicacionesDependientes,
  getUbicacionesTecnicas,
} from "@/services/ubicacionesTecnicas";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import type { UbicacionTecnica } from "@/types/ubicacionesTecnicas.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DetalleUbicacion {
  idUbicacion: number;
  codigo: string;
  descripcion: string;
  nivel: number;
}

interface Modulo {
  modulo: string;
  cantidad: number;
  detalles: DetalleUbicacion[];
}

const NIVELES = [
  "modulo",
  "planta",
  "espacio",
  "tipo",
  "subtipo",
  "numero",
  "pieza",
] as const;

const UbicacionesTecnicas: React.FC = () => {
  // Estado de diálogos
  const [open, setOpen] = useState(false);
  const [borrarUbicacion, setBorrarUbicacion] =
    useState<DetalleUbicacion | null>(null);

  // Dependencias de la ubicación a eliminar
  const dependencias = useQuery({
    queryFn: () =>
      getUbicacionesDependientes(borrarUbicacion?.idUbicacion || 0),
    queryKey: ["ubicacionesDependientes", borrarUbicacion?.idUbicacion],
    enabled: !!borrarUbicacion,
  });

  // Estado para crear ubicación
  const [formValues, setFormValues] = useState({
    modulo: "",
    planta: "",
    espacio: "",
    tipo: "",
    subtipo: "",
    numero: "",
    pieza: "",
    descripcion: "",
  });
  const [displayedLevels, setDisplayedLevels] = useState<number>(1);

  const initializeFormValues = (codigo: string) => {
    // Extraer los niveles del código de identificación
    const nivelesExtraidos = codigo.split("-");
    const valoresIniciales = {
      modulo: "",
      planta: "",
      espacio: "",
      tipo: "",
      subtipo: "",
      numero: "",
      pieza: "",
      descripcion: "",
    };

    // Asignar los valores a los campos correspondientes
    let levelAmount = 0;
    NIVELES.forEach((nivel, index) => {
      valoresIniciales[nivel] = nivelesExtraidos[index] || "";
      if (nivelesExtraidos[index]) {
        levelAmount++;
      }
    });

    // Actualizar el estado del formulario con los valores extraídos
    setFormValues(valoresIniciales);
    setDisplayedLevels(levelAmount + 1);
    setOpen(true);
  };

  // Usamos useQuery para llamar al servicio getUbicacionesTecnicas
  const { data, error, isLoading } = useQuery({
    queryKey: ["ubicacionesTecnicas"],
    queryFn: getUbicacionesTecnicas,
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUbicacionTecnica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ubicacionesTecnicas"] });
      setBorrarUbicacion(null);
      toast.success("Ubicación técnica eliminada correctamente");
    },
    onError: () => {
      toast.error(`Error al eliminar ubicación técnica`);
    },
  });

  const [filters, setFilters] = useState({
    modulo: "",
    planta: "",
    espacio: "",
    tipo: "",
    subtipo: "",
    numero: "",
    pieza: "",
  });

  // Obtener opciones únicas para cada nivel según el filtro anterior
  const getOptions = (nivel: string, prevFilters: typeof filters) => {
    if (!data || !data.data) return [];
    let ubicaciones = data.data;
    const niveles = [
      "modulo",
      "planta",
      "espacio",
      "tipo",
      "subtipo",
      "numero",
      "pieza",
    ] as const;
    // Filtrar por los niveles anteriores
    for (let i = 0; i < niveles.length; i++) {
      const n = niveles[i];
      if (n === nivel) break;
      if (prevFilters[n]) {
        ubicaciones = ubicaciones.filter(
          (u) =>
            (u.codigo_Identificacion.split("-")[i] || "") === prevFilters[n]
        );
      }
    }
    // Obtener opciones únicas para el nivel actual
    const idx = niveles.indexOf(nivel as (typeof NIVELES)[number]);
    const opciones = Array.from(
      new Set(
        ubicaciones.map((u) => u.codigo_Identificacion.split("-")[idx] || "")
      )
    ).filter(Boolean);
    return opciones;
  };

  // Filtrar módulos y detalles según los filtros
  const filteredModulos = React.useMemo(() => {
    if (!data || !data.data) return [];
    let ubicaciones = data.data;
    const niveles = [
      "modulo",
      "planta",
      "espacio",
      "tipo",
      "subtipo",
      "numero",
      "pieza",
    ] as const;
    for (let i = 0; i < niveles.length; i++) {
      const n = niveles[i];
      if (filters[n]) {
        ubicaciones = ubicaciones.filter(
          (u) => (u.codigo_Identificacion.split("-")[i] || "") === filters[n]
        );
      } else {
        break;
      }
    }
    // Agrupar igual que antes
    const agrupados = ubicaciones.reduce(
      (acc: Record<string, Modulo>, item) => {
        const key = item.codigo_Identificacion.split("-")[0];
        if (!acc[key]) {
          acc[key] = { modulo: key, cantidad: 0, detalles: [] };
        }
        acc[key].cantidad += 1;
        acc[key].detalles.push({
          idUbicacion: item.idUbicacion,
          codigo: item.codigo_Identificacion,
          descripcion: item.descripcion,
          nivel: item.nivel,
        });
        return acc;
      },
      {} as Record<string, Modulo>
    );
    return Object.values(agrupados);
  }, [data, filters]);

  if (isLoading)
    return (
      <div className="p-6">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  if (error) return <div>Error al obtener ubicaciones técnicas</div>;

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-3">Ubicaciones Técnicas</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-5 bg-gema-green hover:bg-green-700">
            <CirclePlus className="mr-2" />
            Crear nueva ubicación
          </Button>
        </DialogTrigger>
        <FormNuevaUbicacion
          open={open}
          onClose={() => setOpen(false)}
          formValues={formValues}
          setFormValues={setFormValues}
          displayedLevels={displayedLevels}
          setDisplayedLevels={setDisplayedLevels}
        />
      </Dialog>

      <Dialog
        open={!!borrarUbicacion}
        onOpenChange={(open) => {
          if (!open) setBorrarUbicacion(null);
        }}
      >
        <DialogContent className="min-w-xl">
          <div>
            <h2 className="font-semibold text-lg text-center mb-3">
              ¿Seguro que desea eliminar esta ubicación técnica?
            </h2>
            <ul className="mt-3 list-disc px-3 space-y-2">
              <li className="text-neutral-700 text-sm">
                <b>Nombre de la ubicación:</b> {borrarUbicacion?.descripcion}
              </li>
              <li className="text-neutral-700 text-sm">
                <b>Código de identificación:</b> {borrarUbicacion?.codigo}
              </li>
            </ul>
            <p className="text-neutral-700 text-sm pt-4">
              Esto eliminará la ubicación, y todas las listadas a continuación:
            </p>
            {dependencias.isLoading ? (
              <LoaderCircle className="animate-spin mx-auto mt-3" />
            ) : dependencias.data?.data.length ? (
              <ul className="mt-3 list-disc px-3 space-y-2">
                {dependencias.data.data.map((dep: UbicacionTecnica) => (
                  <li
                    key={dep.idUbicacion}
                    className="text-neutral-700 text-sm"
                  >
                    {dep.descripcion} ({dep.codigo_Identificacion})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-neutral-700 mt-3">
                No hay ubicaciones dependientes.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => setBorrarUbicacion(null)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  deleteMutation.mutate(borrarUbicacion?.idUbicacion || 0)
                }
                disabled={deleteMutation.isPending}
              >
                <Trash /> Eliminar{" "}
                {deleteMutation.isPending && (
                  <LoaderCircle className="animate-spin ml-2" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filtros por niveles */}
      <p className="text-sm text-neutral-800 font-semibold">Filtrar:</p>
      <div className="flex flex-wrap gap-3 mb-5">
        {NIVELES.map((nivel, idx) => {
          // Solo mostrar el siguiente selector si el anterior está seleccionado
          if (idx > 0 && !filters[NIVELES[idx - 1]]) return null;
          const opciones = getOptions(nivel, filters);
          if (!opciones.length) return null;
          return (
            <Select
              value={filters[nivel]}
              key={nivel}
              onValueChange={(value) => {
                setFilters((prev) => {
                  // Limpiar los niveles siguientes
                  const updated = { ...prev };
                  updated[nivel] = value;
                  for (let i = idx + 1; i < NIVELES.length; i++) {
                    updated[NIVELES[i]] = "";
                  }
                  return updated;
                });
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={`Seleccionar nivel ${idx + 1}`} />
              </SelectTrigger>
              <SelectContent>
                {opciones.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
        {Object.values(filters).some(Boolean) && (
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                modulo: "",
                planta: "",
                espacio: "",
                tipo: "",
                subtipo: "",
                numero: "",
                pieza: "",
              })
            }
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-2xl shadow-md mb-2 bg-white rounded-md"
        defaultValue={filteredModulos[0]?.modulo}
      >
        {filteredModulos.map((modulo, index) => (
          <AccordionItem key={index} value={modulo.modulo}>
            <AccordionTrigger className="bg-gray-100 hover:bg-gray-200 hover:cursor-pointer px-3">
              <span className="flex items-center gap-2">
                <Building className="text-blue-600 w-5 h-5" />
                <span className="text-lg font-semibold">{modulo.modulo}</span>
                <span className="bg-gray-200 text-xs font-medium px-2 py-0.5 rounded-full ml-2 text-neutral-600">
                  {modulo.cantidad} ubicaciones
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {modulo.detalles.map((detalle, idx) => (
                <div
                  key={idx}
                  className="flex px-4 py-2 bg-white hover:bg-gray-50"
                >
                  <div className="flex-3/5 flex flex-row gap-2">
                    {detalle.nivel > 1 && (
                      <div className="flex gap-0">
                        {detalle.nivel > 2 && (
                          <div
                            style={{ width: `${(detalle.nivel - 2) * 16}px` }}
                          ></div>
                        )}
                        <CornerDownRight size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-mono font-semibold text-sm">
                        {detalle.codigo}
                      </p>
                      <p className="text-sm text-gray-700">
                        {detalle.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-2/5 items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          className="text-gray-500 !px-2"
                          onClick={() => initializeFormValues(detalle.codigo)}
                        >
                          <CirclePlus />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>Crear ubicación a partir de esta</span>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          className="text-red-500 !px-2 hover:text-red-600"
                          onClick={() => setBorrarUbicacion(detalle)}
                        >
                          <Trash />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>Eliminar ubicación</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default UbicacionesTecnicas;
