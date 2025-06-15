import React, { useState } from "react";
import { Eye, CirclePlus, Building } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import FormNuevaUbicacion from "@/components/FormNuevaUbicacion.tsx";

interface DetalleUbicacion {
  codigo: string;
  descripcion: string;
}

interface Modulo {
  modulo: string;
  cantidad: number;
  detalles: DetalleUbicacion[];
}

const UbicacionesTecnicas: React.FC = () => {
  const [open, setOpen] = useState(false);

  const ubicaciones: Modulo[] = [
    {
      modulo: "MO1",
      cantidad: 2,
      detalles: [
        {
          codigo: "M01-P01-A101-HVAC-SPLIT-01-COMP",
          descripcion: "Módulo 1, Planta 1, Aula 101, Aire Acondicionado Split, Compresor"
        },
        {
          codigo: "M01-P01-A102-ELEC-ILUM-01",
          descripcion: "Módulo 1, Planta 1, Aula 102, Sistema Eléctrico, Iluminación"
        }
      ]
    },
    {
      modulo: "MO2",
      cantidad: 1,
      detalles: [
        {
          codigo: "M02-P02-LAB1-HVAC-CENT-01-EVAP",
          descripcion: "Módulo 2, Planta 2, Laboratorio 1, Aire Acondicionado Central, Evaporador"
        }
      ]
    },
    {
      modulo: "MO3",
      cantidad: 1,
      detalles: [
        {
          codigo: "M03-P01-BIBLIO-ELEC-TOMA-01",
          descripcion: "Módulo 3, Planta 1, Biblioteca, Sistema Eléctrico, Tomacorrientes"
        }
      ]
    },
    {
      modulo: "MO4",
      cantidad: 1,
      detalles: [
        {
          codigo: "M04-P01-ADMIN-INFR-PUER-01",
          descripcion: "Módulo 4, Planta 1, Administración, Infraestructura, Puerta Principal"
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ubicaciones Técnicas</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 transition-colors rounded-lg p-4 mb-5 cursor-pointer">
            <CirclePlus />
            <h2 className="text-xl font-semibold">Crear nueva</h2>
          </button>
        </DialogTrigger>

        {/* Formulario modal reutilizable */}
        <FormNuevaUbicacion open={open} onClose={() => setOpen(false)} />
      </Dialog>

      <div className="space-y-4">
        {ubicaciones.map((modulo, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-md">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-t-lg">
              <Building className="text-blue-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">{modulo.modulo}</h2>
              <span className="bg-gray-200 text-sm font-medium px-2 py-0.5 rounded-full ml-2">
                {modulo.cantidad}
              </span>
            </div>

            <div className="divide-y">
              {modulo.detalles.map((detalle, idx) => (
                <div key={idx} className="flex justify-between items-start p-4 hover:bg-gray-50">
                  <div>
                    <p className="font-mono font-semibold text-sm">{detalle.codigo}</p>
                    <p className="text-sm text-gray-700">{detalle.descripcion}</p>
                  </div>
                  <Eye className="text-gray-500 w-5 h-5 mt-1 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UbicacionesTecnicas;
