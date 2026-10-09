// The landing page and the demo quiz.
import type { Entry } from './types';

export const home = {
  'home.hero.title': {
    en: 'Free Career Assessment Test for Students & Graduates',
    es: 'Test de orientación profesional gratis para estudiantes y titulados',
  },
  'home.hero.lead': {
    en: 'Not sure what career suits you? Answer a few questions and get an AI-powered career report that matches your skills, interests, and values to real career paths.',
    es: '¿No sabes qué carrera profesional encaja contigo? Responde unas preguntas y recibe un informe de carrera con IA que relaciona tus habilidades, intereses y valores con salidas profesionales reales.',
  },
  'home.hero.trust': {
    en: 'Trusted by students exploring their future. It takes under 15 minutes.',
    es: 'Para estudiantes que están pensando en su futuro. Te lleva menos de 15 minutos.',
  },
  'home.cta.demo': { en: 'Try Our Demo Quiz For Free →', es: 'Prueba gratis el test de demostración →' },
  'home.cta.full': { en: 'Take Full Assessment', es: 'Hacer la evaluación completa' },
  'home.stats.clusters': { en: 'Career clusters analysed', es: 'Áreas profesionales analizadas' },
  'home.stats.questions': { en: 'In-depth questions', es: 'Preguntas en profundidad' },
  'home.stats.report': { en: 'Personalised report', es: 'Informe personalizado' },
  'home.stats.ai': { en: 'AI', es: 'IA' },
  'home.demoDone.title': { en: 'Great work! Ready for the real thing?', es: '¡Buen trabajo! ¿Listo para la evaluación de verdad?' },
  'home.demoDone.body': {
    en: 'The demo gives you a taste. Our full career assessment goes much deeper: it analyses your skills, learning style, values, and ambitions across 46 questions, then generates a personalised AI career report with your top career clusters and why they fit you.',
    es: 'La demostración es solo una muestra. La evaluación completa va mucho más allá: analiza tus habilidades, tu forma de aprender, tus valores y tus ambiciones en 46 preguntas, y genera un informe de carrera personalizado con IA con tus áreas profesionales principales y por qué encajan contigo.',
  },
  'home.demoDone.cta': { en: 'Start Full Career Assessment →', es: 'Empezar la evaluación completa →' },

  'home.how.title': { en: 'How the Career Assessment Works', es: 'Cómo funciona la evaluación' },
  'home.how.step1.title': { en: '1. Answer Questions', es: '1. Responde las preguntas' },
  'home.how.step1.body': {
    en: '46 questions covering your skills, interests, work preferences, and values.',
    es: '46 preguntas sobre tus habilidades, intereses, preferencias de trabajo y valores.',
  },
  'home.how.step2.title': { en: '2. Get Your AI Report', es: '2. Recibe tu informe con IA' },
  'home.how.step2.body': {
    en: 'Our AI matches your profile to 15+ career clusters and explains why each fits you.',
    es: 'Nuestra IA relaciona tu perfil con más de 15 áreas profesionales y te explica por qué encaja cada una.',
  },
  'home.how.step3.title': { en: '3. Get Your Roadmap', es: '3. Consigue tu hoja de ruta' },
  'home.how.step3.body': {
    en: 'Unlock a detailed career roadmap with job titles, courses, and a 3-month action plan.',
    es: 'Desbloquea una hoja de ruta detallada con puestos, cursos y un plan de acción de 3 meses.',
  },

  'home.who.title': { en: 'Who We Are', es: 'Quiénes somos' },
  'home.who.p1.strong': { en: "We're students, just like you", es: 'Somos estudiantes, como tú' },
  'home.who.p1.rest': {
    en: ", currently at university. We've faced the same uncertainty, stress, and confusion about what comes next.",
    es: ', ahora mismo en la universidad. Hemos vivido la misma incertidumbre, el mismo estrés y la misma confusión sobre lo que viene después.',
  },
  'home.who.p2.before': { en: 'This questionnaire is ', es: 'Este cuestionario está ' },
  'home.who.p2.strong': { en: 'built from real, recent experience', es: 'hecho a partir de experiencia real y reciente' },
  'home.who.p2.rest': {
    en: ". It comes directly from the struggles we wish we'd had help with, and it's peer-driven, practical, and tested through our own career exploration.",
    es: '. Nace directamente de las dificultades con las que nos habría gustado tener ayuda; es práctico, hecho entre iguales y probado en nuestra propia búsqueda profesional.',
  },
  'home.who.p3.before': { en: "It's ", es: 'Está ' },
  'home.who.p3.strong': { en: 'made by students, for students', es: 'hecho por estudiantes, para estudiantes' },
  'home.who.p3.rest': {
    en: ': no jargon, no judgment, and no expert distance. Just a clear, honest framework designed to help you avoid the trial-and-error we went through.',
    es: ': sin jerga, sin juicios y sin distancia de experto. Solo un marco claro y honesto para ayudarte a evitar el ensayo y error por el que pasamos nosotros.',
  },
  'home.who.p4.strong': { en: 'Our mission', es: 'Nuestra misión' },
  'home.who.p4.rest': {
    en: ' is simple: make it easier for students to find a future career that actually fits. We built this hoping it would save you time, reduce anxiety, and give you a plan you can believe in.',
    es: ' es sencilla: que a los estudiantes les resulte más fácil encontrar una carrera que de verdad les encaje. Lo creamos con la esperanza de ahorrarte tiempo, reducir tu ansiedad y darte un plan en el que puedas creer.',
  },

  'home.why.title': { en: 'Why Use {brand}?', es: '¿Por qué usar {brand}?' },
  'home.why.1.title': { en: 'A Clear Career Roadmap, Not Just Advice', es: 'Una hoja de ruta clara, no solo consejos' },
  'home.why.1.body': {
    en: 'Instead of vague suggestions, you get a structured, step-by-step plan tailored to your unique goals and situation.',
    es: 'En lugar de sugerencias vagas, recibes un plan estructurado, paso a paso, adaptado a tus objetivos y a tu situación.',
  },
  'home.why.2.title': { en: 'Turn Uncertainty into a Concrete Plan', es: 'Convierte la incertidumbre en un plan concreto' },
  'home.why.2.body': {
    en: 'We capture your interests and build a complete blueprint so you know exactly what to do next.',
    es: 'Recogemos tus intereses y construimos un plan completo para que sepas exactamente qué hacer después.',
  },
  'home.why.3.title': { en: 'Eliminate Career Confusion and Self-Doubt', es: 'Acaba con la confusión y las dudas' },
  'home.why.3.body': {
    en: 'The in-depth analysis removes guesswork, giving you confidence that every step is informed and intentional.',
    es: 'El análisis en profundidad elimina las conjeturas y te da la seguridad de que cada paso es informado y consciente.',
  },
  'home.why.4.title': { en: 'Uncover Hidden Strengths & Opportunities', es: 'Descubre fortalezas y oportunidades ocultas' },
  'home.why.4.body': {
    en: 'Go beyond surface-level thinking. Get a nuanced breakdown of your strengths and the career paths most people overlook.',
    es: 'Ve más allá de lo superficial. Recibe un análisis matizado de tus fortalezas y de las salidas que la mayoría pasa por alto.',
  },
  'home.why.5.title': { en: 'Stop Wasting Time on Trial & Error', es: 'Deja de perder tiempo probando a ciegas' },
  'home.why.5.body': {
    en: 'With a personalised, AI-powered roadmap, you move faster, avoid common mistakes, and stay focused on what truly matters for your career.',
    es: 'Con una hoja de ruta personalizada con IA avanzas más rápido, evitas errores habituales y te centras en lo que de verdad importa para tu carrera.',
  },

  'home.cta2.title': { en: 'Ready to Find Your Ideal Career Path?', es: '¿Listo para encontrar tu camino profesional ideal?' },
  'home.cta2.body': {
    en: "Join students who've already discovered careers that fit their strengths and ambitions.",
    es: 'Únete a los estudiantes que ya han descubierto profesiones que encajan con sus fortalezas y ambiciones.',
  },
  'home.cta2.button': { en: 'Start Your Free Career Assessment →', es: 'Empieza tu evaluación gratuita →' },

  'home.contact.title': { en: "Still Feeling Unsure? We're Here to Help", es: '¿Sigues con dudas? Estamos aquí para ayudarte' },
  'home.contact.body': {
    en: "Every journey is different, and your situation might have unique challenges the questionnaire couldn't fully capture. That's exactly why we've left the door open to talk. Reach out through any of the channels below and mention that you took the questionnaire, so we have a little context.",
    es: 'Cada camino es distinto, y tu situación puede tener retos que el cuestionario no ha podido recoger del todo. Por eso dejamos la puerta abierta para hablar. Escríbenos por cualquiera de los canales de abajo y menciona que has hecho el cuestionario, para tener un poco de contexto.',
  },
  'home.contact.closing': {
    en: 'We genuinely want to help. This project came from our own struggles, and if it helps even one student feel more confident about their future, it was worth it.',
    es: 'De verdad queremos ayudar. Este proyecto nació de nuestras propias dificultades, y si ayuda aunque sea a un solo estudiante a sentirse más seguro con su futuro, habrá merecido la pena.',
  },
  'home.reach.title': { en: 'Reach Us Anywhere', es: 'Encuéntranos donde quieras' },
  'home.reach.body': { en: 'Say hello, ask a question, or just follow along.', es: 'Salúdanos, haz una pregunta o simplemente síguenos.' },
  'home.reach.email': { en: 'Email', es: 'Correo' },

  // Demo quiz
  'demo.progress': { en: 'Question {current} of {total}', es: 'Pregunta {current} de {total}' },
  'demo.complete': { en: '{percent}% Complete', es: '{percent} % completado' },
  'demo.previous': { en: '← Previous question', es: '← Pregunta anterior' },
} satisfies Record<string, Entry>;
