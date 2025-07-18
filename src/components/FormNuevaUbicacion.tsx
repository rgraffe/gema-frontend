import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ComboSelectInput } from "./ui/comboSelectInput";
import {
  createUbicacionTecnica,
  getUbicacionesPorNivel,
  getUbicacionesTecnicas,
  getUbicacionesDependientes,
} from "@/services/ubicacionesTecnicas";
import { CircleX, Info, LoaderCircle, PlusCircle, Trash } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import type { UbicacionTecnica } from "@/types/ubicacionesTecnicas.types";
import { useState } from "react";
import { Combobox } from "./ui/combobox";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ubicacionTecnicaSchema } from "@/validators/ubicacionTecnicaSchema";

type CreateUbicacionTecnicaPayload = {
  descripcion: string;
  abreviacion: string;
  padres: { idPadre: number; esUbicacionFisica?: boolean }[];
};

type UbicacionTecnicaForm = {
  modulo: string;
  planta: string;
  espacio: string;
  tipo: string;
  subtipo: string;
  numero: string;
  pieza: string;
  descripcion: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  formValues: UbicacionTecnicaForm;
  setFormValues: React.Dispatch<React.SetStateAction<UbicacionTecnicaForm>>;
  displayedLevels: number;
  setDisplayedLevels: React.Dispatch<React.SetStateAction<number>>;
}

const FormNuevaUbicacion: React.FC<Props> = ({
  open,
  onClose,
  formValues,
  setFormValues,
  displayedLevels,
  setDisplayedLevels,
}) => {
  const queryClient = useQueryClient();

  const { data: ubicacionesData, isLoading } = useQuery({
    queryKey: ["ubicacionesTecnicas"],
    queryFn: getUbicacionesTecnicas,
  });

  // Nivel 1: módulo ya viene desde la consulta inicial
  const selectedNivel1 = ubicacionesData?.data?.find(
    (u) => u.abreviacion === formValues.modulo
  );
  const { data: dependientesNivel2, isLoading: loadingNivel2 } = useQuery({
    queryKey: ["ubicacionesDependientes", selectedNivel1?.idUbicacion, 2],
    queryFn: () => getUbicacionesDependientes(selectedNivel1!.idUbicacion, 2),
    enabled: !!selectedNivel1,
  });

  const selectedNivel2 = dependientesNivel2?.data?.find(
    (u) => u.abreviacion === formValues.planta
  );
  const { data: dependientesNivel3, isLoading: loadingNivel3 } = useQuery({
    queryKey: ["ubicacionesDependientes", selectedNivel2?.idUbicacion, 3],
    queryFn: () => getUbicacionesDependientes(selectedNivel2!.idUbicacion, 3),
    enabled: !!selectedNivel2,
  });

  const selectedNivel3 = dependientesNivel3?.data?.find(
    (u) => u.abreviacion === formValues.espacio
  );
  const { data: dependientesNivel4, isLoading: loadingNivel4 } = useQuery({
    queryKey: ["ubicacionesDependientes", selectedNivel3?.idUbicacion, 4],
    queryFn: () => getUbicacionesDependientes(selectedNivel3!.idUbicacion, 4),
    enabled: !!selectedNivel3,
  });

  const selectedNivel4 = dependientesNivel4?.data?.find(
    (u) => u.abreviacion === formValues.tipo
  );
  const { data: dependientesNivel5, isLoading: loadingNivel5 } = useQuery({
    queryKey: ["ubicacionesDependientes", selectedNivel4?.idUbicacion, 5],
    queryFn: () => getUbicacionesDependientes(selectedNivel4!.idUbicacion, 5),
    enabled: !!selectedNivel4,
  });

  const selectedNivel5 = dependientesNivel5?.data?.find(
    (u) => u.abreviacion === formValues.subtipo
  );
  const { data: dependientesNivel6, isLoading: loadingNivel6 } = useQuery({
    queryKey: ["ubicacionesDependientes", selectedNivel5?.idUbicacion, 6],
    queryFn: () => getUbicacionesDependientes(selectedNivel5!.idUbicacion, 6),
    enabled: !!selectedNivel5,
  });

  const selectedNivel6 = dependientesNivel6?.data?.find(
    (u) => u.abreviacion === formValues.numero
  );

  const { data: dependientesNivel7, isLoading: loadingNivel7 } = useQuery({
    queryKey: ["ubicacionesDependientes", selectedNivel6?.idUbicacion, 7],
    queryFn: () => getUbicacionesDependientes(selectedNivel6!.idUbicacion, 7),
    enabled: !!selectedNivel6,
  });

  // Determina si el último nivel seleccionado es una ubicación válida y existente.
  const isLastLevelValid = (() => {
    switch (displayedLevels) {
      case 1:
        return !!selectedNivel1;
      case 2:
        return !!selectedNivel2;
      case 3:
        return !!selectedNivel3;
      case 4:
        return !!selectedNivel4;
      case 5:
        return !!selectedNivel5;
      case 6:
        return !!selectedNivel6;
      default:
        return false; // No se puede agregar más niveles después del 7
    }
  })();

  const [esEquipo, setEsEquipo] = useState(false);

  const closeModal = () => {
    setDisplayedLevels(1);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const generarCodigo = () => {
    const { modulo, planta, espacio, tipo, subtipo, numero, pieza } =
      formValues;
    const niveles = [modulo, planta, espacio, tipo, subtipo, numero, pieza];
    const resultado: string[] = [];
    for (let i = 0; i < niveles.length; i++) {
      if (!niveles[i].trim()) {
        break;
      }
      resultado.push(niveles[i]);
    }
    return resultado.join("-");
  };

  const getAbreviacion = () => {
    const { modulo, planta, espacio, tipo, subtipo, numero, pieza } =
      formValues;
    const levels = [modulo, planta, espacio, tipo, subtipo, numero, pieza];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (levels[i].trim() !== "") {
        return levels[i];
      }
    }
    return "";
  };

  const { mutate, status, isError, error } = useMutation({
    mutationFn: createUbicacionTecnica,
    onSuccess: (data: {
      data: { message: string; ubicacion: UbicacionTecnica };
    }) => {
      queryClient.invalidateQueries({ queryKey: ["ubicacionesTecnicas"] });
      toast.success(data.data.message);
      setFormValues({
        modulo: "",
        planta: "",
        espacio: "",
        tipo: "",
        subtipo: "",
        numero: "",
        pieza: "",
        descripcion: "",
      });
      onClose();
    },
    onError: (err: unknown) => {
      console.error("Error al crear la ubicación técnica:", err);
      toast.error(
        "Error al crear la ubicación técnica, por favor intente de nuevo."
      );
    },
  });

  const posiblesPadres = useQuery({
    queryFn: () => getUbicacionesPorNivel(displayedLevels - 1),
    queryKey: ["ubicacionesPorNivel", displayedLevels - 1],
    enabled: displayedLevels > 1 && esEquipo,
  });

  const [padres, setPadres] = useState<(string | number | null)[]>([null]);

  // Helper function to flatten the hierarchy
  const flattenUbicaciones = (
    nodes: UbicacionTecnica[]
  ): UbicacionTecnica[] => {
    let list: UbicacionTecnica[] = [];
    for (const node of nodes) {
      const { children, ...rest } = node;
      list.push(rest as UbicacionTecnica);
      if (children && children.length > 0) {
        list = list.concat(flattenUbicaciones(children));
      }
    }
    return list;
  };

  const onSubmit = () => {
    if (!ubicacionesData || !ubicacionesData.data) {
      toast.error("Los datos de ubicaciones aún no se han cargado.");
      return;
    }

    // Aplanar la lista de ubicaciones para buscar al padre correctamente
    const flatUbicaciones = flattenUbicaciones(ubicacionesData.data);

    const codigoCompleto = generarCodigo();
    const partes = codigoCompleto.split("-");
    const codigoSinUltimoNivel = partes.slice(0, -1).join("-");

    // Encontrar el padre físico basado en la jerarquía del formulario
    const padreFisico = flatUbicaciones.find(
      (u) => u.codigo_Identificacion === codigoSinUltimoNivel
    );

    const payload: CreateUbicacionTecnicaPayload = {
      descripcion: formValues.descripcion,
      abreviacion: getAbreviacion(),
      padres: [],
    };

    // Si se encontró un padre físico, se agrega como tal.
    if (padreFisico) {
      payload.padres.push({
        idPadre: padreFisico.idUbicacion,
        esUbicacionFisica: true,
      });
    } else if (partes.length > 1) {
      // Si debería tener un padre pero no se encontró, es un error.
      toast.error(
        `Error: No se encontró la ubicación padre con código "${codigoSinUltimoNivel}".`
      );
      return;
    }

    // Si es un equipo, se agregan los padres virtuales seleccionados
    if (esEquipo) {
      const idsPadresVirtuales = padres
        .filter((p) => p !== null)
        .map((id) => ({ idPadre: Number(id), esUbicacionFisica: false }));

      for (const p of idsPadresVirtuales) {
        // Evitar duplicados si un padre virtual ya fue añadido como físico
        if (
          !payload.padres.some((existente) => existente.idPadre === p.idPadre)
        ) {
          payload.padres.push(p);
        }
      }
    }

    // Validaciones finales con Zod
    const validationResult = ubicacionTecnicaSchema.safeParse(payload);
    if (!validationResult.success) {
      validationResult.error.errors.forEach((error) => {
        toast.error(error.message);
      });
      return; // Detener la ejecución si la validación falla
    }

    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-6xl md:min-w-5xl"
        contentClassName="space-y-2"
      >
        <div className="flex items-center gap-1">
          <h2 className="text-xl font-semibold">Crear Ubicación Técnica</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = "/guia-ubicaciones-tecnicas.pdf";
                  link.download = "guia-ubicaciones-tecnicas.pdf";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                aria-label="Descargar guía de ubicaciones técnicas"
              >
                <Info />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Ver guía de ubicaciones técnicas</span>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div>
              <Label className="text-sm">
                Nivel 1 <span className="text-red-500">*</span>
              </Label>
              {/* El ComboSelectInput usa los datos de useQuery para sus opciones */}
              <ComboSelectInput
                name="modulo"
                placeholder={isLoading ? "Cargando..." : "Ejemplo: M2"}
                value={formValues.modulo}
                onChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    modulo: value,
                    planta: "",
                    espacio: "",
                    tipo: "",
                    subtipo: "",
                    numero: "",
                    pieza: "",
                  }))
                }
                options={
                  ubicacionesData?.data
                    ?.filter((u) => u.nivel === 1)
                    .map((u) => ({
                      value: u.abreviacion,
                      label: `${u.abreviacion} - ${u.descripcion}`,
                    })) || []
                }
                disabled={isLoading}
                className="w-full border rounded p-2"
              />
            </div>
            {displayedLevels >= 2 && (
              <div>
                <Label className="text-sm">Nivel 2</Label>
                <ComboSelectInput
                  name="planta"
                  placeholder={loadingNivel2 ? "Cargando..." : "Ejemplo: P01"}
                  value={formValues.planta}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      planta: value,
                      espacio: "",
                      tipo: "",
                      subtipo: "",
                      numero: "",
                      pieza: "",
                    }))
                  }
                  options={
                    dependientesNivel2?.data?.map((u) => ({
                      value: u.abreviacion,
                      label: `${u.abreviacion} - ${u.descripcion}`,
                    })) || []
                  }
                  disabled={loadingNivel2}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 3 && (
              <div>
                <Label className="text-sm">Nivel 3</Label>
                <ComboSelectInput
                  name="espacio"
                  placeholder={
                    loadingNivel3 ? "Cargando..." : "Ejemplo: A2-14, LABBD"
                  }
                  value={formValues.espacio}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      espacio: value,
                      tipo: "",
                      subtipo: "",
                      numero: "",
                      pieza: "",
                    }))
                  }
                  options={
                    dependientesNivel3?.data?.map((u) => ({
                      value: u.abreviacion,
                      label: `${u.abreviacion} - ${u.descripcion}`,
                    })) || []
                  }
                  disabled={loadingNivel3}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 4 && (
              <div>
                <Label className="text-sm">Nivel 4</Label>
                <ComboSelectInput
                  name="tipo"
                  placeholder={loadingNivel4 ? "Cargando..." : "Ejemplo: HVAC"}
                  value={formValues.tipo}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      tipo: value,
                      subtipo: "",
                      numero: "",
                      pieza: "",
                    }))
                  }
                  options={
                    dependientesNivel4?.data?.map((u) => ({
                      value: u.abreviacion,
                      label: `${u.abreviacion} - ${u.descripcion}`,
                    })) || []
                  }
                  disabled={loadingNivel4}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 5 && (
              <div>
                <Label className="text-sm">Nivel 5</Label>
                <ComboSelectInput
                  name="subtipo"
                  placeholder={
                    loadingNivel5 ? "Cargando..." : "Ejemplo: SPLIT, CENT"
                  }
                  value={formValues.subtipo}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      subtipo: value,
                      numero: "",
                      pieza: "",
                    }))
                  }
                  options={
                    dependientesNivel5?.data?.map((u) => ({
                      value: u.abreviacion,
                      label: `${u.abreviacion} - ${u.descripcion}`,
                    })) || []
                  }
                  disabled={loadingNivel5}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 6 && (
              <div>
                <Label className="text-sm">Nivel 6</Label>
                <ComboSelectInput
                  name="numero"
                  placeholder={loadingNivel6 ? "Cargando..." : "Ejemplo: 01"}
                  value={formValues.numero}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      numero: value,
                      pieza: "",
                    }))
                  }
                  options={
                    dependientesNivel6?.data?.map((u) => ({
                      value: u.abreviacion,
                      label: `${u.abreviacion} - ${u.descripcion}`,
                    })) || []
                  }
                  disabled={loadingNivel6}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 7 && (
              <div>
                <Label className="text-sm">Nivel 7</Label>
                <ComboSelectInput
                  name="pieza"
                  placeholder={
                    loadingNivel7 ? "Cargando..." : "Ejemplo: COMP, EVAP"
                  }
                  value={formValues.pieza}
                  onChange={(value) =>
                    setFormValues((prev) => ({ ...prev, pieza: value }))
                  }
                  options={
                    dependientesNivel7?.data?.map((u) => ({
                      value: u.abreviacion,
                      label: `${u.abreviacion} - ${u.descripcion}`,
                    })) || []
                  }
                  disabled={loadingNivel7}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            <div className="flex gap-2 mt-1">
              {displayedLevels >= 2 && (
                <Button
                  className="flex-1 border-red-500 text-red-700 hover:text-red-800"
                  variant="outline"
                  onClick={() => {
                    setDisplayedLevels((prev) => Math.max(prev - 1, 1));
                    setFormValues((prev) => {
                      const newValues = { ...prev };
                      switch (displayedLevels) {
                        case 2:
                          newValues.planta = "";
                          break;
                        case 3:
                          newValues.espacio = "";
                          break;
                        case 4:
                          newValues.tipo = "";
                          break;
                        case 5:
                          newValues.subtipo = "";
                          break;
                        case 6:
                          newValues.numero = "";
                          break;
                        case 7:
                          newValues.pieza = "";
                          break;
                      }
                      return newValues;
                    });
                  }}
                >
                  <Trash /> Eliminar último nivel
                </Button>
              )}
              {displayedLevels < 7 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Se envuelve el botón en un span para que el tooltip funcione incluso cuando está deshabilitado */}
                    <span className="flex-1" tabIndex={0}>
                      <Button
                        className="w-full border-gema-green text-green-700 hover:text-green-800"
                        variant="outline"
                        onClick={() => setDisplayedLevels((prev) => prev + 1)}
                        disabled={!isLastLevelValid}
                      >
                        <PlusCircle />
                        Agregar nivel
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isLastLevelValid && (
                    <TooltipContent>
                      <p>
                        Debes seleccionar una ubicación ya existente para poder agregar un nivel.
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="descripcion">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Input
                name="descripcion"
                placeholder="Ejemplo: Módulo 2, Planta 1, Aula A2-14"
                value={formValues.descripcion}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="bg-slate-200 p-4 pt-3 rounded-sm">
              <span className="text-sm font-semibold">
                Vista previa del código:
              </span>
              <div className="p-2 rounded border-2 border-neutral-300 font-mono text-sm">
                {generarCodigo()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="agregar-padres"
                  checked={esEquipo}
                  onCheckedChange={setEsEquipo}
                />
                <Label
                  htmlFor="agregar-padres"
                  className="text-sm text-neutral-700"
                >
                  ¿Es un equipo?
                </Label>
              </div>
              {esEquipo && (
                <>
                  <p className="text-sm text-neutral-700">
                    Si aplica, indica los espacios donde el equipo brinda
                    servicio, además de su ubicación física
                  </p>
                  <div className="space-y-2">
                    {posiblesPadres.isLoading ? (
                      <LoaderCircle className="animate-spin h-5 w-5" />
                    ) : posiblesPadres.isError ? (
                      <p className="text-red-600 text-sm">
                        Error al cargar ubicaciones.
                      </p>
                    ) : (
                      <>
                        {padres
                          .filter((p) => p !== null)
                          .map((p) =>
                            posiblesPadres.data?.data.find(
                              (ubicacion) => ubicacion.idUbicacion == p
                            )
                          )
                          .map((ubicacion) => (
                            <div
                              key={ubicacion?.idUbicacion}
                              className="flex space-x-3 items-center bg-slate-200 rounded px-2 mb-3"
                            >
                              <span className="text-sm text-neutral-700">
                                {ubicacion?.codigo_Identificacion}
                              </span>
                              <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-slate-100 !px-1"
                                onClick={() => {
                                  setPadres((prev) =>
                                    prev.filter(
                                      (id) => id != ubicacion?.idUbicacion
                                    )
                                  );
                                }}
                              >
                                <CircleX />
                              </Button>
                            </div>
                          ))}
                        <Combobox
                          triggerClassName="w-4/5"
                          contentClassName="w-full"
                          data={
                            posiblesPadres.data?.data
                              .filter(
                                (ubicacion) =>
                                  !generarCodigo().includes(
                                    ubicacion.codigo_Identificacion
                                  ) &&
                                  !padres.includes(
                                    String(ubicacion.idUbicacion)
                                  )
                              )
                              .map((ubicacion) => ({
                                value: ubicacion.idUbicacion,
                                label: `${ubicacion.codigo_Identificacion} - ${ubicacion.descripcion}`,
                              })) || []
                          }
                          value={padres.at(-1) || null}
                          onValueChange={(ubicacion) => {
                            setPadres((prev) => {
                              return [
                                ...prev.filter((p) => p !== null),
                                ubicacion,
                                null,
                              ];
                            });
                          }}
                        />
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {isError && (
          <p className="text-red-600 text-sm">
            {error instanceof Error
              ? error.message
              : "Error al crear la ubicación técnica, por favor intente de nuevo."}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeModal} className="px-8">
            Cancelar
          </Button>
          <Button
            className="bg-gema-green hover:bg-green-700 text-white px-8"
            onClick={onSubmit}
            disabled={status === "pending" || isLoading}
          >
            {status === "pending" ? "Creando..." : "Crear Ubicación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormNuevaUbicacion;
