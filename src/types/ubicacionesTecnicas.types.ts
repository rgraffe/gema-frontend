export type UbicacionTecnica = {
  idUbicacion: number;
  descripcion: string;
  abreviacion: string;
  codigo_Identificacion: string;
  nivel: number;
  children?: UbicacionTecnica[];
};

export type PadreUbicacion = UbicacionTecnica & {
  esUbicacionFisica?: boolean;
};