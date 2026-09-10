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

export interface Rutina {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
}

export interface EjercicioPlan {
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
  ejercicios: EjercicioPlan[];
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
