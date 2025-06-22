import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const generarCodigo = () => {
    const { modulo, planta, espacio, tipo, subtipo, numero, pieza } =
      formValues;
    return `${modulo || "M00"}-${planta || "P00"}-${espacio || "ESP"}-${
      tipo || "TIPO"
    }-${subtipo || "SUB"}-${numero || "00"}-${pieza || "PZA"}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-6xl" contentClassName="space-y-2">
        <h2 className="text-xl font-semibold">Crear Ubicación Técnica</h2>

        <div className="grid grid-cols-[7fr_5fr] gap-8">
          <div className="space-y-2">
            <div>
              <Label className="text-sm">
                Nivel 1 <span className="text-red-500">*</span>
              </Label>
              <Select
                name="modulo"
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, modulo: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Nivel 2</Label>
              <Select
                name="planta"
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, planta: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Nivel 3</Label>
              <Input
                name="espacio"
                placeholder="Ejemplo: A101, LAB1"
                onChange={handleChange}
                className="w-full p-2"
              />
            </div>
            <div>
              <Label className="text-sm">Nivel 4</Label>
              <Select
                name="tipo"
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Nivel 5</Label>
              <Select
                name="subtipo"
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, subtipo: value }))
                }
                disabled
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Nivel 6</Label>
              <Input
                name="numero"
                placeholder="Ejemplo: 01"
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <Label className="text-sm">Nivel 7</Label>
              <Input
                name="pieza"
                placeholder="Ejemplo: COMP, EVAP"
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ejemplo: Modulo 2"
                name="descripcion"
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <Label>Vista previa del código:</Label>
              <div className="bg-gray-100 p-2 rounded border font-mono text-sm">
                {generarCodigo()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="px-8">
            Cancelar
          </Button>
          <Button
            className="bg-gema-green hover:bg-green-700 text-white px-8"
            onClick={() => console.log(formValues)}
          >
            Crear Ubicación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormNuevaUbicacion;
