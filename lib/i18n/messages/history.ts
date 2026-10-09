// The history page.
import type { Entry } from './types';

export const history = {
  'history.title': { en: 'Your History', es: 'Tu historial' },
  'history.empty': { en: 'No assessments found. Take the full assessment first!', es: 'No hay evaluaciones todavía. ¡Haz primero la evaluación completa!' },
  'history.start': { en: 'Start Assessment', es: 'Empezar la evaluación' },
  'history.heading': { en: 'Your Assessment History', es: 'Tu historial de evaluaciones' },
  'history.continueLast': { en: 'Continue Last Attempt', es: 'Continuar el último intento' },
  'history.startNew': { en: 'Start New Assessment', es: 'Empezar una evaluación nueva' },
  'history.afterPayment': { en: "After payment you'll be brought back here automatically.", es: 'Después del pago volverás aquí automáticamente.' },
  'history.banner.plan': { en: '{plan} plan', es: 'Plan {plan}' },
  'history.banner.attempts': { en: '{count} attempt(s) remaining', es: '{count} intento(s) disponibles' },
  'history.banner.followups': { en: 'Followups: {state}', es: 'Seguimientos: {state}' },
  'history.banner.unlocked': { en: 'unlocked ✓', es: 'desbloqueados ✓' },
  'history.banner.locked': { en: 'not yet unlocked', es: 'aún no desbloqueados' },
  'history.banner.university': { en: 'Free through {university}', es: 'Gratis gracias a {university}' },
  'history.banner.universityEnded': { en: 'Access through {university} has ended', es: 'El acceso a través de {university} ha terminado' },
  'history.waiting.title': { en: 'One attempt is waiting on its followup', es: 'Un intento está esperando su seguimiento' },
  'history.waiting.body': { en: "You can't start a new assessment until this one is wrapped up.", es: 'No puedes empezar una evaluación nueva hasta cerrar esta.' },
  'history.waiting.useButton': {
    en: ' Use “Start Followup Questionnaire” on the attempt below to finish it.',
    es: ' Usa «Empezar el cuestionario de seguimiento» en el intento de abajo para terminarlo.',
  },
  'history.waiting.unlockOrSkip': {
    en: ' Unlock your followups below to finish it — or skip it if you’d rather move on.',
    es: ' Desbloquea tus seguimientos abajo para terminarlo, o sáltalo si prefieres seguir adelante.',
  },
  'history.waiting.skip': { en: 'Skip this followup and free up a new assessment', es: 'Saltar este seguimiento y empezar otra evaluación' },
  'history.bundle.title': { en: 'Unlock your detailed career roadmaps', es: 'Desbloquea tus hojas de ruta detalladas' },
  'history.bundle.body': {
    en: 'One purchase unlocks the followup questionnaire for both of your attempts, plus an instant bonus attempt.',
    es: 'Una sola compra desbloquea el cuestionario de seguimiento en tus dos intentos, más un intento extra al instante.',
  },
  'history.bundle.cta': { en: 'Unlock All Followups — {price}', es: 'Desbloquear todos los seguimientos — {price}' },
  'history.item.when': { en: '{date} at {time}', es: '{date} a las {time}' },
  'history.item.top3': { en: 'Your Top 3 Career Clusters', es: 'Tus 3 áreas profesionales principales' },
  'history.item.firstReport': { en: '📄 First AI Report', es: '📄 Primer informe con IA' },
  'history.item.noReport': { en: 'No AI report was generated for this assessment.', es: 'No se generó ningún informe con IA para esta evaluación.' },
  'history.item.roadmap': { en: '🚀 Detailed Career Roadmap', es: '🚀 Hoja de ruta detallada' },
  'history.item.noRoadmap': { en: 'No detailed roadmap yet.', es: 'Todavía no hay hoja de ruta detallada.' },
  'history.item.startFollowup': { en: '📋 Start Followup Questionnaire', es: '📋 Empezar el cuestionario de seguimiento' },
} satisfies Record<string, Entry>;
