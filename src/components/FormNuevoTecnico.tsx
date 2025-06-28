import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Esquema de validación
const tecnicoSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  correo: z
    .string()
    .email("Correo inválido")
    .regex(/^[a-zA-Z0-9._%+-]+@ucab\.edu\.ve$/, "Debe ser un correo institucional @ucab.edu.ve"),
});

type TecnicoForm = z.infer<typeof tecnicoSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  // Puedes pasar una función para crear el técnico, o usar tu propio hook/mutation
  onCreate?: (data: TecnicoForm) => Promise<any>;
}

const FormNuevoTecnico: React.FC<Props> = ({ open, onClose, onCreate }) => {
  const queryClient = useQueryClient();
  const form = useForm<TecnicoForm>({
    resolver: zodResolver(tecnicoSchema),
    defaultValues: {
      nombre: "",
      correo: "",
    },
  });

  const mutation = useMutation({
    mutationFn: onCreate,
    onSuccess: () => {
      toast.success("Técnico creado exitosamente");
      form.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["tecnicos"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al crear el técnico");
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Técnico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              {...form.register("nombre")}
              placeholder="Ejemplo: Juan Pérez"
              autoComplete="off"
            />
            <span className="text-red-600 text-xs">{form.formState.errors.nombre?.message}</span>
          </div>
          <div>
            <Label htmlFor="correo">Correo institucional</Label>
            <Input
              id="correo"
              {...form.register("correo")}
              placeholder="ejemplo@ucab.edu.ve"
              autoComplete="off"
            />
            <span className="text-red-600 text-xs">{form.formState.errors.correo?.message}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className="bg-gema-green hover:bg-green-700 text-white"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creando..." : "Crear Técnico"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormNuevoTecnico;