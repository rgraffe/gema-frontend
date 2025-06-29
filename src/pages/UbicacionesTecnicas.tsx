import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CirclePlus,
  Building,
  LoaderCircle,
  Trash,
  CornerDownRight,
  Eye,
  EyeOff, // Importar el ícono del ojo cerrado
  FileSpreadsheet,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FormNuevaUbicacion from "@/components/FormNuevaUbicacion";
import { Button } from "@/components/ui/button";
import {
  deleteUbicacionTecnica,
  getUbicacionesDependientes,
  getUbicacionesTecnicas,
  getPadresDeUbicacion, // Importar el nuevo servicio
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
import type {
  UbicacionTecnica,
  PadreUbicacion,
} from "@/types/ubicacionesTecnicas.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NIVELES = [
  "modulo",
  "planta",
  "espacio",
  "tipo",
  "subtipo",
  "numero",
  "pieza",
] as const;

// Componente recursivo para renderizar la jerarquía de ubicaciones
const UbicacionHierarchy: React.FC<{
  ubicaciones: UbicacionTecnica[];
  onEdit: (codigo: string) => void;
  onDelete: (detalle: UbicacionTecnica) => void;
  onViewDetails: (detalle: UbicacionTecnica | null) => void; // Acepta null para cerrar
  activeDetailItem: UbicacionTecnica | null; // Prop para saber qué item está activo
}> = ({ ubicaciones, onEdit, onDelete, onViewDetails, activeDetailItem }) => {
  return (
    <>
      {ubicaciones.map((ubicacion) => {
        const isViewing = activeDetailItem?.idUbicacion === ubicacion.idUbicacion;
        return (
          <div key={ubicacion.idUbicacion}>
            <div className="flex px-4 py-2 bg-white hover:bg-gray-50 items-center">
              <div className="flex-3/5 flex flex-row items-center gap-2">
                <div style={{ paddingLeft: `${(ubicacion.nivel - 1) * 20}px` }}>
                  {ubicacion.nivel > 1 && (
                    <CornerDownRight size={18} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-mono font-semibold text-sm">
                    {ubicacion.codigo_Identificacion}
                  </p>
                  <p className="text-sm text-gray-700">{ubicacion.descripcion}</p>
                </div>
              </div>
              <div className="flex flex-2/5 items-center justify-end gap-1 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-blue-600 !px-2"
                      onClick={() => onViewDetails(isViewing ? null : ubicacion)}
                    >
                      {isViewing ? <EyeOff /> : <Eye />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{isViewing ? "Cerrar detalles" : "Ver detalles"}</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-gray-500 !px-2"
                      onClick={() => onEdit(ubicacion.codigo_Identificacion)}
                    >
                      <CirclePlus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Crear ubicación a partir de esta</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-red-500 !px-2 hover:text-red-600"
                      onClick={() => onDelete(ubicacion)}
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
            {/* Llamada recursiva para los hijos */}
            {ubicacion.children && ubicacion.children.length > 0 && (
              <UbicacionHierarchy
                ubicaciones={ubicacion.children}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
                activeDetailItem={activeDetailItem} // Pasar la prop recursivamente
              />
            )}
          </div>
        );
      })}
    </>
  );
};

const UbicacionesTecnicas: React.FC = () => {
  // Estado de diálogos
  const [open, setOpen] = useState(false);
  const [borrarUbicacion, setBorrarUbicacion] =
    useState<UbicacionTecnica | null>(null);
  const [verDetalle, setVerDetalle] = useState<UbicacionTecnica | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Query para obtener los padres de la ubicación seleccionada para ver detalles
  const { data: padresData, isLoading: isLoadingPadres } = useQuery({
    queryKey: ["padresUbicacion", verDetalle?.idUbicacion],
    queryFn: () => getPadresDeUbicacion(verDetalle!.idUbicacion),
    enabled: !!verDetalle,
  });

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
    const valoresIniciales = { ...formValues };
    let levelAmount = 0;
    NIVELES.forEach((nivel, index) => {
      valoresIniciales[nivel] = nivelesExtraidos[index] || "";
      if (nivelesExtraidos[index]) levelAmount++;
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
    onError: () => toast.error(`Error al eliminar ubicación técnica`),
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

  const flatUbicaciones = React.useMemo(() => {
    if (!data?.data) return [];
    const flatten = (nodes: UbicacionTecnica[]): UbicacionTecnica[] => {
      let list: UbicacionTecnica[] = [];
      for (const node of nodes) {
        const { children, ...rest } = node;
        list.push(rest as UbicacionTecnica);
        if (children && children.length > 0) {
          list = list.concat(flatten(children));
        }
      }
      return list;
    };
    return flatten(data.data);
  }, [data]);

  const getOptions = (nivel: string, prevFilters: typeof filters) => {
    let ubicaciones = flatUbicaciones;
    for (let i = 0; i < NIVELES.length; i++) {
      const n = NIVELES[i];
      if (n === nivel) break;
      if (prevFilters[n]) {
        ubicaciones = ubicaciones.filter(
          (u) =>
            (u.codigo_Identificacion.split("-")[i] || "") === prevFilters[n]
        );
      }
    }
    const idx = NIVELES.indexOf(nivel as (typeof NIVELES)[number]);
    return Array.from(
      new Set(
        ubicaciones.map((u) => u.codigo_Identificacion.split("-")[idx] || "")
      )
    ).filter(Boolean);
  };

  const filteredData = React.useMemo(() => {
    if (!data?.data) return [];
    if (!Object.values(filters).some(Boolean)) return data.data;

    const filterTree = (nodes: UbicacionTecnica[]): UbicacionTecnica[] => {
      return nodes.reduce((acc, node) => {
        const children = node.children ? filterTree(node.children) : [];
        const parts = node.codigo_Identificacion.split("-");
        const selfMatch = NIVELES.every(
          (nivel, idx) => !filters[nivel] || parts[idx] === filters[nivel]
        );

        if (selfMatch || children.length > 0) {
          acc.push({ ...node, children });
        }
        return acc;
      }, [] as UbicacionTecnica[]);
    };

    return filterTree(data.data);
  }, [data, filters]);

  const countChildren = (node: UbicacionTecnica): number => {
    if (!node.children || node.children.length === 0) return 0;
    return (
      node.children.length +
      node.children.reduce((sum, child) => sum + countChildren(child), 0)
    );
  };

  if (isLoading)
    return (
      <div className="p-6">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  if (error) return <div>Error al obtener ubicaciones técnicas</div>;

  const handleExportExcel = async () => {
    const exportTimer = setTimeout(() => {
      setIsExporting(true);
    }, 500); // Espera 500ms para mostrar el loader

    try {
      const url = `${import.meta.env.VITE_BACKEND_BASE_URL}/ubicaciones-tecnicas/export/excel`;
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "ubicaciones.xlsx"; // Nombre por defecto
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Limpieza
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error en la exportación a Excel:", error);
      toast.error("No se pudo exportar a Excel.");
    } finally {
      clearTimeout(exportTimer);
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-3">Ubicaciones Técnicas</h1>

      <div className="flex gap-2">
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
        <Button
          className="mb-5 bg-gema-blue hover:bg-blue-500"
          onClick={handleExportExcel}
          disabled={isExporting}
        >
          {isExporting ? (
            <LoaderCircle className="animate-spin mr-2" />
          ) : (
            <FileSpreadsheet className="mr-2" />
          )}
          {isExporting ? "Exportando..." : "Exportar a Excel"}
        </Button>
      </div>

      {/* Diálogo para ver detalles de la ubicación */}
      <Dialog
        open={!!verDetalle}
        onOpenChange={(isOpen) => !isOpen && setVerDetalle(null)}
      >
        <DialogContent className="min-w-xl">
          <div>
            <h2 className="font-semibold text-lg text-center mb-3">
              Detalles de la Ubicación
            </h2>
            {verDetalle && (
              <ul className="mt-3 list-disc px-3 space-y-2">
                <li className="text-neutral-700 text-sm">
                  <b>Código:</b> {verDetalle.codigo_Identificacion}
                </li>
                <li className="text-neutral-700 text-sm">
                  <b>Descripción:</b> {verDetalle.descripcion}
                </li>
              </ul>
            )}
            <h3 className="font-semibold text-md mt-4 mb-2">Padres</h3>
            {isLoadingPadres ? (
              <LoaderCircle className="animate-spin mx-auto mt-3" />
            ) : padresData?.data?.length > 0 ? (
              <ul className="mt-3 list-disc px-3 space-y-2">
                {padresData.data.map((padre: PadreUbicacion) => (
                  <li
                    key={padre.idUbicacion}
                    className="text-neutral-700 text-sm"
                  >
                    {padre.codigo_Identificacion} - {padre.descripcion}
                    {padre.esUbicacionFisica && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Ubicación Física
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-neutral-700 mt-3">
                Esta ubicación no tiene padres asignados.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setVerDetalle(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
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
                <b>Código de identificación:</b>{" "}
                {borrarUbicacion?.codigo_Identificacion}
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
      {!!flatUbicaciones.length && (
        <p className="text-sm text-neutral-800 font-semibold">Filtrar:</p>
      )}
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
                  for (let i = idx + 1; i < NIVELES.length; i++)
                    updated[NIVELES[i]] = "";
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
        defaultValue={filteredData[0]?.codigo_Identificacion}
      >
        {filteredData.map((ubicacion) => (
          <AccordionItem
            key={ubicacion.idUbicacion}
            value={ubicacion.codigo_Identificacion}
          >
            <AccordionTrigger className="bg-gray-100 hover:bg-gray-200 hover:cursor-pointer px-3">
              <span className="flex items-center gap-2">
                <Building className="text-blue-600 w-5 h-5" />
                <span className="text-lg font-semibold">
                  {ubicacion.codigo_Identificacion}
                </span>
                <span className="bg-gray-200 text-xs font-medium px-2 py-0.5 rounded-full ml-2 text-neutral-600">
                  {1 + countChildren(ubicacion)} ubicaciones
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <UbicacionHierarchy
                ubicaciones={[ubicacion]}
                onEdit={initializeFormValues}
                onDelete={setBorrarUbicacion}
                onViewDetails={setVerDetalle}
                activeDetailItem={verDetalle}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default UbicacionesTecnicas;
