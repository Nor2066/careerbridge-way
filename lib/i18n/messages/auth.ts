// Sign in, sign up, and the password and confirmation helpers.
import type { Entry } from './types';

export const auth = {
  'auth.email': { en: 'Email', es: 'Correo electrónico' },
  'auth.emailAddress': { en: 'Email address', es: 'Correo electrónico' },
  'auth.emailPlaceholder': { en: 'you@example.com', es: 'tu@ejemplo.com' },
  'auth.password': { en: 'Password', es: 'Contraseña' },
  'auth.or': { en: 'Or', es: 'O' },
  'auth.sending': { en: 'Sending…', es: 'Enviando…' },
  'auth.saving': { en: 'Saving…', es: 'Guardando…' },
  'auth.backToSignIn': { en: 'Back to sign in', es: 'Volver a iniciar sesión' },
  'auth.networkCheck': { en: 'Network error. Please check your connection and try again.', es: 'Error de conexión. Comprueba tu conexión e inténtalo de nuevo.' },
  'auth.university.hint': {
    en: 'Studying at a partner university? Use your university email address and your access is free.',
    es: '¿Estudias en una universidad asociada? Usa el correo de tu universidad y tendrás acceso gratis.',
  },

  // Login
  'auth.login.title': { en: 'Welcome Back', es: 'Hola de nuevo' },
  'auth.login.noConfirmation': { en: 'Never got your confirmation email?', es: '¿No te llegó el correo de confirmación?' },
  'auth.login.forgot': { en: 'Forgot your password?', es: '¿Has olvidado tu contraseña?' },
  'auth.login.submit': { en: 'Login with Password', es: 'Entrar con contraseña' },
  'auth.login.magic': { en: 'Send Magic Link', es: 'Enviar enlace de acceso' },
  'auth.login.magicSent': { en: 'Check your email for the login link!', es: '¡Revisa tu correo: te hemos enviado el enlace de acceso!' },
  'auth.login.magicFailed': { en: 'Failed to send magic link', es: 'No se ha podido enviar el enlace de acceso' },
  'auth.login.enterEmail': { en: 'Please enter your email address', es: 'Introduce tu correo electrónico' },
  'auth.login.google': { en: 'Sign in with Google', es: 'Entrar con Google' },
  'auth.login.googleRedirecting': { en: 'Redirecting to Google...', es: 'Redirigiendo a Google...' },
  'auth.login.googleFailed': { en: 'Google sign-in failed. Please try again.', es: 'No se ha podido entrar con Google. Inténtalo de nuevo.' },
  'auth.login.googleNotice': {
    en: "If you don't have an account yet, continuing with Google creates one. By doing so you confirm you are {age} or over and accept the ",
    es: 'Si aún no tienes cuenta, continuar con Google crea una. Al hacerlo confirmas que tienes {age} años o más y aceptas los ',
  },
  'auth.login.terms': { en: 'Terms of Service', es: 'Términos del servicio' },
  'auth.login.noAccount': { en: "Don't have an account?", es: '¿No tienes cuenta?' },
  'auth.login.signUp': { en: 'Sign up', es: 'Regístrate' },
  'auth.login.invalid': { en: 'Invalid email or password', es: 'Correo o contraseña incorrectos' },
  'auth.login.failed': { en: 'Sign-in failed. Please try again.', es: 'No se ha podido iniciar sesión. Inténtalo de nuevo.' },

  // OAuth callback errors
  'auth.oauth.init': { en: 'Could not start Google sign-in. Please try again.', es: 'No se ha podido iniciar el acceso con Google. Inténtalo de nuevo.' },
  'auth.oauth.provider': { en: 'Google could not complete the sign-in. Please try again.', es: 'Google no ha podido completar el acceso. Inténtalo de nuevo.' },
  'auth.oauth.incomplete': { en: 'Google sign-in did not complete. Please try again.', es: 'El acceso con Google no se ha completado. Inténtalo de nuevo.' },
  'auth.oauth.cookie': {
    en: 'Your browser blocked a cookie needed to finish signing in. Turn off tracker/cookie blocking for this site, or try a normal (non-private) window.',
    es: 'Tu navegador ha bloqueado una cookie necesaria para terminar de entrar. Desactiva el bloqueo de rastreadores o cookies para este sitio, o prueba en una ventana normal (no privada).',
  },
  'auth.oauth.exchange': { en: 'Google sign-in could not be verified. Please try again.', es: 'No se ha podido verificar el acceso con Google. Inténtalo de nuevo.' },
  'auth.oauth.session': {
    en: 'Signed in with Google, but the session could not be saved. Please try again.',
    es: 'Has entrado con Google, pero no se ha podido guardar la sesión. Inténtalo de nuevo.',
  },

  // Signup
  'auth.signup.title': { en: 'Sign Up', es: 'Crear cuenta' },
  'auth.signup.submit': { en: 'Sign Up', es: 'Crear cuenta' },
  'auth.signup.acceptFirst': { en: 'Please confirm you are {age} or over and accept the terms.', es: 'Confirma que tienes {age} años o más y acepta los términos.' },
  'auth.signup.failed': { en: 'Signup failed. Please try again.', es: 'No se ha podido crear la cuenta. Inténtalo de nuevo.' },
  'auth.signup.googleFailed': { en: 'Google sign-up failed. Please try again.', es: 'No se ha podido crear la cuenta con Google. Inténtalo de nuevo.' },
  'auth.signup.google': { en: 'Sign up with Google', es: 'Crear cuenta con Google' },
  'auth.signup.ageTerms.before': { en: 'I am {age} or over, and I agree to the ', es: 'Tengo {age} años o más y acepto los ' },
  'auth.signup.ageTerms.and': { en: ' and the ', es: ' y la ' },
  'auth.signup.terms': { en: 'Terms of Service', es: 'Términos del servicio' },
  'auth.signup.aup': { en: 'Acceptable Use Policy', es: 'Política de uso aceptable' },
  'auth.signup.ai.before': { en: 'Your report is written by AI and can be wrong — see the ', es: 'Tu informe lo escribe una IA y puede equivocarse: consulta el ' },
  'auth.signup.ai.notice': { en: 'AI Notice', es: 'Aviso sobre IA' },
  'auth.signup.ai.middle': { en: '. What we do with your data is in the ', es: '. Lo que hacemos con tus datos está en la ' },
  'auth.signup.privacy': { en: 'Privacy Policy', es: 'Política de privacidad' },
  'auth.signup.haveAccount': { en: 'Already have an account?', es: '¿Ya tienes cuenta?' },
  'auth.signup.login': { en: 'Login', es: 'Inicia sesión' },
  'auth.signup.checkEmail': { en: 'Check your email', es: 'Revisa tu correo' },
  'auth.signup.sentTo.before': { en: 'We sent a confirmation link to ', es: 'Hemos enviado un enlace de confirmación a ' },
  'auth.signup.sentTo.after': {
    en: '. Click it and you will be signed in. You cannot sign in until you do.',
    es: '. Pulsa en él y entrarás. No podrás iniciar sesión hasta hacerlo.',
  },
  'auth.signup.spam': {
    en: 'It can take a minute to arrive, and it often lands in spam. If it never turns up, send it again below.',
    es: 'Puede tardar un minuto en llegar y a menudo acaba en spam. Si no llega, vuelve a enviarlo abajo.',
  },
  'auth.signup.resend': { en: 'Send the email again', es: 'Volver a enviar el correo' },
  'auth.signup.wrongAddress': { en: 'Typed the wrong address?', es: '¿Has escrito mal la dirección?' },
  'auth.signup.startAgain': { en: 'Start again', es: 'Empezar de nuevo' },

  // Forgot password
  'auth.forgot.title': { en: 'Reset your password', es: 'Restablece tu contraseña' },
  'auth.forgot.sent.before': { en: 'If there is an account for ', es: 'Si existe una cuenta para ' },
  'auth.forgot.sent.after': { en: ', a reset link is on its way. It expires in one hour.', es: ', te estamos enviando un enlace para restablecerla. Caduca en una hora.' },
  'auth.forgot.nothing': {
    en: 'Nothing arriving? Check your spam folder, and make sure you typed the address you signed up with.',
    es: '¿No llega nada? Revisa la carpeta de spam y asegúrate de haber escrito el correo con el que te registraste.',
  },
  'auth.forgot.intro': {
    en: 'Enter the address you signed up with and we will send you a link to choose a new one.',
    es: 'Escribe el correo con el que te registraste y te enviaremos un enlace para elegir una nueva.',
  },
  'auth.forgot.submit': { en: 'Send reset link', es: 'Enviar enlace' },
  'auth.forgot.remembered': { en: 'I remembered it — back to sign in', es: 'Ya me acuerdo: volver a iniciar sesión' },
  'auth.forgot.google': {
    en: 'Signed up with Google? You do not have a password here — use the Google button on the sign-in page.',
    es: '¿Te registraste con Google? No tienes contraseña aquí: usa el botón de Google en la página de acceso.',
  },

  // Reset password
  'auth.reset.title': { en: 'Choose a new password', es: 'Elige una contraseña nueva' },
  'auth.reset.done': {
    en: 'Your password has been updated, and anyone else signed in to your account has been signed out. Taking you back to the site…',
    es: 'Tu contraseña se ha actualizado y se ha cerrado la sesión de cualquier otra persona en tu cuenta. Te llevamos de vuelta al sitio…',
  },
  'auth.reset.new': { en: 'New password', es: 'Contraseña nueva' },
  'auth.reset.again': { en: 'Type it again', es: 'Repítela' },
  'auth.reset.toGo': { en: '{count} more character(s) to go.', es: 'Faltan {count} carácter(es).' },
  'auth.reset.mismatchLive': { en: 'These do not match yet.', es: 'Todavía no coinciden.' },
  'auth.reset.mismatch': { en: 'The two passwords do not match.', es: 'Las dos contraseñas no coinciden.' },
  'auth.reset.expired': {
    en: 'This reset link has expired. Please request a new one — they are valid for one hour.',
    es: 'Este enlace ha caducado. Pide uno nuevo: son válidos durante una hora.',
  },
  'auth.reset.failed': { en: 'We could not update your password. Please try again.', es: 'No hemos podido actualizar tu contraseña. Inténtalo de nuevo.' },
  'auth.reset.submit': { en: 'Set new password', es: 'Guardar contraseña nueva' },
  'auth.reset.newLink': { en: 'Need a new link?', es: '¿Necesitas un enlace nuevo?' },
  'auth.passwordHint': {
    en: 'At least {min} characters. A few unrelated words are easier to remember and harder to guess than a short password with symbols in it.',
    es: 'Al menos {min} caracteres. Unas cuantas palabras sin relación entre sí son más fáciles de recordar y más difíciles de adivinar que una contraseña corta con símbolos.',
  },

  // Resend confirmation
  'auth.resend.title': { en: 'Resend your confirmation email', es: 'Reenviar el correo de confirmación' },
  'auth.resend.intro': {
    en: 'If you signed up but never confirmed your address, you will not be able to sign in yet. Enter your email and we will send the link again.',
    es: 'Si te registraste pero no confirmaste tu correo, todavía no puedes iniciar sesión. Escribe tu correo y te volveremos a enviar el enlace.',
  },
  'auth.resend.submit': { en: 'Send the link again', es: 'Volver a enviar el enlace' },
  'auth.resend.forgot': { en: 'Forgot your password instead?', es: '¿Lo que has olvidado es la contraseña?' },
  'auth.resend.sent': {
    en: 'If that address has an unconfirmed account, a new confirmation link is on its way.',
    es: 'Si ese correo tiene una cuenta sin confirmar, te estamos enviando un nuevo enlace de confirmación.',
  },

  // Callback
  'auth.callback.signingIn': { en: 'Signing you in...', es: 'Iniciando sesión...' },
  'auth.callback.invalid': { en: 'This sign-in link is invalid or has expired. Please try again.', es: 'Este enlace de acceso no es válido o ha caducado. Inténtalo de nuevo.' },
  'auth.callback.failed': { en: 'Something went wrong signing you in. Please try again.', es: 'Algo ha fallado al iniciar sesión. Inténtalo de nuevo.' },
} satisfies Record<string, Entry>;
