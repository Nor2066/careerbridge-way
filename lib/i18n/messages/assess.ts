// The main questionnaire (app/HomeContent.tsx). Option labels live in
// lib/i18n/options.ts; these are the questions and the screens around them.
import type { Entry } from './types';

export const assess = {
  'assess.stepOf': { en: 'Step {step} of {total}', es: 'Paso {step} de {total}' },
  'assess.unknownStep': { en: 'Unknown step: {step}', es: 'Paso desconocido: {step}' },
  'assess.error': { en: 'Error', es: 'Error' },
  'assess.selectProfile': { en: 'Please go back and select a profile.', es: 'Vuelve atrás y elige un perfil.' },

  // Questions
  'assess.q.subjects': { en: 'Which subjects do you enjoy the most? (Pick up to 3)', es: '¿Qué asignaturas te gustan más? (Elige hasta 3)' },
  'assess.q.activities': { en: 'Which activities do you prefer? (Pick up to 3)', es: '¿Qué actividades prefieres? (Elige hasta 3)' },
  'assess.q.rateSkill': { en: 'Rate your {skill} (1-5)', es: 'Valora tu {skill} (1-5)' },
  'assess.q.rateScale': {
    en: '1 = Not confident at all  |  3 = Moderate  |  5 = Very confident',
    es: '1 = Nada seguro  |  3 = Normal  |  5 = Muy seguro',
  },
  'assess.q.thinking': { en: 'Which describes you better?', es: '¿Qué te describe mejor?' },
  'assess.q.learning': { en: 'How do you learn best?', es: '¿Cómo aprendes mejor?' },
  'assess.q.motivations': { en: 'What motivates you most? (Pick up to 2)', es: '¿Qué te motiva más? (Elige hasta 2)' },
  'assess.q.whatMatters': { en: 'Which matters more to you?', es: '¿Qué te importa más?' },
  'assess.q.studyHours': { en: 'Are you willing to study or work for long hours?', es: '¿Estás dispuesto a estudiar o trabajar muchas horas?' },
  'assess.q.academic': { en: 'How far would you like to go academically?', es: '¿Hasta dónde te gustaría llegar en tus estudios?' },
  'assess.q.social': { en: 'In social situations, what do you usually prefer?', es: 'En situaciones sociales, ¿qué sueles preferir?' },
  'assess.q.environment': { en: 'Which work environment fits you best? (Pick up to 2)', es: '¿Qué entorno de trabajo encaja mejor contigo? (Elige hasta 2)' },
  'assess.q.jobTypes': { en: 'Which job types interest you? (Choose as many as you want)', es: '¿Qué tipos de trabajo te interesan? (Elige todos los que quieras)' },
  'assess.q.dealbreakers': { en: 'Which job types would you NEVER want to do?', es: '¿Qué tipos de trabajo NO harías NUNCA?' },
  'assess.q.dealbreakersHint': {
    en: 'Now be honest – these will be removed from your recommendations. (Even if you selected them before, choose them here if you would refuse that job.)',
    es: 'Sé sincero: se quitarán de tus recomendaciones. (Aunque los hayas elegido antes, márcalos aquí si rechazarías ese trabajo.)',
  },
  'assess.q.profile': { en: 'Which describes you the best?', es: '¿Qué te describe mejor?' },
  'assess.q.salary': { en: 'What level of salary are you aiming for in your career?', es: '¿A qué nivel de sueldo aspiras en tu carrera?' },
  'assess.q.relocate': { en: 'How willing are you to relocate for a job?', es: '¿Hasta qué punto te mudarías por un trabajo?' },
  'assess.q.remote': { en: 'How do you feel about remote work?', es: '¿Qué opinas del teletrabajo?' },
  'assess.q.schedule': { en: 'What is your preferred work schedule?', es: '¿Qué horario de trabajo prefieres?' },
  'assess.q.security': { en: 'How important is job security to you?', es: '¿Qué importancia tiene para ti la estabilidad laboral?' },
  'assess.q.travel': { en: 'How do you feel about travel as part of your job?', es: '¿Qué opinas de viajar por trabajo?' },
  'assess.q.team': { en: 'Which of these best describes your ideal team environment?', es: '¿Qué describe mejor tu equipo de trabajo ideal?' },
  'assess.q.criticism': { en: 'How do you handle criticism?', es: '¿Cómo llevas las críticas?' },
  'assess.q.dreamJob': {
    en: "What is your dream job? (Write a short description. If you don't know it exactly, write the most important features your job should or shouldn't have)",
    es: '¿Cuál es tu trabajo soñado? (Escribe una breve descripción. Si no lo sabes con exactitud, escribe las características más importantes que debería o no debería tener)',
  },
  'assess.q.dreamJob.placeholder': {
    en: "e.g., 'I want to work with animals and travel', or 'I don't want a desk job, I want to be outdoors'",
    es: "p. ej., «Quiero trabajar con animales y viajar» o «No quiero un trabajo de oficina, quiero estar al aire libre»",
  },
  'assess.q.topValues': {
    en: 'What are the top 3 things you value most in a career? (e.g., money, freedom, helping others, creativity)',
    es: '¿Cuáles son las 3 cosas que más valoras en una carrera? (p. ej., el dinero, la libertad, ayudar a otros, la creatividad)',
  },
  'assess.q.topValues.placeholder': {
    en: "e.g., '1. Helping others, 2. Creativity, 3. Job security'",
    es: 'p. ej., «1. Ayudar a otros, 2. La creatividad, 3. La estabilidad laboral»',
  },
  'assess.q.fulfilling': {
    en: 'Describe a time you felt truly fulfilled in a work or school project',
    es: 'Describe un momento en que te sentiste realmente realizado en un proyecto de trabajo o de estudios',
  },
  'assess.q.fulfilling.placeholder': {
    en: 'What did you do? Why did it feel meaningful?',
    es: '¿Qué hiciste? ¿Por qué te pareció importante?',
  },
  'assess.q.past': {
    en: 'What career(s) have you considered before? Why did you consider them? Why did you get discouraged from them, if you got discouraged?',
    es: '¿Qué profesiones has considerado antes? ¿Por qué? Y si te echaron atrás, ¿qué te hizo desistir?',
  },
  'assess.q.past.placeholder': {
    en: "e.g., 'I thought about becoming a doctor because I like helping people, but I'm not good with blood.'",
    es: '«Pensé en ser médico porque me gusta ayudar a la gente, pero no llevo bien la sangre.»',
  },

  // Finish
  'assess.final.ready': { en: 'Ready to see your results?', es: '¿Listo para ver tus resultados?' },
  'assess.final.allAnswered': { en: "You've answered all questions.", es: 'Has respondido todas las preguntas.' },
  'assess.final.calculating': { en: '✨ Calculating...', es: '✨ Calculando...' },
  'assess.final.tryAgain': { en: '🔄 Try Again', es: '🔄 Intentar de nuevo' },
  'assess.final.see': { en: '🚀 See My Results', es: '🚀 Ver mis resultados' },
  'assess.final.error': {
    en: 'We had trouble calculating your results. This is usually temporary — please try again.',
    es: 'Hemos tenido un problema al calcular tus resultados. Suele ser temporal: inténtalo de nuevo.',
  },

  // Results
  'assess.results.subtitle': { en: 'Your personalized career assessment results', es: 'Los resultados de tu evaluación de carrera' },
  'assess.results.top3': { en: 'Your Top 3 Career Clusters', es: 'Tus 3 áreas profesionales principales' },
  'assess.results.reportTitle': { en: 'Your Personalized Career Report', es: 'Tu informe de carrera personalizado' },
  'assess.results.generating': { en: '✨ Generating your AI report...', es: '✨ Generando tu informe con IA...' },
  'assess.results.generate': { en: '🤖 Get Your AI-Powered Career Report', es: '🤖 Obtener mi informe de carrera con IA' },
  'assess.results.processing': {
    en: 'We are processing your information and preparing your result. This may take a few seconds.',
    es: 'Estamos procesando tu información y preparando tu resultado. Puede tardar unos segundos.',
  },
  'assess.results.warning.EXCLUDED': {
    en: "You indicated you wouldn't want to work in: {fields}. These were excluded from your top recommendations.",
    es: 'Indicaste que no querrías trabajar en: {fields}. Las hemos quitado de tus recomendaciones principales.',
  },
  'assess.results.warning.RAN_OUT': {
    en: "You rejected many fields. Some of your top matches include fields you said you wouldn't want, because we ran out of options.",
    es: 'Has descartado muchas áreas. Algunas de tus coincidencias principales incluyen áreas que dijiste que no querrías, porque nos quedamos sin opciones.',
  },
  'assess.results.warning.ALL_EXCLUDED': {
    en: "You indicated you wouldn't want to work in ALL career fields. Showing your top 3 anyway.",
    es: 'Indicaste que no querrías trabajar en NINGUNA área. Te mostramos igualmente tus 3 principales.',
  },
  'assess.results.waitSave': {
    en: 'Please wait a moment for the assessment to be saved, then try again.',
    es: 'Espera un momento a que se guarde la evaluación y vuelve a intentarlo.',
  },
  'assess.results.failed': { en: 'Failed to generate report: {error}', es: 'No se ha podido generar el informe: {error}' },
  'assess.results.failedUnknown': { en: 'unknown error', es: 'error desconocido' },

  // Follow-up decision
  'assess.decision.readyTitle': { en: 'Ready for your detailed roadmap?', es: '¿Listo para tu hoja de ruta detallada?' },
  'assess.decision.planIncludes': {
    en: 'Your plan includes the followup questionnaire — answer a few more questions for an in-depth career roadmap.',
    es: 'Tu plan incluye el cuestionario de seguimiento: responde unas preguntas más para recibir una hoja de ruta en profundidad.',
  },
  'assess.decision.bundleUnlocked': {
    en: "You've already unlocked all followups — answer a few more questions for an in-depth career roadmap.",
    es: 'Ya has desbloqueado todos los seguimientos: responde unas preguntas más para recibir una hoja de ruta en profundidad.',
  },
  'assess.decision.universityIncludes': {
    en: '{university} includes the followup questionnaire — answer a few more questions for an in-depth career roadmap.',
    es: '{university} incluye el cuestionario de seguimiento: responde unas preguntas más para recibir una hoja de ruta en profundidad.',
  },
  'assess.decision.continue': { en: '📋 Continue to Followup Questionnaire', es: '📋 Continuar al cuestionario de seguimiento' },
  'assess.decision.wantTitle': { en: 'Want a more detailed roadmap?', es: '¿Quieres una hoja de ruta más detallada?' },
  'assess.decision.wantBody': {
    en: 'Unlock the followup questionnaire and get a second, more detailed AI report with concrete job titles, courses, and a 3-month action plan — one purchase covers both of your attempts, for {price}.',
    es: 'Desbloquea el cuestionario de seguimiento y recibe un segundo informe con IA, más detallado, con puestos concretos, cursos y un plan de acción de 3 meses. Una sola compra cubre tus dos intentos, por {price}.',
  },
  'assess.decision.notNow': { en: 'Not now — go to my history', es: 'Ahora no, ir a mi historial' },

  // Paywall modal
  'assess.paywall.unlockTitle': { en: 'Unlock the Full Assessment', es: 'Desbloquea la evaluación completa' },
  'assess.paywall.noAttemptsTitle': { en: 'No attempts left on your account', es: 'No te quedan intentos en tu cuenta' },
  'assess.paywall.oneMoreTitle': { en: 'One more step before you continue', es: 'Un paso más antes de continuar' },
  'assess.paywall.unlockBody': {
    en: "You've answered 10 questions — purchase a plan to see your results and AI report.",
    es: 'Has respondido 10 preguntas: compra un plan para ver tus resultados y tu informe con IA.',
  },
  'assess.paywall.blockedBody': {
    en: "Here's exactly what's blocking this attempt, and what unblocks it.",
    es: 'Esto es exactamente lo que bloquea este intento y cómo desbloquearlo.',
  },
  'assess.paywall.seeAttempts': { en: 'See my attempts and followups', es: 'Ver mis intentos y seguimientos' },
  'assess.paywall.progressSaved': {
    en: "Your progress is saved. After payment you'll continue exactly where you left off.",
    es: 'Tu progreso está guardado. Después del pago seguirás justo donde lo dejaste.',
  },
  'assess.paywall.universityEnded': {
    en: 'Your access through {university} has ended or is used up. You can still continue with your own plan.',
    es: 'Tu acceso a través de {university} ha terminado o se ha agotado. Puedes continuar con tu propio plan.',
  },

  // Must finish
  'assess.mustFinish.title': { en: 'One Attempt Left to Finish', es: 'Te queda un intento por terminar' },
  'assess.mustFinish.reason': {
    en: "You have a previous assessment that's still waiting on its followup questionnaire.",
    es: 'Tienes una evaluación anterior que aún espera su cuestionario de seguimiento.',
  },
  'assess.mustFinish.unlocked': {
    en: 'Open it from your history page and finish the followup — then you’re free to start a new assessment. Or skip it below if you’d rather move on; you can always come back to it later.',
    es: 'Ábrela desde tu historial y termina el seguimiento; después podrás empezar una evaluación nueva. O sáltalo abajo si prefieres seguir adelante: siempre podrás volver a él más tarde.',
  },
  'assess.mustFinish.locked': {
    en: 'Your followups aren’t unlocked yet, so you can finish this attempt by unlocking them from your history page — or skip the followup below and start fresh. Skipping loses nothing: the attempt stays in your history.',
    es: 'Tus seguimientos aún no están desbloqueados: puedes terminar este intento desbloqueándolos desde tu historial, o saltarte el seguimiento abajo y empezar de nuevo. Saltarlo no te hace perder nada: el intento sigue en tu historial.',
  },
  'assess.mustFinish.goHistory': { en: 'Go to My History →', es: 'Ir a mi historial →' },
  'assess.mustFinish.skip': { en: 'Skip that followup and start a new assessment', es: 'Saltar ese seguimiento y empezar una evaluación nueva' },

  // Attempt errors
  'assess.noAttempts': {
    en: 'You have no attempts remaining. Please purchase a plan or top-up.',
    es: 'No te quedan intentos. Compra un plan o una recarga.',
  },
  'assess.needPlan': { en: 'You need to purchase a plan to continue.', es: 'Necesitas comprar un plan para continuar.' },

  // Feedback
  'assess.feedback.toggleOpen': { en: '💬 Feedback', es: '💬 Opinión' },
  'assess.feedback.toggleClose': { en: '✕ Close', es: '✕ Cerrar' },
  'assess.feedback.toggleLabel': { en: 'Toggle feedback', es: 'Mostrar u ocultar opinión' },
  'assess.feedback.thanks': { en: 'Thank you for your feedback!', es: '¡Gracias por tu opinión!' },
  'assess.feedback.title': { en: 'Help us improve', es: 'Ayúdanos a mejorar' },
  'assess.feedback.question': { en: 'How accurate were your results?', es: '¿Hasta qué punto acertaron tus resultados?' },
  'assess.feedback.placeholder': { en: 'Any comments? (optional)', es: '¿Algún comentario? (opcional)' },
  'assess.feedback.saving': { en: 'Saving...', es: 'Guardando...' },
  'assess.feedback.submit': { en: 'Submit Feedback', es: 'Enviar opinión' },
  'assess.feedback.rateFirst': { en: 'Please rate your experience', es: 'Valora tu experiencia, por favor' },

  // University access banner on the assessment
  'assess.university.banner': {
    en: 'Free through {university} · {count} attempt(s) left',
    es: 'Gratis gracias a {university} · te quedan {count} intento(s)',
  },
} satisfies Record<string, Entry>;
