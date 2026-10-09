// Payment success and cancelled pages.
import type { Entry } from './types';

export const payment = {
  'payment.product.basic': { en: 'Basic plan — 2 assessment attempts added', es: 'Plan Básico: se han añadido 2 intentos de evaluación' },
  'payment.product.full': { en: 'Full plan — 3 complete attempts added', es: 'Plan Completo: se han añadido 3 intentos completos' },
  'payment.product.followup_unlock': { en: 'All followups unlocked, plus 1 bonus attempt', es: 'Todos los seguimientos desbloqueados, más 1 intento extra' },
  'payment.product.topup': { en: '3 extra attempts added', es: 'Se han añadido 3 intentos extra' },

  'payment.dest./assess': { en: 'your assessment', es: 'tu evaluación' },
  'payment.dest./followup': { en: 'your followup questionnaire', es: 'tu cuestionario de seguimiento' },
  'payment.dest./history': { en: 'your history', es: 'tu historial' },
  'payment.dest./pricing': { en: 'the pricing page', es: 'la página de precios' },
  'payment.dest.default': { en: 'where you left off', es: 'donde lo dejaste' },

  'payment.heading.received': { en: 'Payment received', es: 'Pago recibido' },
  'payment.heading.success': { en: 'Payment Successful!', es: '¡Pago completado!' },
  'payment.body.verifying': { en: 'Confirming your payment and setting up your account...', es: 'Confirmando tu pago y preparando tu cuenta...' },
  'payment.body.completeProduct': { en: '{product}. Taking you back to {destination}...', es: '{product}. Te llevamos de vuelta a {destination}...' },
  'payment.body.complete': {
    en: 'Your purchase has been applied to your account. Taking you back to {destination}...',
    es: 'Tu compra ya está en tu cuenta. Te llevamos de vuelta a {destination}...',
  },
  'payment.body.pending': {
    en: 'Your payment is still being processed by your bank. It usually clears within a few minutes — you can carry on, and your purchase will appear on your account as soon as it settles.',
    es: 'Tu banco todavía está procesando el pago. Suele completarse en unos minutos: puedes seguir, y tu compra aparecerá en tu cuenta en cuanto se confirme.',
  },
  'payment.body.unauthenticated': {
    en: 'Your payment went through, but your sign-in session expired while you were on Stripe. Sign in again and your purchase will be waiting on your account.',
    es: 'Tu pago se ha completado, pero tu sesión caducó mientras estabas en Stripe. Vuelve a iniciar sesión y tu compra estará esperándote en tu cuenta.',
  },
  'payment.error.verify': { en: 'We could not confirm your payment automatically.', es: 'No hemos podido confirmar tu pago automáticamente.' },
  'payment.error.unreachable': { en: 'We could not reach the server to confirm your payment.', es: 'No hemos podido contactar con el servidor para confirmar tu pago.' },
  'payment.error.reassure': {
    en: ' Your payment was not lost — if the purchase does not show up within a few minutes, contact us with your receipt and we will sort it out.',
    es: ' Tu pago no se ha perdido: si la compra no aparece en unos minutos, escríbenos con tu recibo y lo solucionaremos.',
  },
  'payment.signInAgain': { en: 'Sign in again', es: 'Volver a iniciar sesión' },
  'payment.continueTo': { en: 'Continue to {destination}', es: 'Continuar a {destination}' },

  'payment.cancelled.title': { en: 'Payment Cancelled', es: 'Pago cancelado' },
  'payment.cancelled.body': {
    en: "No charge was made, and nothing you've already answered was lost. You can pick up right where you left off whenever you're ready.",
    es: 'No se ha hecho ningún cargo y no has perdido nada de lo que ya respondiste. Puedes seguir justo donde lo dejaste cuando quieras.',
  },
  'payment.cancelled.back./assess': { en: 'Back to my assessment', es: 'Volver a mi evaluación' },
  'payment.cancelled.back./followup': { en: 'Back to my followup', es: 'Volver a mi seguimiento' },
  'payment.cancelled.back./history': { en: 'Back to my history', es: 'Volver a mi historial' },
  'payment.cancelled.back./pricing': { en: 'Back to Pricing', es: 'Volver a precios' },
  'payment.cancelled.goBack': { en: 'Go back', es: 'Volver' },
} satisfies Record<string, Entry>;
