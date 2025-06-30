import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUbicacionTecnica } from "@/services/ubicacionesTecnicas";
import { toast } from "sonner";

interface EditUbicacionProps {
  open: boolean;
  onClose: () => void;
  idUbicacion: number;
  descripcionOriginal?: string;
}

const EditUbicacionForm: React.FC<EditUbicacionProps> = ({
  open,
  onClose,
  idUbicacion,
  descripcionOriginal,
}) => {
  const queryClient = useQueryClient();
  const [descripcion, setDescripcion] = useState(descripcionOriginal || "");

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
    if (descripcion.trim()) {
      mutate({ id: idUbicacion, descripcion });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Editar Ubicación</h2>

        <div className="space-y-2">
          <Label>Descripción</Label>
          <Input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Nueva descripción"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!descripcion.trim() || status === "pending"}
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
