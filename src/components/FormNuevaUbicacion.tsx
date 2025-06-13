import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FormNuevaUbicacion: React.FC<Props> = ({ open, onClose }) => {
  const [formValues, setFormValues] = useState({
    modulo: '',
    planta: '',
    espacio: '',
    tipo: '',
    subtipo: '',
    numero: '',
    pieza: '',
    descripcion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const generarCodigo = () => {
    const { modulo, planta, espacio, tipo, subtipo, numero, pieza } = formValues;
    return `${modulo || 'M00'}-${planta || 'P00'}-${espacio || 'ESP'}-${tipo || 'TIPO'}-${subtipo || 'SUB'}-${numero || '00'}-${pieza || 'PZA'}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full space-y-4">
        <h2 className="text-xl font-semibold">Crear Nueva Ubicación Técnica</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Nivel 1: Módulo *</label>
            <select name="modulo" onChange={handleChange} className="w-full border rounded p-2">
              {/* Sin datos por ahora */}
              <option value="">Seleccionar módulo</option>
            </select>
          </div>
          <div>
            <label>Nivel 2: Planta *</label>
            <select name="planta" onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Seleccionar planta</option>
            </select>
          </div>
          <div>
            <label>Nivel 3: Espacio *</label>
            <input type="text" name="espacio" placeholder="EJ., A101, LAB1" onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label>Nivel 4: Tipo de Equipo *</label>
            <select name="tipo" onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Seleccionar tipo</option>
            </select>
          </div>
          <div>
            <label>Nivel 5: Subtipo</label>
            <select name="subtipo" onChange={handleChange} className="w-full border rounded p-2" disabled>
              <option value="">Seleccionar subtipo</option>
            </select>
          </div>
          <div>
            <label>Nivel 6: Número</label>
            <input type="text" name="numero" placeholder="ej., 01" onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div className="col-span-2">
            <label>Nivel 7: Pieza</label>
            <input type="text" name="pieza" placeholder="EJ., COMP, EVAP" onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div className="col-span-2">
            <label>Descripción</label>
            <input type="text" name="descripcion" onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div className="col-span-2">
            <label className="font-mono text-sm text-gray-700">Vista previa del código:</label>
            <div className="bg-gray-100 p-2 rounded border font-mono text-sm">
              {generarCodigo()}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => console.log(formValues)}>Crear Ubicación</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormNuevaUbicacion;
