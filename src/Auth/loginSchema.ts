import { z } from "zod";

/**
 * Schema para validar los datos de inicio de sesión.
 * @description Utiliza Zod para definir las reglas de validación.
 * @author gabrielm
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo electrónico es requerido" })
    .email("Correo electrónico inválido")
    .endsWith("ucab.edu.ve", "El correo debe ser de la UCAB"),
  password: z.string({ required_error: "La contraseña es requerida" }),
});
