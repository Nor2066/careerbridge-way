// lib/email-copy.ts
//
// Every word of every email, both languages side by side. Kept out of the
// site's message files because those ship to the browser and these never
// need to. Short on purpose: one idea per email, one button.

import type { Locale } from '@/lib/i18n/config';

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
    withdraw: string;
    withdrawLink: string;
    help: (email: string) => string;
    products: Record<'basic' | 'full' | 'followup_unlock' | 'topup', string>;
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
      withdraw: 'Changed your mind? You can withdraw within 14 days.',
      withdrawLink: 'Withdraw here',
      help: (email) => `Something missing? Write to ${email} before contacting your bank. We usually fix it within minutes.`,
      products: {
        basic: 'Basic plan',
        full: 'Full plan',
        followup_unlock: 'Follow-up bundle',
        topup: '3 extra attempts',
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
      withdraw: '¿Has cambiado de idea? Puedes desistir en 14 días.',
      withdrawLink: 'Desistir aquí',
      help: (email) => `¿Falta algo? Escríbenos a ${email} antes de hablar con tu banco. Normalmente lo solucionamos en minutos.`,
      products: {
        basic: 'Plan Básico',
        full: 'Plan Completo',
        followup_unlock: 'Paquete de seguimientos',
        topup: '3 intentos extra',
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
