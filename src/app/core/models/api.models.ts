export interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

export interface AuthResponse {
  usuario: Usuario;
  access_token: string;
  refresh_token: string;
}

export const GRUPOS_MUSCULARES = ['Pecho', 'Espalda', 'Hombro', 'Pierna', 'Brazo', 'Core', 'Otro'] as const;
export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number];

export interface Rutina {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  creado_en: string;
  grupos: string[];
  total_ejercicios: number;
}

export interface EjercicioPlan {
  id: number;
  ejercicio_id: number;
  nombre: string;
  orden: number;
  series_objetivo: number;
  reps_objetivo: number;
}

export interface RutinaDetalle {
  id: string;
  nombre: string;
  descripcion: string | null;
  entrenamientos_esta_semana: number;
  grupos: string[];
  ejercicios: EjercicioPlan[];
}

export interface CrearRutinaPayload {
  nombre: string;
  descripcion?: string | null;
  grupos: string[];
}

export interface ActualizarRutinaPayload {
  nombre?: string;
  descripcion?: string | null;
}

export interface CrearRutinaEjercicioPayload {
  ejercicio_id: number;
  orden: number;
  series_objetivo: number;
  reps_objetivo: number;
}

export interface ActualizarRutinaEjercicioPayload {
  orden?: number;
  series_objetivo?: number;
  reps_objetivo?: number;
}

export interface RutinaEjercicioRow {
  id: number;
  ejercicio_id: number;
  orden: number;
  series_objetivo: number;
  reps_objetivo: number;
}

export interface Sesion {
  id: string;
  rutina_id: string;
  iniciada_en: string;
  estado: 'en_curso' | 'completada' | 'abandonada';
}

export interface NuevaSerie {
  ejercicio_id: number;
  numero_serie: number;
  peso_kg: number;
  repeticiones: number;
  rpe?: number;
  nota?: string;
}

export interface ReferenciaEjercicio {
  anterior: {
    peso_kg: number;
    repeticiones: number;
    rpe: number | null;
    fecha: string;
  } | null;
  sugerencia: { peso_kg: number; repeticiones: number } | null;
}

export interface ResumenSesion {
  duracion_min: number | null;
  volumen_total: number;
  series_completadas: number;
  rpe_promedio: number | null;
  records_personales: number;
  comparacion_anterior: { volumen_delta_pct: number | null };
  ejercicios: { ejercicio_id: number; nombre: string; peso_promedio: number }[];
}

export interface DashboardData {
  racha_dias: number;
  mes: {
    entrenamientos: number;
    volumen_total: number;
    semanas: { etiqueta: string; entrenamientos: number }[];
  };
  recomendaciones: { tipo: 'atencion' | 'positivo'; mensaje: string }[];
}

export interface Ejercicio {
  id: number;
  nombre: string;
  grupo_muscular: string;
  equipo: string | null;
  activo: boolean;
  creado_en: string;
}

export interface CrearEjercicioPayload {
  nombre: string;
  grupo_muscular: string;
  equipo?: string | null;
}

export interface ActualizarEjercicioPayload {
  nombre?: string;
  grupo_muscular?: string;
  equipo?: string | null;
  activo?: boolean;
}

export interface HistorialEjercicio {
  puntos: { fecha: string; peso_max: number }[];
  pr: number;
  tendencia_pct: number;
  ultima_vez: string | null;
  sesiones: {
    fecha: string;
    peso_kg: number;
    repeticiones: number;
    rpe: number | null;
  }[];
}
