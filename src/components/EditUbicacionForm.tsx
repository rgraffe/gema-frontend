import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { getUbicacionesTecnicas, updateUbicacionTecnica } from "@/services/ubicacionesTecnicas";
import { toast } from "sonner";

interface EditUbicacionProps {
  open: boolean;
  onClose: () => void;
}

const EditUbicacionForm: React.FC<EditUbicacionProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedUbicacionId, setSelectedUbicacionId] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState("");

  const { data: ubicaciones, isLoading: loadingUbicaciones } = useQuery({
    queryKey: ["ubicacionesTecnicas"],
    queryFn: getUbicacionesTecnicas,
    staleTime: 1000 * 60 * 5, // 5 minutos para evitar recargas innecesarias
  });

  const ubicacionesOptions =
    ubicaciones?.data?.map((u: any) => ({
      value: u.idUbicacion.toString(),
      label: `${u.codigo_Identificacion} - ${u.descripcion}`,
    })) ?? [];

  const { mutate, status } = useMutation({
    mutationFn: ({ id, descripcion }: { id: number; descripcion: string }) =>
      updateUbicacionTecnica(id, { descripcion }),
    onSuccess: () => {
      toast.success("Ubicación actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ["ubicacionesTecnicas"] });
      onClose();
    },
    onError: () => {
      toast.error("Error al actualizar la ubicación");
    },
  });

  const onSubmit = () => {
    if (selectedUbicacionId && descripcion.trim()) {
      mutate({ id: selectedUbicacionId, descripcion });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Editar Ubicación</h2>

        <div className="space-y-4">
          <div>
            <Label>Selecciona la ubicación</Label>
            <Combobox
              data={ubicacionesOptions}
              value={selectedUbicacionId?.toString() || null}
              onValueChange={(value) => {
                const id = Number(value);
                setSelectedUbicacionId(id);
                const selected = ubicaciones?.data.find((u: any) => u.idUbicacion === id);
                setDescripcion(selected?.descripcion || "");
              }}
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Nueva descripción"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedUbicacionId || !descripcion.trim() || status === "pending"}
            className="bg-gema-green text-white hover:bg-green-700"
          >
            {status === "pending" ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUbicacionForm;
