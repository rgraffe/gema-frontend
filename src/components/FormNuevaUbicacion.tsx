import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  createUbicacionTecnica,
  getUbicacionesPorNivel,
  getUbicacionesTecnicas,
} from "@/services/ubicacionesTecnicas";
import { CircleX, LoaderCircle, PlusCircle, Trash } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import type { UbicacionTecnica } from "@/types/ubicacionesTecnicas.types";
import { useState } from "react";
import { Combobox } from "./ui/combobox";

// Definición del payload
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
      // Si el campo está vacío, detenemos la inclusión de niveles
      if (!niveles[i].trim()) {
        break;
      }
      resultado.push(niveles[i]);
    }
    return resultado.join("-");
  };

  const getAbreviacion = () => {
    // Se asume que los niveles anteriores son obligatorios (por lo que no habrán saltos, excepto en los últimos niveles)
    const { modulo, planta, espacio, tipo, subtipo, numero, pieza } =
      formValues;
    const levels = [modulo, planta, espacio, tipo, subtipo, numero, pieza];
    // Recorremos desde el último hasta el primero
    for (let i = levels.length - 1; i >= 0; i--) {
      if (levels[i].trim() !== "") {
        return levels[i];
      }
    }
    return "";
  };

  const queryClient = useQueryClient();
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
      toast.success(
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

  const onSubmit = async () => {
    try {
      // 1. Obtenemos todas las ubicaciones técnicas existentes.
      const respuesta = await getUbicacionesTecnicas();
      const ubicacionesTecnicasExistentes = respuesta.data; // Extraemos el arreglo de ubicaciones
      console.log(
        "Ubicaciones técnicas existentes:",
        ubicacionesTecnicasExistentes
      );

      // 2. Generamos el código completo ingresado por el usuario.
      const codigoCompleto = generarCodigo(); // Ej: "M2-PB" o "M2-P01-A101", según lo ingresado
      // Separamos por guiones y quitamos el último nivel:
      const partes = codigoCompleto.split("-");
      const codigoSinUltimoNivel = partes.slice(0, -1).join("-");

      // Imprimimos el código sin el último nivel (con guiones)
      console.log("Código sin último nivel:", codigoSinUltimoNivel);

      // 3. Buscamos en el listado la ubicación cuya propiedad "codigo_Identificacion" coincida con el código sin el último nivel
      const padreEncontrado = ubicacionesTecnicasExistentes.find(
        (u: any) => u.codigo_Identificacion === codigoSinUltimoNivel
      );

      // 4. Construimos el payload. Si se encontró el padre, se usa su id.
      const payload: CreateUbicacionTecnicaPayload = {
        descripcion: formValues.descripcion,
        abreviacion: getAbreviacion(), // Último nivel ingresado
        padres: padreEncontrado
          ? [
              {
                idPadre: padreEncontrado.idUbicacion,
                esUbicacionFisica: esEquipo,
              },
            ]
          : [],
      };

      if (esEquipo) {
        // Agregamos los padres seleccionados en el Combobox
        const idsPadres = padres
          .filter((p) => p !== null)
          .map((id) => ({ idPadre: Number(id), esUbicacionFisica: false }));
        payload.padres.push(...idsPadres);
      }

      mutate(payload);
    } catch (error) {
      console.error("Error obteniendo ubicaciones técnicas:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-6xl md:min-w-5xl"
        contentClassName="space-y-2"
      >
        <h2 className="text-xl font-semibold">Crear Ubicación Técnica</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div>
              <Label className="text-sm">
                Nivel 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                name="modulo"
                placeholder="Ejemplo: M2"
                value={formValues.modulo}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            {displayedLevels >= 2 && (
              <div>
                <Label className="text-sm">Nivel 2</Label>
                <Input
                  name="planta"
                  placeholder="Ejemplo: P01"
                  value={formValues.planta}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 3 && (
              <div>
                <Label className="text-sm">Nivel 3</Label>
                <Input
                  name="espacio"
                  placeholder="Ejemplo: A2-14, LABBD"
                  value={formValues.espacio}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 4 && (
              <div>
                <Label className="text-sm">Nivel 4</Label>
                <Input
                  name="tipo"
                  placeholder="Ejemplo: HVAC"
                  value={formValues.tipo}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 5 && (
              <div>
                <Label className="text-sm">Nivel 5</Label>
                <Input
                  name="subtipo"
                  placeholder="Ejemplo: SPLIT, CENT"
                  value={formValues.subtipo}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 6 && (
              <div>
                <Label className="text-sm">Nivel 6</Label>
                <Input
                  name="numero"
                  placeholder="Ejemplo: 01"
                  value={formValues.numero}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            )}
            {displayedLevels >= 7 && (
              <div>
                <Label className="text-sm">Nivel 7</Label>
                <Input
                  name="pieza"
                  placeholder="Ejemplo: COMP, EVAP"
                  value={formValues.pieza}
                  onChange={handleChange}
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
                    // Limpiar el último nivel al eliminarlo
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
                <Button
                  className="flex-1 border-gema-green text-green-700 hover:text-green-800"
                  variant="outline"
                  onClick={() => setDisplayedLevels((prev) => prev + 1)}
                >
                  <PlusCircle />
                  Agregar nivel
                </Button>
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
                              return [...prev, ubicacion, null];
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
            disabled={status === "pending"}
          >
            {status === "pending" ? "Creando..." : "Crear Ubicación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormNuevaUbicacion;
