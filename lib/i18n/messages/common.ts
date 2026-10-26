// Strings shared across the site: navigation, footer, generic buttons and states.
import type { Entry } from './types';

export const common = {
  'common.loading': { en: 'Loading...', es: 'Cargando...' },
  'common.pleaseWait': { en: 'Please wait...', es: 'Un momento...' },
  'common.back': { en: '← Back', es: '← Atrás' },
  'common.next': { en: 'Next →', es: 'Siguiente →' },
  'common.close': { en: 'Close', es: 'Cerrar' },
  'common.cancel': { en: 'Cancel', es: 'Cancelar' },
  'common.save': { en: 'Save', es: 'Guardar' },
  'common.error.generic': { en: 'Something went wrong. Please try again.', es: 'Algo ha fallado. Inténtalo de nuevo.' },
  'common.error.network': { en: 'Network error. Please try again.', es: 'Error de conexión. Inténtalo de nuevo.' },
  // What a failed request means, worded for the reader. The server's own
  // `error` text is English and never shown; lib/i18n/api-error.ts picks one
  // of these from the response's code or status.
  'error.paused': {
    en: 'Report writing is paused for a few minutes while we fix a problem. Nothing has been used up; please try again shortly.',
    es: 'La redacción de informes está en pausa unos minutos mientras solucionamos un problema. No se ha gastado nada; vuelve a intentarlo en un rato.',
  },
  'error.sessionExpired': {
    en: 'Your session has expired. Sign in again and you will carry on where you were.',
    es: 'Tu sesión ha caducado. Vuelve a iniciar sesión y seguirás donde lo dejaste.',
  },
  'error.emailNotVerified': {
    en: 'Please confirm your email address first, using the link we sent you.',
    es: 'Primero confirma tu correo con el enlace que te enviamos.',
  },
  'error.noAttempts': {
    en: 'You have no attempts left. Choose a plan to continue.',
    es: 'No te quedan intentos. Elige un plan para continuar.',
  },
  'error.generationFailed': {
    en: 'The AI could not write this just now. Nothing has been used up; please try again in a moment.',
    es: 'La IA no ha podido escribirlo ahora mismo. No se ha gastado nada; vuelve a intentarlo en un momento.',
  },
  'error.alreadyRunning': {
    en: 'This is already being written. Wait a moment, then refresh the page.',
    es: 'Ya se está escribiendo. Espera un momento y recarga la página.',
  },
  'error.tooMany': {
    en: 'Too many tries in a short time. Wait a minute and try again.',
    es: 'Demasiados intentos en poco tiempo. Espera un minuto y vuelve a intentarlo.',
  },
  'common.or': { en: 'or', es: 'o' },

  'nav.language': { en: 'Language', es: 'Idioma' },
  'nav.continueAssessment': { en: 'Continue Assessment', es: 'Continuar evaluación' },
  'nav.fullAssessment': { en: 'Full Assessment', es: 'Evaluación completa' },
  'nav.history': { en: 'History', es: 'Historial' },
  'nav.account': { en: 'Account', es: 'Cuenta' },
  'nav.logout': { en: 'Logout', es: 'Cerrar sesión' },
  'nav.login': { en: 'Login', es: 'Iniciar sesión' },
  'nav.signup': { en: 'Sign Up', es: 'Registrarse' },
  'nav.university': { en: 'University dashboard', es: 'Panel de la universidad' },
  'nav.menu': { en: 'Menu', es: 'Menú' },

  'footer.blurb': {
    en: 'An AI-assisted career assessment for students and graduates. Your report is information to think about, not professional careers advice.',
    es: 'Una evaluación de carrera asistida por IA para estudiantes y titulados. Tu informe es información para reflexionar, no asesoramiento profesional.',
  },
  'footer.product': { en: 'Product', es: 'Producto' },
  'footer.legal': { en: 'Legal', es: 'Legal' },
  'footer.link.assess': { en: 'Take the assessment', es: 'Hacer la evaluación' },
  'footer.link.sample': { en: 'See a sample report', es: 'Ver un informe de ejemplo' },
  'footer.link.pricing': { en: 'Pricing', es: 'Precios' },
  'footer.link.history': { en: 'Your history', es: 'Tu historial' },
  'footer.link.account': { en: 'Your account and data', es: 'Tu cuenta y tus datos' },
  'footer.link.privacy': { en: 'Privacy', es: 'Privacidad' },
  'footer.link.terms': { en: 'Terms', es: 'Términos' },
  'footer.link.refunds': { en: 'Refunds', es: 'Reembolsos' },
  'footer.link.cookies': { en: 'Cookies', es: 'Cookies' },
  'footer.link.acceptableUse': { en: 'Acceptable use', es: 'Uso aceptable' },
  'footer.link.aiNotice': { en: 'AI notice', es: 'Aviso sobre IA' },
  'footer.link.contact': { en: 'Contact us', es: 'Contacto' },
  'footer.legalEnglishOnly': {
    en: '',
    es: 'Los documentos legales están disponibles solo en inglés por ahora.',
  },
  'footer.company': {
    en: '{trading} is a trading name of {legal}, a limited liability company established in Hungary.',
    es: '{trading} es un nombre comercial de {legal}, sociedad de responsabilidad limitada establecida en Hungría.',
  },
  'footer.registration': {
    en: 'Company registration no. (cégjegyzékszám): {number}. Registry court: {court}. Registered seat: {address}. Tax no.: {tax}.',
    es: 'N.º de registro mercantil (cégjegyzékszám): {number}. Tribunal registral: {court}. Domicilio social: {address}. N.º fiscal: {tax}.',
  },
  'footer.vat': { en: 'EU VAT no.: {vat}.', es: 'N.º de IVA intracomunitario: {vat}.' },
  'footer.phone': { en: 'Telephone: {phone}.', es: 'Teléfono: {phone}.' },
  'footer.rights': { en: '© {year} {trading}. All rights reserved.', es: '© {year} {trading}. Todos los derechos reservados.' },
} satisfies Record<string, Entry>;
