import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CirclePlus, Building, LoaderCircle, Trash } from "lucide-react";
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

interface DetalleUbicacion {
  idUbicacion: number;
  codigo: string;
  descripcion: string;
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

  // Agrupar ubicaciones por el primer segmento del campo codigo_Identificacion (Nivel 1)
  const modulos: Modulo[] = React.useMemo(() => {
    // Se espera que el servicio retorne un objeto con la propiedad 'data' que contiene el arreglo de ubicaciones
    if (!data || !data.data) return [];
    const ubicaciones = data.data;
    const agrupados = ubicaciones.reduce(
      (acc: Record<string, Modulo>, item: any) => {
        // Se asume que el módulo es el primer segmento del codigo_Identificacion
        const key = item.codigo_Identificacion.split("-")[0];
        if (!acc[key]) {
          acc[key] = { modulo: key, cantidad: 0, detalles: [] };
        }
        acc[key].cantidad += 1;
        acc[key].detalles.push({
          idUbicacion: item.idUbicacion,
          codigo: item.codigo_Identificacion,
          descripcion: item.descripcion,
        });
        return acc;
      },
      {} as Record<string, Modulo>
    );
    return Object.values(agrupados);
  }, [data]);

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

      <Accordion
        type="single"
        collapsible
        className="w-2xl shadow-md mb-2 bg-white rounded-md"
        defaultValue={modulos[0]?.modulo}
      >
        {modulos.map((modulo, index) => (
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
                <div key={idx} className="flex p-4 bg-white hover:bg-gray-50">
                  <div className="flex-3/5">
                    <p className="font-mono font-semibold text-sm">
                      {detalle.codigo}
                    </p>
                    <p className="text-sm text-gray-700">
                      {detalle.descripcion}
                    </p>
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
