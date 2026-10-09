// Pricing cards, the progress checklist and the support notice.
import type { Entry } from './types';

export const pricing = {
  'pricing.title': { en: 'Choose Your Plan', es: 'Elige tu plan' },
  'pricing.subtitle': {
    en: 'Unlock your personalized career assessment and AI-powered career roadmap.',
    es: 'Desbloquea tu evaluación de carrera personalizada y tu hoja de ruta con IA.',
  },
  'pricing.oneTime': { en: 'one-time', es: 'pago único' },
  'pricing.redirecting': { en: 'Redirecting...', es: 'Redirigiendo...' },
  'pricing.signIn': { en: 'Sign in', es: 'Inicia sesión' },
  'pricing.error.session': { en: 'Your session has expired. Please sign in again.', es: 'Tu sesión ha caducado. Vuelve a iniciar sesión.' },
  'pricing.error.checkout': { en: 'Could not start checkout. Please try again.', es: 'No se ha podido iniciar el pago. Inténtalo de nuevo.' },

  'pricing.basic.name': { en: 'Basic', es: 'Básico' },
  'pricing.basic.f1': { en: '✓ 2 main assessment attempts', es: '✓ 2 intentos de la evaluación principal' },
  'pricing.basic.f2': { en: '✓ AI career report for each attempt', es: '✓ Informe de carrera con IA en cada intento' },
  'pricing.basic.f3': { en: '✓ Unlock both followup roadmaps for {price}', es: '✓ Desbloquea las dos hojas de ruta de seguimiento por {price}' },
  'pricing.basic.cta': { en: 'Choose Basic', es: 'Elegir Básico' },

  'pricing.full.name': { en: 'Full', es: 'Completo' },
  'pricing.full.badge': { en: 'Best value', es: 'Mejor precio' },
  'pricing.full.f1': { en: '✓ 3 complete assessment attempts', es: '✓ 3 intentos completos de la evaluación' },
  'pricing.full.f2': { en: '✓ Main + followup questionnaires included', es: '✓ Cuestionario principal y de seguimiento incluidos' },
  'pricing.full.f3': { en: '✓ Both AI reports for every attempt', es: '✓ Los dos informes con IA en cada intento' },
  'pricing.full.f4': { en: '✓ No additional unlocks needed', es: '✓ Sin desbloqueos adicionales' },
  'pricing.full.cta': { en: 'Choose Full', es: 'Elegir Completo' },

  'pricing.bundle.name': { en: 'Unlock All Followups', es: 'Desbloquear todos los seguimientos' },
  'pricing.bundle.f1': { en: '✓ Unlocks the followup questionnaire for both attempts', es: '✓ Desbloquea el cuestionario de seguimiento en tus dos intentos' },
  'pricing.bundle.f2': { en: '✓ Get your detailed career roadmap for each', es: '✓ Recibe tu hoja de ruta detallada en cada uno' },
  'pricing.bundle.f3': { en: '✓ Includes +1 bonus attempt, instantly', es: '✓ Incluye +1 intento extra al instante' },
  'pricing.bundle.f4': { en: '✓ Required before top-up packs become available', es: '✓ Necesario antes de poder comprar recargas' },
  'pricing.bundle.cta': { en: 'Unlock All Followups — {price}', es: 'Desbloquear todos los seguimientos — {price}' },

  'pricing.topup.name': { en: '3 Extra Attempts', es: '3 intentos extra' },
  'pricing.topup.f1': { en: '✓ +3 complete attempts (main + followup each)', es: '✓ +3 intentos completos (principal y seguimiento cada uno)' },
  'pricing.topup.f2': { en: '✓ Buy as many packs as you need', es: '✓ Compra tantos packs como necesites' },
  'pricing.topup.f3': { en: '✓ Use anytime, no expiry', es: '✓ Úsalos cuando quieras, no caducan' },
  'pricing.topup.cta': { en: 'Buy 3 Attempts — {price}', es: 'Comprar 3 intentos — {price}' },

  'pricing.active.plan': { en: 'Your {plan} plan is active.', es: 'Tu plan {plan} está activo.' },
  'pricing.active.attempts': { en: '{count} attempt(s) remaining', es: '{count} intento(s) disponibles' },
  'pricing.active.followupsUnlocked': { en: ' · followups unlocked', es: ' · seguimientos desbloqueados' },
  'pricing.active.finishFollowup': {
    en: 'There’s nothing to buy — finishing that followup is all that’s left.',
    es: 'No hace falta comprar nada: solo te queda terminar ese seguimiento.',
  },
  'pricing.active.nothing': {
    en: 'There’s nothing to buy right now — more options appear here once you run out of attempts.',
    es: 'Ahora mismo no hay nada que comprar: aquí aparecerán más opciones cuando te quedes sin intentos.',
  },
  'pricing.active.goHistory': { en: 'Go to my history', es: 'Ir a mi historial' },
  'pricing.active.continue': { en: 'Continue', es: 'Continuar' },
  'pricing.active.continueAssessment': { en: 'Continue to my assessment', es: 'Continuar con mi evaluación' },
  'pricing.planName.basic': { en: 'Basic', es: 'Básico' },
  'pricing.planName.full': { en: 'Full', es: 'Completo' },
  'pricing.planName.free': { en: 'Free', es: 'Gratuito' },

  'pricing.notice.finishTitle': { en: 'Finish your last assessment first', es: 'Termina primero tu última evaluación' },
  'pricing.notice.finishBody': {
    en: 'One of your attempts still has its followup questionnaire waiting. Complete that followup (or skip it from your history page) and you can start a new assessment.',
    es: 'Uno de tus intentos aún tiene pendiente el cuestionario de seguimiento. Complétalo (o sáltalo desde tu historial) y podrás empezar una evaluación nueva.',
  },
  'pricing.notice.basicUsedTitle': { en: "You've used all the attempts on your Basic plan", es: 'Has usado todos los intentos de tu plan Básico' },
  'pricing.notice.basicUsedBody': {
    en: 'Top-ups aren’t available to you yet. Your followup questionnaires are still locked, so every attempt you’ve done is only half finished — you need to unlock and complete your followups before buying more attempts. The bundle below unlocks the followup for every attempt, adds a bonus attempt straight away, and opens up top-ups afterwards.',
    es: 'Todavía no puedes comprar recargas. Tus cuestionarios de seguimiento siguen bloqueados, así que cada intento que has hecho está a medias: tienes que desbloquear y completar tus seguimientos antes de comprar más intentos. El paquete de abajo desbloquea el seguimiento de cada intento, añade un intento extra al momento y después habilita las recargas.',
  },
  'pricing.notice.allUsedTitle': { en: "You've used all your attempts", es: 'Has usado todos tus intentos' },
  'pricing.notice.allUsedBody': {
    en: 'Every attempt on your plan is done. A top-up pack adds 3 more complete attempts — main questionnaire and followup for each.',
    es: 'Has completado todos los intentos de tu plan. Una recarga añade 3 intentos completos más, con cuestionario principal y de seguimiento cada uno.',
  },
  'pricing.notice.choosePlanTitle': { en: 'Choose a plan to see your results', es: 'Elige un plan para ver tus resultados' },
  'pricing.notice.choosePlanBody': {
    en: 'Your answers are saved. Pick a plan and you’ll pick up at exactly the question you left off on.',
    es: 'Tus respuestas están guardadas. Elige un plan y seguirás justo en la pregunta donde lo dejaste.',
  },

  // Progress checklist
  'checklist.label': { en: 'Your progress', es: 'Tu progreso' },
  'checklist.title': { en: 'Where you are', es: 'Dónde estás' },
  'checklist.count': { en: '{done} of {total}', es: '{done} de {total}' },
  'checklist.plan.label': { en: 'Choose a plan', es: 'Elige un plan' },
  'checklist.plan.on': { en: 'You are on the {plan} plan.', es: 'Tienes el plan {plan}.' },
  'checklist.plan.pick': { en: 'Pick a plan to unlock the full assessment.', es: 'Elige un plan para desbloquear la evaluación completa.' },
  'checklist.plan.university.label': { en: 'Access through your university', es: 'Acceso a través de tu universidad' },
  'checklist.plan.university.detail': { en: 'Provided free by {university}.', es: 'Gratis gracias a {university}.' },
  'checklist.assess.label': { en: 'Complete the assessment', es: 'Completa la evaluación' },
  'checklist.assess.inProgress': { en: 'You have one in progress — pick up where you left off.', es: 'Tienes una en curso: sigue donde lo dejaste.' },
  'checklist.assess.done': { en: 'Done. You can take another whenever you have an attempt left.', es: 'Hecho. Puedes hacer otra cuando te quede algún intento.' },
  'checklist.assess.available': { en: '{count} attempt(s) available.', es: '{count} intento(s) disponibles.' },
  'checklist.report.label': { en: 'Read your career report', es: 'Lee tu informe de carrera' },
  'checklist.report.ready': { en: 'Ready in your history.', es: 'Disponible en tu historial.' },
  'checklist.report.pending': { en: 'Generated as soon as you finish the questionnaire.', es: 'Se genera en cuanto terminas el cuestionario.' },
  'checklist.roadmap.label': { en: 'Get your detailed roadmap', es: 'Consigue tu hoja de ruta detallada' },
  'checklist.roadmap.waiting': { en: 'Unlocked and waiting — this is your next step.', es: 'Desbloqueada y esperándote: es tu siguiente paso.' },
  'checklist.roadmap.unlocked': { en: 'Unlocked on your account. Answer the follow-up on any attempt.', es: 'Desbloqueada en tu cuenta. Responde el seguimiento de cualquier intento.' },
  'checklist.roadmap.locked': { en: 'Needs the follow-up bundle. Adds specific roles and a three-month plan.', es: 'Necesita el paquete de seguimiento. Añade puestos concretos y un plan de tres meses.' },

  // Support notice
  'support.label': { en: 'Support information', es: 'Información de apoyo' },
  'support.title': { en: 'Before you read your report', es: 'Antes de leer tu informe' },
  'support.visit': { en: 'Visit {name}', es: 'Visitar {name}' },
} satisfies Record<string, Entry>;
