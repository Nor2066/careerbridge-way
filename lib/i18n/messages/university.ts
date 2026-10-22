// The /university dashboard that a university's staff see.
import type { Entry } from './types';

export const university = {
  'uni.title': { en: 'University dashboard', es: 'Panel de la universidad' },
  'uni.choose': { en: 'University', es: 'Universidad' },
  'uni.privacy': {
    en: 'Totals only. To protect your students, this page never shows answers, reports or names, and hides any group smaller than {k}. Please do not try to work out which student is behind a figure, or use these results in any decision about a student.',
    es: 'Solo totales. Para proteger a tus estudiantes, esta página nunca muestra respuestas, informes ni nombres, y oculta cualquier grupo de menos de {k}. No intentes averiguar qué estudiante hay detrás de una cifra ni uses estos resultados en ninguna decisión sobre un estudiante.',
  },
  'uni.noAccess.title': { en: 'No dashboard for this account', es: 'Esta cuenta no tiene panel' },
  'uni.noAccess.body': {
    en: 'This page is for university staff we have set up. If you should have access, sign in with the work email address your university gave us, and make sure it is confirmed.',
    es: 'Esta página es para el personal universitario que hemos dado de alta. Si deberías tener acceso, entra con el correo de trabajo que nos indicó tu universidad y asegúrate de haberlo confirmado.',
  },
  'uni.error': { en: 'Could not load the dashboard. Refresh to try again.', es: 'No se ha podido cargar el panel. Recarga la página para intentarlo de nuevo.' },
  'uni.updated': { en: 'Updated {time}', es: 'Actualizado: {time}' },
  'uni.refresh': { en: 'Refresh', es: 'Actualizar' },

  'uni.licence.title': { en: 'Licence', es: 'Licencia' },
  'uni.licence.dates': { en: '{start} to {end}', es: 'Del {start} al {end}' },
  'uni.licence.status.active': { en: 'Active', es: 'Activa' },
  'uni.licence.status.paused': { en: 'Paused', es: 'En pausa' },
  'uni.licence.status.not_started': { en: 'Starts later', es: 'Aún no ha empezado' },
  'uni.licence.status.expired': { en: 'Expired', es: 'Caducada' },
  'uni.licence.attempts': { en: '{count} {count|attempt|attempts} per student', es: '{count} {count|intento|intentos} por estudiante' },
  'uni.licence.followupYes': { en: 'Follow-up roadmap included', es: 'Hoja de ruta de seguimiento incluida' },
  'uni.licence.followupNo': { en: 'Follow-up roadmap not included', es: 'Hoja de ruta de seguimiento no incluida' },
  'uni.licence.howToJoin': {
    en: 'Students get access by signing up with a confirmed address on: {domains}',
    es: 'Los estudiantes acceden registrándose con un correo confirmado de: {domains}',
  },

  'uni.stats.joined': { en: 'Students joined', es: 'Estudiantes dados de alta' },
  'uni.stats.withReport': { en: 'Students with a report', es: 'Estudiantes con informe' },
  'uni.stats.reports': { en: 'Career reports', es: 'Informes de carrera' },
  'uni.stats.roadmaps': { en: 'Follow-up roadmaps', es: 'Hojas de ruta' },
  'uni.stats.rating': { en: 'Average accuracy rating', es: 'Valoración media de acierto' },
  'uni.stats.ratingOf': { en: 'out of 5, from {count} ratings', es: 'sobre 5, de {count} valoraciones' },
  'uni.stats.hiddenNote': {
    en: 'Hidden until there are at least {k}, to protect students',
    es: 'Oculto hasta que haya al menos {k}, para proteger al alumnado',
  },
  'uni.stats.ratingHidden': { en: 'Shown from {k} ratings', es: 'Se muestra a partir de {k} valoraciones' },

  'uni.areas.title': { en: 'Strongest career areas', es: 'Áreas profesionales más fuertes' },
  'uni.areas.subtitle': {
    en: 'How many students have each area as their top result (latest report per student).',
    es: 'Cuántos estudiantes tienen cada área como resultado principal (último informe de cada estudiante).',
  },
  'uni.areas.students': { en: '{count} students', es: '{count} estudiantes' },
  'uni.areas.other': { en: 'Other areas, each under {k} students', es: 'Otras áreas, cada una con menos de {k} estudiantes' },
  'uni.areas.notEnough': {
    en: 'A breakdown appears once at least {k} students have a report.',
    es: 'El desglose aparece cuando al menos {k} estudiantes tienen un informe.',
  },

  'uni.months.title': { en: 'Reports per month', es: 'Informes por mes' },
  'uni.months.hidden': { en: 'fewer than {k}', es: 'menos de {k}' },
  'uni.months.none': { en: 'No reports yet.', es: 'Todavía no hay informes.' },

  // /university/sample: the same dashboard filled with invented numbers, so a
  // careers team can see what it becomes before many students have joined.
  'uni.sample.link': {
    en: 'See what this page looks like with more students (sample data)',
    es: 'Ver cómo queda esta página con más estudiantes (datos de muestra)',
  },
  'uni.sample.title': { en: 'Sample university dashboard', es: 'Ejemplo del panel para universidades' },
  'uni.sample.eyebrow': { en: 'University dashboard · sample', es: 'Panel de la universidad · ejemplo' },
  'uni.sample.name': { en: 'Example University', es: 'Universidad de ejemplo' },
  'uni.sample.banner': {
    en: 'This is an example with invented numbers. It shows what your careers team would see once about 200 students have used ADAQNO. With real students, any group smaller than {k} is hidden to keep them anonymous.',
    es: 'Esto es un ejemplo con cifras inventadas. Muestra lo que vería vuestro servicio de orientación cuando unos 200 estudiantes hayan usado ADAQNO. Con estudiantes reales, cualquier grupo de menos de {k} se oculta para mantener su anonimato.',
  },
  'uni.sample.domain': { en: 'students.example.edu', es: 'alumnos.ejemplo.edu' },
  'uni.sample.report': { en: 'See a sample student report', es: 'Ver un informe de estudiante de ejemplo' },
  'uni.sample.home': { en: 'Back to ADAQNO', es: 'Volver a ADAQNO' },
} satisfies Record<string, Entry>;
