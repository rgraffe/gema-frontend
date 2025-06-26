export type Usuario = {
  Id: number;
  Nombre: string;
  Correo: string;
  Tipo: "TECNICO" | "COORDINADOR";
  Contraseña: string | undefined;
};
