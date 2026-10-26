// lib/email-copy.ts
//
// Every word of every email, both languages side by side. Kept out of the
// site's message files because those ship to the browser and these never
// need to. Short on purpose: one idea per email, one button.

import type { Locale } from '@/lib/i18n/config';

type ProductKey = 'basic' | 'full' | 'followup_unlock' | 'topup';

/** The seller's details as far as they exist; null until the company is registered. */
export type SellerParts = {
  name: string;
  address: string | null;
  companyNumber: string | null;
  registryCourt: string | null;
  taxNumber: string | null;
  email: string;
  phone: string | null;
};

function joinSentences(parts: (string | null | false)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Ends a sentence once: "ADAQNO Kft." already carries its own full stop. */
function sentence(s: string): string {
  return s.endsWith('.') ? s : `${s}.`;
}

type AuthEmail = {
  subject: string;
  preview: string;
  heading: string;
  body: string;
  button: string;
  /** Why they got it, and what to do if they did not ask for it. */
  ignore: string;
};

type Copy = {
  descriptor: string;
  buttonFallback: string;
  auth: { signup: AuthEmail; magiclink: AuthEmail; recovery: AuthEmail };
  receipt: {
    subject: (product: string) => string;
    preview: (amount: string) => string;
    heading: string;
    item: string;
    paid: string;
    added: string;
    attempts: (n: number) => string;
    body: string;
    button: string;
    date: string;
    /** Confirms the express request and acknowledgement given at checkout. */
    consentGiven: string;
    /** When no tickbox was shown: nothing to confirm, so the full 14 days stand. */
    consentMissing: string;
    withdraw: string;
    withdrawLink: string;
    help: (email: string) => string;
    products: Record<ProductKey, string>;
    /** What each product adds, in the words of Schedule 1 of the terms. */
    describe: Record<ProductKey, string>;
    /** The pre-contract information, repeated on a durable medium. */
    contract: {
      heading: string;
      keep: string;
      seller: (s: SellerParts) => string;
      bought: (what: string, amount: string) => string;
      delivery: string;
      withdrawal: string;
      faulty: string;
      complaints: (email: string, phone: string | null) => string;
      terms: (version: string, site: string) => string;
      termsLink: string;
    };
  };
  ready: {
    report: { subject: string; button: string };
    roadmap: { subject: string; button: string };
    body: string;
  };
  withdrawal: { heading: string };
};

export const EMAIL_COPY: Record<Locale, Copy> = {
  en: {
    descriptor: 'Career Planning',
    buttonFallback: 'Button not working? Open this link:',
    auth: {
      signup: {
        subject: 'Confirm your email for ADAQNO',
        preview: 'One click and your account is ready.',
        heading: 'Confirm your email',
        body: 'One click and your account is ready.',
        button: 'Confirm email',
        ignore: 'Didn’t sign up for ADAQNO? Ignore this email.',
      },
      magiclink: {
        subject: 'Your ADAQNO sign-in link',
        preview: 'Sign in with one click. The link expires in one hour.',
        heading: 'Sign in to ADAQNO',
        body: 'Use the button to sign in. It works once and expires in one hour.',
        button: 'Sign in',
        ignore: 'Didn’t ask for this? Ignore this email. Your account is safe.',
      },
      recovery: {
        subject: 'Reset your ADAQNO password',
        preview: 'Choose a new password. The link expires in one hour.',
        heading: 'Reset your password',
        body: 'Use the button to choose a new password. The link expires in one hour.',
        button: 'Choose a new password',
        ignore: 'Didn’t ask for this? Ignore this email. Your password stays the same.',
      },
    },
    receipt: {
      subject: (product) => `Your ADAQNO receipt: ${product}`,
      preview: (amount) => `Paid ${amount}. Everything is ready on your account.`,
      heading: 'Thanks for your purchase',
      item: 'Item',
      paid: 'Paid',
      added: 'Added',
      attempts: (n) => `${n} ${n === 1 ? 'attempt' : 'attempts'}`,
      body: 'Everything is on your account, and your reports stay in your history.',
      button: 'Open my history',
      date: 'Date',
      consentGiven:
        'At checkout you asked for this purchase to be made available immediately, and you acknowledged that once ' +
        'you generate a report with an attempt, you lose your 14-day right to withdraw for that attempt. Anything ' +
        'you have not used stays refundable for 14 days.',
      consentMissing: 'You can withdraw from this purchase within 14 days of today, without giving a reason.',
      withdraw: 'Changed your mind? You can withdraw within 14 days.',
      withdrawLink: 'Withdraw here',
      help: (email) => `Something missing? Write to ${email} before contacting your bank. We usually fix it within minutes.`,
      products: {
        basic: 'Basic plan',
        full: 'Full plan',
        followup_unlock: 'Follow-up bundle',
        topup: '3 extra attempts',
      },
      describe: {
        basic: '2 assessment attempts, each producing one AI-written career report. The follow-up is not included',
        full: '3 complete attempts: the assessment and the follow-up roadmap for each',
        followup_unlock: 'the follow-up questionnaire for every attempt on your account, plus one bonus attempt',
        topup: '3 more complete attempts, each with the follow-up',
      },
      contract: {
        heading: 'About this contract',
        keep: 'Keep this email. It is your record of the contract and of the information we must give you.',
        seller: (s) =>
          joinSentences([
            sentence(`Seller: ${s.name}${s.address ? `, ${s.address}` : ''}`),
            s.companyNumber &&
              `Company registration no. ${s.companyNumber}${s.registryCourt ? `, ${s.registryCourt}` : ''}.`,
            s.taxNumber && `Tax no. ${s.taxNumber}.`,
            `${s.email}${s.phone ? `, ${s.phone}` : ''}.`,
          ]),
        bought: (what, amount) => `What you bought: ${what}. ${amount}, tax included. A one-off payment: nothing renews.`,
        delivery:
          'Delivery: added to your account straight away. You need an up-to-date web browser and nothing else. ' +
          'Reports can be printed or saved, and carry no copy protection.',
        withdrawal:
          'Withdrawal: within 14 days of today, without giving a reason, on the withdrawal page, by email, or with ' +
          'the model form in our Refund and Cancellation Policy. We refund within 14 days, the same way you paid, ' +
          'and charge nothing for it.',
        faulty:
          'If something is faulty: the legal guarantee of conformity (kellékszavatosság) applies. We regenerate the ' +
          'report or restore the attempt; if we cannot, you get a price reduction or your money back. Tell us within ' +
          'two months of noticing; the guarantee lasts two years. No commercial guarantee is offered.',
        complaints: (email, phone) =>
          `Complaints: write to ${email}${phone ? ` or call ${phone}` : ''}. We answer in writing within 30 days. ` +
          'If we cannot agree, you can take the dispute to a Hungarian conciliation board free of charge. The ' +
          'boards are listed in our Refund and Cancellation Policy.',
        terms: (version, site) =>
          `Terms: our Terms of Service (version ${version}) and our Refund and Cancellation Policy apply, at ` +
          `${site}/terms and ${site}/refunds.`,
        termsLink: 'Read the terms',
      },
    },
    ready: {
      report: { subject: 'Your career report is ready', button: 'Open my report' },
      roadmap: { subject: 'Your career roadmap is ready', button: 'Open my roadmap' },
      body: 'It is saved in your history, so you can come back to it any time.',
    },
    withdrawal: { heading: 'Withdrawal received' },
  },
  es: {
    descriptor: 'Orientación profesional',
    buttonFallback: '¿No funciona el botón? Abre este enlace:',
    auth: {
      signup: {
        subject: 'Confirma tu correo para ADAQNO',
        preview: 'Un clic y tu cuenta estará lista.',
        heading: 'Confirma tu correo',
        body: 'Un clic y tu cuenta estará lista.',
        button: 'Confirmar correo',
        ignore: '¿No te has registrado en ADAQNO? Ignora este correo.',
      },
      magiclink: {
        subject: 'Tu enlace para entrar en ADAQNO',
        preview: 'Entra con un clic. El enlace caduca en una hora.',
        heading: 'Entra en ADAQNO',
        body: 'Usa el botón para entrar. Funciona una sola vez y caduca en una hora.',
        button: 'Entrar',
        ignore: '¿No lo has pedido? Ignora este correo. Tu cuenta está segura.',
      },
      recovery: {
        subject: 'Restablece tu contraseña de ADAQNO',
        preview: 'Elige una contraseña nueva. El enlace caduca en una hora.',
        heading: 'Restablece tu contraseña',
        body: 'Usa el botón para elegir una contraseña nueva. El enlace caduca en una hora.',
        button: 'Elegir contraseña nueva',
        ignore: '¿No lo has pedido? Ignora este correo. Tu contraseña no cambia.',
      },
    },
    receipt: {
      subject: (product) => `Tu recibo de ADAQNO: ${product}`,
      preview: (amount) => `Has pagado ${amount}. Ya lo tienes todo en tu cuenta.`,
      heading: 'Gracias por tu compra',
      item: 'Producto',
      paid: 'Pagado',
      added: 'Añadido',
      attempts: (n) => `${n} ${n === 1 ? 'intento' : 'intentos'}`,
      body: 'Todo está en tu cuenta y tus informes se quedan en tu historial.',
      button: 'Ver mi historial',
      date: 'Fecha',
      consentGiven:
        'En el pago pediste que esta compra estuviera disponible de inmediato y reconociste que, cuando generes un ' +
        'informe con un intento, pierdes tu derecho a desistir en 14 días respecto de ese intento. Lo que no hayas ' +
        'usado sigue siendo reembolsable durante 14 días.',
      consentMissing: 'Puedes desistir de esta compra en los 14 días siguientes a hoy, sin dar ningún motivo.',
      withdraw: '¿Has cambiado de idea? Puedes desistir en 14 días.',
      withdrawLink: 'Desistir aquí',
      help: (email) => `¿Falta algo? Escríbenos a ${email} antes de hablar con tu banco. Normalmente lo solucionamos en minutos.`,
      products: {
        basic: 'Plan Básico',
        full: 'Plan Completo',
        followup_unlock: 'Paquete de seguimientos',
        topup: '3 intentos extra',
      },
      describe: {
        basic: '2 intentos de evaluación; cada uno genera un informe de carrera escrito por IA. No incluye el seguimiento',
        full: '3 intentos completos: la evaluación y la hoja de ruta de seguimiento de cada uno',
        followup_unlock: 'el cuestionario de seguimiento para todos los intentos de tu cuenta, más un intento extra',
        topup: '3 intentos completos más, cada uno con su seguimiento',
      },
      contract: {
        heading: 'Sobre este contrato',
        keep: 'Guarda este correo. Es tu constancia del contrato y de la información que debemos darte.',
        seller: (s) =>
          joinSentences([
            sentence(`Vendedor: ${s.name}${s.address ? `, ${s.address}` : ''}`),
            s.companyNumber &&
              `N.º de registro mercantil ${s.companyNumber}${s.registryCourt ? `, ${s.registryCourt}` : ''}.`,
            s.taxNumber && `N.º fiscal ${s.taxNumber}.`,
            `${s.email}${s.phone ? `, ${s.phone}` : ''}.`,
          ]),
        bought: (what, amount) =>
          `Lo que has comprado: ${what}. ${amount}, impuestos incluidos. Pago único: nada se renueva.`,
        delivery:
          'Entrega: se añade a tu cuenta al momento. Solo necesitas un navegador actualizado. Los informes se ' +
          'pueden imprimir o guardar y no llevan protección anticopia.',
        withdrawal:
          'Desistimiento: en los 14 días siguientes a hoy, sin dar motivos, en la página de desistimiento, por ' +
          'correo o con el formulario modelo de nuestra Política de reembolsos y desistimiento. Te devolvemos el ' +
          'dinero en 14 días, por el mismo medio de pago y sin coste.',
        faulty:
          'Si algo falla: se aplica la garantía legal de conformidad (kellékszavatosság). Regeneramos el informe o ' +
          'restauramos el intento; si no es posible, te rebajamos el precio o te devolvemos el dinero. Avísanos en ' +
          'los dos meses siguientes a detectarlo; la garantía dura dos años. No ofrecemos garantía comercial.',
        complaints: (email, phone) =>
          `Reclamaciones: escribe a ${email}${phone ? ` o llama al ${phone}` : ''}. Respondemos por escrito en un ` +
          'plazo de 30 días. Si no llegamos a un acuerdo, puedes acudir gratis a una junta de conciliación húngara ' +
          '(békéltető testület). Las juntas figuran en nuestra Política de reembolsos y desistimiento.',
        terms: (version, site) =>
          `Condiciones: se aplican nuestros Términos del servicio (versión ${version}) y nuestra Política de ` +
          `reembolsos y desistimiento, en inglés, en ${site}/terms y ${site}/refunds.`,
        termsLink: 'Leer las condiciones',
      },
    },
    ready: {
      report: { subject: 'Tu informe de carrera está listo', button: 'Abrir mi informe' },
      roadmap: { subject: 'Tu hoja de ruta está lista', button: 'Abrir mi hoja de ruta' },
      body: 'Está guardado en tu historial para que vuelvas a él cuando quieras.',
    },
    withdrawal: { heading: 'Desistimiento recibido' },
  },
};
