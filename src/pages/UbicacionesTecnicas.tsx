import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, CirclePlus, Building, LoaderCircle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import FormNuevaUbicacion from "@/components/FormNuevaUbicacion";
import { Button } from "@/components/ui/button";
import { getUbicacionesTecnicas } from "@/services/ubicacionesTecnicas";

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
  const [open, setOpen] = React.useState(false);

  // Usamos useQuery para llamar al servicio getUbicacionesTecnicas
  const { data, error, isLoading } = useQuery({
    queryKey: ["ubicacionesTecnicas"],
    queryFn: getUbicacionesTecnicas,
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
          codigo: item.codigo_Identificacion,
          descripcion: item.descripcion,
        });
        return acc;
      },
      {} as Record<string, Modulo>
    );
    return Object.values(agrupados);
  }, [data]);

  if (isLoading) return <div className="p-6"><LoaderCircle className="animate-spin" /></div>;
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
        <FormNuevaUbicacion open={open} onClose={() => setOpen(false)} />
      </Dialog>

      <div className="space-y-4 w-2xl">
        {modulos.map((modulo, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-md"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-t-lg">
              <Building className="text-blue-600 w-5 h-5" />
              <h2 className="text-lg font-semibold">{modulo.modulo}</h2>
              <span className="bg-gray-200 text-sm font-medium px-2 py-0.5 rounded-full ml-2">
                {modulo.cantidad}
              </span>
            </div>

            <div className="divide-y">
              {modulo.detalles.map((detalle, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-mono font-semibold text-sm">
                      {detalle.codigo}
                    </p>
                    <p className="text-sm text-gray-700">
                      {detalle.descripcion}
                    </p>
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
