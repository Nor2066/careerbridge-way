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
    en: '{trading} is a trading name of {legal}, registered in {jurisdiction} (company no. {number}). Registered office: {address}.',
    es: '{trading} es un nombre comercial de {legal}, registrada en {jurisdiction} (n.º de empresa {number}). Domicilio social: {address}.',
  },
  'footer.vat': { en: 'VAT no. {vat}.', es: 'N.º de IVA {vat}.' },
  'footer.placeholders': {
    en: 'Company details are still placeholders — fill them in at lib/legal.ts before launch.',
    es: 'Los datos de la empresa aún son provisionales: complétalos en lib/legal.ts antes del lanzamiento.',
  },
  'footer.rights': { en: '© {year} {trading}. All rights reserved.', es: '© {year} {trading}. Todos los derechos reservados.' },
} satisfies Record<string, Entry>;
