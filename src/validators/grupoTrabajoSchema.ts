import { z } from "zod";

/**
 * Schema para validar los datos de un grupo de trabajo.
 * @description Utiliza Zod para definir las reglas de validación basadas en los tipos del backend.
 * @author gabrielm
 */
export const grupoTrabajoSchema = z.object({
  codigo: z
    .string({ required_error: "El código es requerido" })
    .min(3, "El código debe tener al menos 3 caracteres"),
  nombre: z.string({ required_error: "El nombre es requerido" }),
  supervisor: z.coerce
    .number({ required_error: "El supervisor es requerido" })
    .int(),
});
