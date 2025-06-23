import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { createUbicacionTecnica, getUbicacionesTecnicas } from "@/services/ubicacionesTecnicas";

// Definición del payload
type CreateUbicacionTecnicaPayload = {
  descripcion: string;
  abreviacion: string;
  padres?: { idPadre: number; esUbicacionFisica?: boolean }[];
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const FormNuevaUbicacion: React.FC<Props> = ({ open, onClose }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const generarCodigo = () => {
    const { modulo, planta, espacio, tipo, subtipo, numero, pieza } = formValues;
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
    const { modulo, planta, espacio, tipo, subtipo, numero, pieza } = formValues;
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
  const { mutate, status, isError, error } = useMutation<any, unknown, CreateUbicacionTecnicaPayload, unknown>({
    mutationFn: createUbicacionTecnica,
    onSuccess: (_data: any) => {
      queryClient.invalidateQueries({ queryKey: ["ubicacionesTecnicas"] });
      onClose();
    },
    onError: (err: unknown) => {
      console.error("Error al crear la ubicación técnica:", err);
    },
  });

  const onSubmit = async () => {
    try {
      // 1. Obtenemos todas las ubicaciones técnicas existentes.
      const respuesta = await getUbicacionesTecnicas();
      const ubicacionesTecnicasExistentes = respuesta.data; // Extraemos el arreglo de ubicaciones
      console.log("Ubicaciones técnicas existentes:", ubicacionesTecnicasExistentes);
      
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
          ? [{ idPadre: padreEncontrado.idUbicacion, esUbicacionFisica: false }]
          : [],
      };
      
      mutate(payload);
    } catch (error) {
      console.error("Error obteniendo ubicaciones técnicas:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-6xl md:min-w-5xl" contentClassName="space-y-2">
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
            <div>
              <Label className="text-sm">Nivel 3</Label>
              <Input
                name="espacio"
                placeholder="Ejemplo: A101, LAB1"
                value={formValues.espacio}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
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
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="descripcion">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Input
                name="descripcion"
                placeholder="Ejemplo: Módulo 2, Planta 1, Aula 101"
                value={formValues.descripcion}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="bg-slate-200 p-4 pt-3 rounded-sm">
              <span className="text-sm font-semibold">Vista previa del código:</span>
              <div className="p-2 rounded border-2 border-neutral-300 font-mono text-sm">
                {generarCodigo()}
              </div>
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
          <Button variant="outline" onClick={onClose} className="px-8">
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
