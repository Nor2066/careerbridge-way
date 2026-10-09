// The follow-up questionnaire page. The questions themselves live in
// lib/followup-questions.ts and lib/i18n/followup-questions-es.ts.
import type { Entry } from './types';

export const followup = {
  'followup.noQuestions': { en: 'Error: No questions found for {cluster}.', es: 'Error: no hay preguntas para {cluster}.' },
  'followup.feedback.question': { en: 'How useful was your career roadmap?', es: '¿Qué utilidad ha tenido tu hoja de ruta?' },
  'followup.thanks': { en: 'Thank you!', es: '¡Gracias!' },
  'followup.saved': { en: 'Your detailed answers have been saved.', es: 'Tus respuestas detalladas se han guardado.' },
  'followup.generating': { en: 'Generating your personalized roadmap...', es: 'Generando tu hoja de ruta personalizada...' },
  'followup.generate': { en: '🚀 Get Your Career Roadmap', es: '🚀 Obtener mi hoja de ruta' },
  'followup.processing': { en: 'We are processing your information. This may take a few seconds.', es: 'Estamos procesando tu información. Puede tardar unos segundos.' },
  'followup.roadmapTitle': { en: 'Your Personalized Career Roadmap', es: 'Tu hoja de ruta personalizada' },
  'followup.goHistory': { en: 'Go to History', es: 'Ir al historial' },
  'followup.clusterOf': { en: 'Cluster {current} of {total}: {name}', es: 'Área {current} de {total}: {name}' },
  'followup.questionOf': { en: 'Question {current} of {total}', es: 'Pregunta {current} de {total}' },
  'followup.previous': { en: '← Previous', es: '← Anterior' },
  'followup.submit': { en: 'Submit', es: 'Enviar' },
  'followup.saving': { en: 'Saving...', es: 'Guardando...' },
  'followup.typeAnswer': { en: 'Type your answer', es: 'Escribe tu respuesta' },
  'followup.locked': {
    en: 'Your followup access for this attempt is not unlocked. Unlock it from your history page — your answers will still be here.',
    es: 'El seguimiento de este intento no está desbloqueado. Desbloquéalo desde tu historial: tus respuestas seguirán aquí.',
  },
  'followup.saveFailed': { en: 'Failed to save answers: {error}', es: 'No se han podido guardar las respuestas: {error}' },
  'followup.unknownError': { en: 'Unknown error', es: 'Error desconocido' },
  'followup.noAssessment': {
    en: 'Assessment ID not found. Please return to history and try again.',
    es: 'No se encuentra la evaluación. Vuelve al historial e inténtalo de nuevo.',
  },
  'followup.generateFailed': { en: 'Failed to generate report: {error}', es: 'No se ha podido generar el informe: {error}' },
  'followup.networkCheck': {
    en: 'Network error. Please check your connection and try again.',
    es: 'Error de conexión. Comprueba tu conexión e inténtalo de nuevo.',
  },
} satisfies Record<string, Entry>;
