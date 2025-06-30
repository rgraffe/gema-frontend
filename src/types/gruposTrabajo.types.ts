import type { Usuario } from "./usuarios.types";

export type GrupoTrabajo = {
  id: number;
  codigo: string;
  nombre: string;
  supervisorId: number;
};

export type TrabajaEnGrupo = {
  grupoDeTrabajoId: number;
  usuarios: Usuario[];
};
