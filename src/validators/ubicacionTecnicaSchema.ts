import { z } from "zod";

/**
 * Schema para validar los datos de una ubicación técnica.
 * @description Utiliza Zod para definir las reglas de validación basadas en los tipos del backend.
 * @author janbertorelli
 */
export const ubicacionTecnicaSchema = z.object({
  descripcion: z
    .string({ required_error: "La descripción es requerida" })
    .min(1, "La descripción no puede estar vacía")
    .max(50, "La descripción debe tener como máximo 50 caracteres"),
  abreviacion: z
    .string({ required_error: "La abreviación es requerida" })
    .min(1, "La abreviación no puede estar vacía")
    .max(5, "La abreviación debe tener como máximo 26 caracteres"),
  padres: z
    .array(
      z.object({
        idPadre: z.number({ required_error: "El idPadre es requerido" }),
        esUbicacionFisica: z.boolean().optional(),
      })
    )
    .optional(),
});