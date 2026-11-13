// lib/legal-es.ts
//
// The Spanish side of lib/legal.ts: the tables and sentences the legal pages
// render from shared data, in Spanish. The English text binds (Terms 13); the
// Spanish pages are a translation for the reader's convenience.
//
// Keyed by the English entry, not by position, so a row added to
// SUBPROCESSORS or RETENTION without a Spanish twin shows up in the test
// (lib/legal-es.test.ts) rather than as a silently English row on a Spanish
// page.

import { COMPANY, RETENTION, SUBPROCESSORS, type Subprocessor } from '@/lib/legal';

type SubprocessorText = Omit<Subprocessor, 'name'>;

export const SUBPROCESSORS_ES: Record<string, SubprocessorText> = {
  Supabase: {
    purpose: 'Base de datos e inicio de sesión de las cuentas',
    data: 'Dirección de correo electrónico, identificadores de cuenta, respuestas a la evaluación y al cuestionario de seguimiento, informes generados, valoraciones y comentarios, y la universidad asociada a través de la que te uniste, si la hay',
    region: 'Unión Europea (Fráncfort, Alemania)',
  },
  OpenAI: {
    purpose:
      'Redactar tu informe de orientación profesional y tu hoja de ruta. También resumir temas comunes en las respuestas de muchas personas para mejorar el cuestionario y los informes.',
    data: 'Tus respuestas, tus puntuaciones por área profesional y el idioma en que usas el sitio; para la hoja de ruta, también tus respuestas de seguimiento y tu primer informe; si llegaste a través de una universidad, el país en que está. Para el trabajo de mejora, respuestas sin los datos que te identifican. Nunca tu nombre ni tu correo electrónico. No se usan para entrenar sus modelos.',
    region: 'Estados Unidos',
  },
  Stripe: {
    purpose: 'Cobrar los pagos',
    data: 'Dirección de correo electrónico y datos de pago. Nunca vemos ni guardamos el número de tu tarjeta.',
    region: 'Estados Unidos e Irlanda',
  },
  Vercel: {
    purpose:
      'Alojar el sitio web. También nos indica desde qué país llega una solicitud, lo que usamos solo para mostrar los teléfonos de ayuda adecuados.',
    data: 'Registros técnicos de las solicitudes, con la dirección IP y el país aproximado',
    region: 'Estados Unidos y Europa',
  },
  Sentry: {
    purpose: 'Registrar errores para poder corregirlos',
    data: 'Detalles técnicos de los errores, que pueden incluir tu identificador de cuenta',
    region: 'Unión Europea (Alemania)',
  },
  Upstash: {
    purpose: 'Limitar el número de solicitudes, para evitar abusos del servicio',
    data: 'Un identificador cifrado (hash) y un recuento de solicitudes. Ningún contenido de la evaluación.',
    region: 'Europa',
  },
  Resend: {
    purpose:
      'Enviar recibos, enlaces de inicio de sesión, avisos de «informe listo» y confirmaciones cuando cancelas una compra',
    data: 'Tu dirección de correo electrónico y el contenido de ese correo. Ninguna respuesta de la evaluación.',
    region: 'Estados Unidos',
  },
  Google: {
    purpose: 'Iniciar sesión con Google, si lo eliges',
    data: 'La solicitud de inicio de sesión. Google nos comunica tu dirección de correo electrónico; nosotros no le comunicamos nada sobre tus respuestas.',
    region: 'Estados Unidos',
  },
  ImprovMX: {
    purpose:
      'Hacer llegar a nuestro buzón los correos que envías a nuestras direcciones de soporte y de privacidad',
    data: 'Tu dirección de correo electrónico y el contenido del correo, guardados solo hasta que se entregan',
    region: 'Francia y Estados Unidos',
  },
  'Google (Gmail)': {
    purpose: 'El buzón al que llegan, y desde el que se responden, los correos que nos envías',
    data: 'Tu dirección de correo electrónico y el contenido de los correos que nos envías. Ninguna respuesta de la evaluación, salvo que la incluyas en un correo.',
    region: 'Estados Unidos y Europa',
  },
};

type RetentionRow = (typeof RETENTION)[number];

export const RETENTION_ES: Record<string, RetentionRow> = {
  'Your account and assessment results': {
    what: 'Tu cuenta y los resultados de tu evaluación',
    how_long:
      'Hasta que elimines tu cuenta, o hasta que lleve dos años sin usarse. Antes te enviamos un correo, y la eliminamos tres meses después salvo que inicies sesión.',
    why: 'Para que puedas volver a tus informes y a tu historial cuando quieras, sin que guardemos para siempre una cuenta que nadie usa.',
  },
  'Ratings and comments you leave on a report': {
    what: 'Las valoraciones y comentarios que dejas sobre un informe',
    how_long: 'Mientras exista tu cuenta',
    why: 'Para mejorar el cuestionario y los informes. Una universidad asociada solo ve la valoración media de sus estudiantes, y solo cuando al menos cinco han valorado.',
  },
  'Your link to a partner university': {
    what: 'Tu vínculo con una universidad asociada',
    how_long: 'Mientras exista tu cuenta',
    why: 'Para que el acceso gratuito que paga tu universidad siga funcionando mientras dure su licencia. Cuando una licencia termina, tu cuenta y tus informes siguen siendo tuyos.',
  },
  'University staff contact details': {
    what: 'Datos de contacto del personal universitario',
    how_long:
      'Hasta que la universidad nos pida retirar a alguien, o 12 meses después de que termine su acuerdo con nosotros',
    why: 'Para que las personas que la universidad designó puedan entrar en su panel, y para poder demostrar quién tuvo acceso si alguna vez se pregunta.',
  },
  'Payment records': {
    what: 'Registros de pagos',
    how_long: '8 años desde el final del ejercicio en que se hizo la venta',
    why: 'La ley de contabilidad húngara nos obliga a conservar los registros de cada venta al menos 8 años. Se conservan incluso después de eliminar la cuenta, quitando tu nombre y tu correo cuando es posible.',
  },
  'Cancellations you send us (the withdrawal form)': {
    what: 'Las cancelaciones que nos envías (el formulario de desistimiento)',
    how_long: '8 años desde el final del ejercicio, igual que los registros de pagos',
    why: 'Son la prueba de que cancelaste a tiempo y de que te devolvimos el dinero. Se conservan con tu nombre y tu correo, también después de eliminar la cuenta, porque sin ellos esa prueba no demostraría nada.',
  },
  'Emails you send us': {
    what: 'Los correos que nos envías',
    how_long: '2 años después de tu último mensaje',
    why: 'Para tener el historial si vuelves a escribirnos sobre lo mismo.',
  },
  'Complaints, and our answers to them': {
    what: 'Las reclamaciones y nuestras respuestas',
    how_long: '3 años después de nuestra respuesta',
    why: 'La ley húngara de protección de los consumidores nos obliga a conservar cada reclamación y nuestra respuesta durante tres años, y a mostrarlas a la autoridad de consumo si lo pide (Ley CLV de 1997, artículo 17/A).',
  },
  'Error and security logs': {
    what: 'Registros de errores y de seguridad',
    how_long: 'Hasta 90 días',
    why: 'Lo suficiente para investigar un fallo o un incidente de seguridad, y no más.',
  },
  'Records of what our administrators do': {
    what: 'Registros de lo que hacen nuestros administradores',
    how_long: '2 años',
    why: 'Para poder detectar un mal uso del acceso de administrador. Registran que una acción ocurrió y sobre qué cuenta, no el contenido de tus respuestas. Lo aplica una tarea automática cada noche; véase supabase/retention-rules.sql.',
  },
  'Product analytics events': {
    what: 'Eventos de analítica del producto',
    how_long: '90 días',
    why: 'Para ver en qué paso de la evaluación se pierde la gente. Nunca contienen el contenido de tus respuestas, y al eliminar tu cuenta se desvinculan de ti en lugar de borrarse. Lo aplica una tarea automática cada noche, no una persona; véase supabase/analytics-retention.sql.',
  },
};

/** SUBPROCESSORS with the Spanish text, falling back to English for a row without a twin. */
export function subprocessorsEs(): Subprocessor[] {
  return SUBPROCESSORS.map((s) => ({ name: s.name, ...(SUBPROCESSORS_ES[s.name] ?? s) }));
}

/** RETENTION in Spanish, falling back to English for a row without a twin. */
export function retentionEs(): RetentionRow[] {
  return RETENTION.map((r) => RETENTION_ES[r.what] ?? r);
}

const MONTHS_ES: Record<string, string> = {
  January: 'enero',
  February: 'febrero',
  March: 'marzo',
  April: 'abril',
  May: 'mayo',
  June: 'junio',
  July: 'julio',
  August: 'agosto',
  September: 'septiembre',
  October: 'octubre',
  November: 'noviembre',
  December: 'diciembre',
};

/** "11 November 2026" → "11 de noviembre de 2026". Anything else comes back unchanged. */
export function toSpanishDate(date: string): string {
  const m = /^(\d{1,2}) ([A-Z][a-z]+) (\d{4})$/.exec(date.trim());
  if (!m || !MONTHS_ES[m[2]]) return date;
  return `${m[1]} de ${MONTHS_ES[m[2]]} de ${m[3]}`;
}

/** The country names lib/legal.ts uses, in Spanish. */
export const COUNTRY_ES: Record<string, string> = { Hungary: 'Hungría' };

export const JURISDICTION_ES = COUNTRY_ES[COMPANY.jurisdiction] ?? COMPANY.jurisdiction;

/** registrationDetails() in Spanish. Empty until the company is registered. */
export function registrationDetailsEs(): string {
  const parts: string[] = [];
  if (COMPANY.companyNumber) {
    parts.push(
      `Número de registro mercantil (cégjegyzékszám): ${COMPANY.companyNumber}` +
        (COMPANY.registryCourt ? `, inscrita por el ${COMPANY.registryCourt}.` : '.')
    );
  }
  if (COMPANY.address) parts.push(`Domicilio social (székhely): ${COMPANY.address}.`);
  if (COMPANY.taxNumber) parts.push(`Número fiscal (adószám): ${COMPANY.taxNumber}.`);
  if (COMPANY.euVatNumber) parts.push(`Número de IVA intracomunitario: ${COMPANY.euVatNumber}.`);
  return parts.join(' ');
}

/** What a conciliation board covers, in Spanish: "Pest county" → "condado de Pest". */
export function boardCoversEs(covers: string): string {
  const county = /^(.+) county$/.exec(covers);
  if (county) return `condado de ${county[1]}`;
  return covers.replace(/ and /g, ' y ');
}
