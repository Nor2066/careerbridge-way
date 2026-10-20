// The withdrawal page (/withdraw), its acknowledgement email, and the links to
// it. "Withdraw from contract here" and "Confirm withdrawal" are the labels
// Article 11a of the Consumer Rights Directive names; the Spanish ones are the
// Spanish text of the same directive. Keep them word for word.
import type { Entry } from './types';

export const withdraw = {
  'withdraw.cta': { en: 'Withdraw from contract here', es: 'Desistir del contrato aquí' },
  'withdraw.confirm': { en: 'Confirm withdrawal', es: 'Confirmar desistimiento' },

  'withdraw.title': { en: 'Withdraw from contract', es: 'Desistir del contrato' },
  'withdraw.intro': {
    en: 'You can withdraw from a purchase within 14 days of buying it, without giving a reason. Fill in the form and press Confirm withdrawal, and we will email you a confirmation straight away.',
    es: 'Puedes desistir de una compra en los 14 días siguientes a hacerla, sin dar ningún motivo. Rellena el formulario, pulsa Confirmar desistimiento y te enviaremos una confirmación por correo enseguida.',
  },
  'withdraw.refundRule.before': {
    en: 'If you have already generated a report with the purchase, we refund the part you have not used. The details are in our ',
    es: 'Si ya has generado un informe con la compra, te devolvemos la parte que no has usado. Los detalles están en nuestra ',
  },
  'withdraw.refundRule.link': { en: 'refund policy', es: 'política de reembolsos' },

  'withdraw.signedOut.before': { en: 'It is quicker if you ', es: 'Es más rápido si ' },
  'withdraw.signedOut.link': { en: 'sign in', es: 'inicias sesión' },
  'withdraw.signedOut.after': {
    en: ', because you can then pick the purchase from a list. You do not have to.',
    es: ', porque así eliges la compra de una lista. No es obligatorio.',
  },
  'withdraw.accountEmail': {
    en: 'Email of the account you bought with, if it is a different address (optional)',
    es: 'Correo de la cuenta con la que compraste, si es otra dirección (opcional)',
  },

  'withdraw.purchase.legend': { en: 'Which purchase?', es: '¿De qué compra?' },
  'withdraw.purchase.description': {
    en: '{product}, {amount}, bought {date} (order ref. {ref})',
    es: '{product}, {amount}, comprado el {date} (ref. de pedido {ref})',
  },
  'withdraw.purchase.until': {
    en: 'You can withdraw until the end of {date}.',
    es: 'Puedes desistir hasta el final del {date}.',
  },
  'withdraw.purchase.already': {
    en: 'You withdrew from this on {date}.',
    es: 'Desististe de esta compra el {date}.',
  },
  'withdraw.purchase.other': { en: 'Another purchase, which I will describe', es: 'Otra compra, que describo yo' },
  'withdraw.purchase.none': {
    en: 'None of the purchases on this account is still inside its 14-day period. If you think one should be, describe it below and we will look into it.',
    es: 'Ninguna de las compras de esta cuenta sigue dentro de su plazo de 14 días. Si crees que alguna debería estarlo, descríbela abajo y lo revisaremos.',
  },
  'withdraw.purchase.otherLabel': {
    en: 'What you bought, and roughly when',
    es: 'Qué compraste y, más o menos, cuándo',
  },
  'withdraw.purchase.otherPlaceholder': {
    en: 'For example: Full plan, bought on 18 October',
    es: 'Por ejemplo: Plan Completo, comprado el 18 de octubre',
  },

  'withdraw.field.reference': { en: 'Reference', es: 'Referencia' },
  'withdraw.field.submittedAt': { en: 'Sent on', es: 'Enviado el' },
  'withdraw.field.name': { en: 'Your name', es: 'Tu nombre' },
  'withdraw.field.contract': { en: 'Purchase', es: 'Compra' },
  'withdraw.field.confirmationEmail': { en: 'Send the confirmation to', es: 'Enviar la confirmación a' },
  // The same field, as the receipt and the email name it afterwards.
  'withdraw.field.confirmationTo': { en: 'Confirmation email', es: 'Correo para la confirmación' },

  'withdraw.submitting': { en: 'Sending…', es: 'Enviando…' },
  'withdraw.error.generic': {
    en: 'We could not record your withdrawal. Please try again in a minute.',
    es: 'No hemos podido registrar tu desistimiento. Vuelve a intentarlo en un minuto.',
  },
  'withdraw.error.expired': {
    en: 'The 14-day period for that purchase is over. If you think that is wrong, choose “Another purchase” and tell us why.',
    es: 'El plazo de 14 días de esa compra ha terminado. Si crees que no es así, elige «Otra compra» y cuéntanos por qué.',
  },
  'withdraw.error.notFound': {
    en: 'We could not find that purchase on your account. Choose “Another purchase” and describe it instead.',
    es: 'No encontramos esa compra en tu cuenta. Elige «Otra compra» y descríbela.',
  },
  'withdraw.error.tooMany': {
    en: 'Too many attempts in a short time. Please wait a few minutes and try again.',
    es: 'Demasiados intentos en poco tiempo. Espera unos minutos y vuelve a intentarlo.',
  },
  'withdraw.error.form': {
    en: 'Please fill in your name, the purchase and a valid email address.',
    es: 'Rellena tu nombre, la compra y un correo válido.',
  },

  'withdraw.done.title': { en: 'We have received your withdrawal', es: 'Hemos recibido tu desistimiento' },
  'withdraw.done.already': {
    en: 'You had already withdrawn from this purchase, so nothing new was sent. This is the confirmation from the first time.',
    es: 'Ya habías desistido de esta compra, así que no se ha enviado nada nuevo. Esta es la confirmación de la primera vez.',
  },
  'withdraw.done.emailed': { en: 'A copy is on its way to {email}.', es: 'Te estamos enviando una copia a {email}.' },
  'withdraw.done.notEmailed': {
    en: 'We could not email you a copy just now, so please save or print this page. It is your record that you withdrew in time.',
    es: 'Ahora mismo no hemos podido enviarte una copia por correo, así que guarda o imprime esta página. Es tu prueba de que desististe a tiempo.',
  },
  'withdraw.done.next': {
    en: 'We will refund you within {days} days, back to the way you paid. When we do, we remove the attempts that came with this purchase.',
    es: 'Te haremos el reembolso en un plazo de {days} días, por el mismo medio con el que pagaste. Cuando lo hagamos, retiraremos los intentos que venían con esta compra.',
  },
  'withdraw.done.print': { en: 'Print or save this page', es: 'Imprimir o guardar esta página' },

  'withdraw.email.subject': {
    en: '{brand}: we have received your withdrawal ({reference})',
    es: '{brand}: hemos recibido tu desistimiento ({reference})',
  },
  'withdraw.email.opening': {
    en: 'We have received your withdrawal from the contract below. This email confirms what you sent us and when you sent it.',
    es: 'Hemos recibido tu desistimiento del contrato que aparece abajo. Este correo confirma lo que nos enviaste y cuándo lo enviaste.',
  },
  'withdraw.email.next': {
    en: 'We will refund you within {days} days, back to the way you paid. If you had already generated a report with this purchase, we refund the part you had not used, as our refund policy explains. When the refund is made, we remove the attempts that came with the purchase.',
    es: 'Te haremos el reembolso en un plazo de {days} días, por el mismo medio con el que pagaste. Si ya habías generado un informe con esta compra, te devolvemos la parte que no habías usado, como explica nuestra política de reembolsos. Cuando hagamos el reembolso, retiraremos los intentos que venían con la compra.',
  },
  'withdraw.email.keep': {
    en: 'Keep this email. It is your record that you withdrew in time.',
    es: 'Guarda este correo. Es tu prueba de que desististe a tiempo.',
  },

  'withdraw.product.basic': { en: 'Basic plan', es: 'Plan Básico' },
  'withdraw.product.full': { en: 'Full plan', es: 'Plan Completo' },
  'withdraw.product.followup_unlock': { en: 'Follow-up bundle', es: 'Paquete de seguimientos' },
  'withdraw.product.topup': { en: 'Top-up pack of 3 attempts', es: 'Paquete de 3 intentos extra' },
} satisfies Record<string, Entry>;
