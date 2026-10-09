// The account page.
import type { Entry } from './types';

export const account = {
  'account.title': { en: 'Your account', es: 'Tu cuenta' },
  'account.signedInAs': { en: 'Signed in as ', es: 'Has iniciado sesión como ' },
  'account.networkCheck': { en: 'Network error. Please check your connection and try again.', es: 'Error de conexión. Comprueba tu conexión e inténtalo de nuevo.' },

  'account.confirm.title': { en: 'Confirm your email address', es: 'Confirma tu correo electrónico' },
  'account.confirm.body.before': { en: 'We sent a link to ', es: 'Te enviamos un enlace a ' },
  'account.confirm.body.after': {
    en: ' when you signed up. Until you click it you can take the assessment, but you cannot buy anything or generate a report — we will not charge an address we cannot reach.',
    es: ' cuando te registraste. Hasta que lo pulses puedes hacer la evaluación, pero no comprar nada ni generar un informe: no cobramos a una dirección a la que no podemos llegar.',
  },
  'account.confirm.resend': { en: 'Send the link again', es: 'Volver a enviar el enlace' },
  'account.confirm.sent': {
    en: 'A new confirmation link is on its way.',
    es: 'Te estamos enviando un nuevo enlace de confirmación.',
  },

  'account.university.title': { en: 'Access through your university', es: 'Acceso a través de tu universidad' },
  'account.university.body': {
    en: '{university} provides your access. They see only anonymous totals for all their students together — never your answers, your reports or your name.',
    es: '{university} te da el acceso. Solo ven totales anónimos de todos sus estudiantes juntos: nunca tus respuestas, tus informes ni tu nombre.',
  },
  'account.university.attempts': { en: '{count} of {total} university attempt(s) left.', es: 'Te quedan {count} de {total} intento(s) de la universidad.' },
  'account.university.ended': { en: 'This access has ended or is used up.', es: 'Este acceso ha terminado o se ha agotado.' },

  'account.password.title': { en: 'Change your password', es: 'Cambia tu contraseña' },
  'account.password.signsOut': {
    en: 'Changing it signs out anyone else who is logged into your account.',
    es: 'Al cambiarla se cierra la sesión de cualquier otra persona que haya entrado en tu cuenta.',
  },
  'account.password.current': { en: 'Current password', es: 'Contraseña actual' },
  'account.password.new': { en: 'New password', es: 'Contraseña nueva' },
  'account.password.again': { en: 'Type the new password again', es: 'Repite la contraseña nueva' },
  'account.password.mismatch': { en: 'These do not match yet.', es: 'Todavía no coinciden.' },
  'account.password.done': {
    en: 'Your password has been updated, and other sessions were signed out.',
    es: 'Tu contraseña se ha actualizado y se han cerrado las demás sesiones.',
  },
  'account.password.failed': { en: 'We could not change your password. Please try again.', es: 'No hemos podido cambiar tu contraseña. Inténtalo de nuevo.' },
  'account.password.submit': { en: 'Change password', es: 'Cambiar contraseña' },
  'account.password.google': {
    en: 'Signed in with Google? You do not have a password here, so there is nothing to change.',
    es: '¿Entraste con Google? No tienes contraseña aquí, así que no hay nada que cambiar.',
  },

  'account.export.title': { en: 'Download your data', es: 'Descarga tus datos' },
  'account.export.body': {
    en: 'A JSON file containing your account details, every assessment you have taken, every report we generated, and your purchase history. This is your right under data protection law (GDPR) — you do not have to give a reason and we do not ask for one.',
    es: 'Un archivo JSON con los datos de tu cuenta, todas las evaluaciones que has hecho, todos los informes que generamos y tu historial de compras. Es tu derecho según la ley de protección de datos (RGPD): no tienes que dar ningún motivo y no te lo pediremos.',
  },
  'account.export.preparing': { en: 'Preparing your file…', es: 'Preparando tu archivo…' },
  'account.export.submit': { en: 'Download my data', es: 'Descargar mis datos' },
  'account.export.failed': { en: 'We could not build your export. Please try again.', es: 'No hemos podido preparar tu exportación. Inténtalo de nuevo.' },

  'account.delete.title': { en: 'Delete your account', es: 'Elimina tu cuenta' },
  'account.delete.body': {
    en: 'This removes your profile, every assessment answer, every report, and your saved progress. It happens immediately and it cannot be undone.',
    es: 'Esto borra tu perfil, todas tus respuestas, todos tus informes y tu progreso guardado. Ocurre al momento y no se puede deshacer.',
  },
  'account.delete.records': {
    en: 'We keep a record of your purchases with your name and email removed, because tax law requires us to keep sales records for six years.',
    es: 'Conservamos un registro de tus compras sin tu nombre ni tu correo, porque la normativa fiscal nos obliga a guardar los registros de ventas durante seis años.',
  },
  'account.delete.refund.before': {
    en: 'Any attempts you have paid for and not used will be lost. If you want a refund for them, ask us ',
    es: 'Perderás los intentos que hayas pagado y no hayas usado. Si quieres que te los reembolsemos, pídenoslo ',
  },
  'account.delete.refund.link': { en: 'first', es: 'antes' },
  'account.delete.open': { en: 'Delete my account', es: 'Eliminar mi cuenta' },
  'account.delete.type.before': { en: 'Type ', es: 'Escribe ' },
  'account.delete.type.after': { en: ' to confirm.', es: ' para confirmar.' },
  'account.delete.placeholder': { en: 'your email address', es: 'tu correo electrónico' },
  'account.delete.deleting': { en: 'Deleting…', es: 'Eliminando…' },
  'account.delete.confirm': { en: 'Permanently delete my account', es: 'Eliminar mi cuenta para siempre' },
  'account.delete.failed': { en: 'We could not delete your account. Please try again.', es: 'No hemos podido eliminar tu cuenta. Inténtalo de nuevo.' },

  'account.questions.before': { en: 'Questions about your data? Read the ', es: '¿Dudas sobre tus datos? Lee la ' },
  'account.questions.privacy': { en: 'Privacy Policy', es: 'Política de privacidad' },
  'account.questions.after': { en: ' or email us — the address is in the footer.', es: ' o escríbenos: la dirección está en el pie de página.' },
  'account.back': { en: '← Back to your history', es: '← Volver a tu historial' },
} satisfies Record<string, Entry>;
