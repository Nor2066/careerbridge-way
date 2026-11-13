// app/cookies/CookiePolicyEs.tsx
//
// The cookie policy in Spanish: a translation of the English page in
// page.tsx, which binds (Terms 13). The table is repeated here in Spanish, so
// a cookie added to one must be added to both.

import type { ReactNode } from 'react';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { CONTACT, LAST_UPDATED } from '@/lib/legal';
import { LOCALE_COOKIE } from '@/lib/i18n/config';
import { RECOVERY_COOKIE } from '@/lib/recovery-cookie';

type Row = { name: string; purpose: ReactNode; lifetime: string };

const COOKIES_ES: Row[] = [
  {
    name: 'sb-<project>-auth-token',
    purpose: (
      <>
        Mantiene tu sesión iniciada. Sin ella se cerraría tu sesión en cada página. A veces se
        divide en dos cookies terminadas en <code>.0</code> y <code>.1</code> cuando es demasiado
        grande para una sola.
      </>
    ),
    lifetime: 'Hasta que la sesión caduca o cierras sesión',
  },
  {
    name: 'sb-<project>-auth-token-code-verifier',
    purpose:
      'Un valor de un solo uso que nos permite completar de forma segura un inicio de sesión con Google. No sirve para nada por sí solo.',
    lifetime: '10 minutos',
  },
  {
    name: 'oauth_return_to',
    purpose: 'Recuerda a qué página devolverte después de iniciar sesión con Google.',
    lifetime: '10 minutos',
  },
  {
    name: 'oauth_terms_accepted',
    purpose:
      'Lleva, durante el paso por Google, el hecho de que marcaste la casilla de edad y condiciones, para que una cuenta nueva creada así registre tu aceptación.',
    lifetime: '10 minutos',
  },
  {
    name: RECOVERY_COOKIE,
    purpose:
      'Marca que una sesión viene de un enlace para restablecer la contraseña, para que la página donde se elige una nueva sepa que puede hacerlo.',
    lifetime: '15 minutos',
  },
];

export default function CookiePolicyEs() {
  return (
    <LegalPage
      locale="es"
      title="Política de cookies"
      lastUpdated={LAST_UPDATED.cookies}
      intro={
        <>
          <p>
            <strong className="text-white">
              Usamos cookies para mantener tu sesión iniciada y, si eliges un idioma, para
              recordarlo. Nada más.
            </strong>{' '}
            Ni cookies publicitarias, ni cookies de analítica, ni rastreadores de terceros, ni
            huella digital del navegador.
          </p>
          <p>
            Por eso no ves un aviso de cookies. La ley solo exige consentimiento para las cookies
            que no son estrictamente necesarias para algo que has pedido, y no ponemos ninguna;
            un aviso sería una casilla que no hace nada.
          </p>
        </>
      }
    >
      <LegalSection id="the-law" title="La norma que seguimos">
        <p>
          Guardar información en tu dispositivo, o leer la que ya hay, se rige en la Unión
          Europea por el artículo 5.3 de la Directiva sobre la privacidad y las comunicaciones
          electrónicas, tal como la ha incorporado cada país: en Hungría, donde estamos
          establecidos, el artículo 155.4 de la Ley C de 2003 de comunicaciones electrónicas; en
          España, el artículo 22.2 de la LSSI. Otros países tienen normas parecidas, como la PECR
          en el Reino Unido.
        </p>
        <p>
          Todas dicen lo mismo: debemos decirte qué guardamos y pedirte permiso,{' '}
          <strong className="text-white">salvo que</strong> sea estrictamente necesario para un
          servicio que has pedido de verdad. Mantener la sesión iniciada es el ejemplo de manual:
          pediste iniciar sesión, y no se puede hacer sin guardar algo. Recordar un idioma que tú
          mismo elegiste es otro: los reguladores europeos tratan una preferencia elegida por el
          usuario como parte del servicio que pidió.
        </p>
        <p>
          Todo lo que aparece en esta página entra en esa excepción. Te lo contamos de todos
          modos, porque tienes derecho a saber qué hay en tu dispositivo.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies que ponemos">
        <p>
          Todas son nuestras, en nuestro propio dominio. Todas salvo la del idioma son{' '}
          <code>HttpOnly</code>, así que los scripts que se ejecutan en tu navegador no pueden
          leerlas, y todas están marcadas como <code>Secure</code> en producción, para que solo
          viajen por una conexión cifrada.
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-4 font-medium">Cookie</th>
                <th className="py-2 pr-4 font-medium">Qué hace</th>
                <th className="py-2 font-medium">Cuánto dura</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES_ES.map((c) => (
                <tr key={c.name} className="border-b border-white/10 align-top">
                  <td className="py-3 pr-4 font-mono text-xs text-white">{c.name}</td>
                  <td className="py-3 pr-4 text-gray-300">{c.purpose}</td>
                  <td className="py-3 text-gray-400">{c.lifetime}</td>
                </tr>
              ))}
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-mono text-xs text-white">{LOCALE_COOKIE}</td>
                <td className="py-3 pr-4 text-gray-300">
                  Recuerda el idioma que elegiste con el selector EN / ES, para que el sitio no
                  vuelva a cambiar en tu próxima visita. Solo se pone si usas el selector; hasta
                  entonces seguimos el idioma configurado en tu navegador y no guardamos nada.
                  Contiene dos letras y nada sobre ti. Los scripts de nuestras propias páginas
                  pueden leerla, porque es el propio selector el que la pone.
                </td>
                <td className="py-3 text-gray-400">1 año, o hasta que la borres</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <code>&lt;project&gt;</code> es un identificador fijo de nuestro proyecto de
          autenticación. Los nombres exactos vienen de nuestro proveedor de autenticación y
          cambiarían si cambiáramos de proveedor; las finalidades no.
        </p>
      </LegalSection>

      <LegalSection id="other-storage" title="Otras cosas que guardamos en tu dispositivo">
        <p>
          Las cookies no son el único tipo de almacenamiento del navegador, y las mismas normas
          lo cubren todo. También usamos el{' '}
          <strong className="text-white">almacenamiento de sesión</strong>, que tu navegador
          borra en cuanto cierras la pestaña.
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <code>mainAnswers</code>: tus respuestas mientras pasas de una pregunta a otra, para
            que al recargar no pierdas tu progreso.
          </li>
          <li>
            <code>topClusters</code>: lleva tus áreas profesionales principales de la evaluación
            al cuestionario de seguimiento.
          </li>
          <li>
            <code>lastAssessmentId</code>: recuerda a qué evaluación pertenece el seguimiento,
            también después de ir a la página de pago.
          </li>
          <li>
            <code>checkoutReturnPath</code>: recuerda en qué página estabas antes de ir a pagar,
            para que vuelvas a ella después.
          </li>
        </ul>
        <p>
          No usamos <strong className="text-white">almacenamiento local</strong>, que es el que
          sobrevive después de cerrar la pestaña.
        </p>
      </LegalSection>

      <LegalSection id="analytics" title="Nuestra analítica no guarda nada">
        <p>
          Sí contamos cosas: cuántas personas empiezan el cuestionario, cuántas llegan a la
          página de pago, cuántas terminan. Saber dónde abandona la gente es como mejora el
          producto.
        </p>
        <p>
          <strong className="text-white">Nada de ello supone guardar algo en tu dispositivo.</strong>{' '}
          El identificador que agrupa una visita se genera en memoria al cargar la página y
          desaparece al cerrar la pestaña. Ni cookie, ni almacenamiento local, ni almacenamiento
          de sesión, así que las normas de arriba no entran en juego y no hay nada que tengas que
          consentir.
        </p>
        <p>
          Los eventos registran que un paso ocurrió. Nunca contienen el contenido de tus
          respuestas, y los valores que pueden llevar se limitan a una lista corta de valores
          aprobados de antemano, no a texto libre. No usamos ningún producto de analítica de
          terceros: nada de tu visita va a Google Analytics, a Meta ni a ninguna red
          publicitaria.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Terceros">
        <p>
          <strong className="text-white">Stripe, cuando pagas.</strong> Pagar te lleva a una
          página alojada por Stripe en su propio dominio. Stripe pone allí sus propias cookies
          (normalmente <code>__stripe_mid</code> y <code>__stripe_sid</code>), que usa para
          prevenir el fraude. Son de Stripe y se rigen por la{' '}
          <a
            className="text-indigo-300 underline"
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            política de privacidad de Stripe
          </a>
          . No las ponemos, no podemos leerlas y no recibimos nada de ellas.
        </p>
        <p>
          <strong className="text-white">Google, si inicias sesión con Google.</strong> Visitas
          la página de inicio de sesión de Google, y Google usa allí sus propias cookies con sus
          propias políticas. Si prefieres no implicar a Google, inicia sesión con una dirección de
          correo y una contraseña.
        </p>
        <p>
          <strong className="text-white">Nada incrustado.</strong> No incrustamos vídeos, mapas,
          widgets de redes sociales, sistemas de comentarios, chats ni publicidad. Esa es la vía
          habitual por la que llegan los rastreadores de terceros a un sitio web, y la hemos
          mantenido cerrada a propósito.
        </p>
      </LegalSection>

      <LegalSection id="controlling" title="Controlar las cookies tú mismo">
        <p>
          Puedes bloquear o borrar las cookies en la configuración de tu navegador. Las
          instrucciones están en las páginas de ayuda de cada navegador, y las autoridades de
          protección de datos publican orientaciones para el público: la NAIH en Hungría, en{' '}
          <a
            className="text-indigo-300 underline"
            href="https://naih.hu"
            target="_blank"
            rel="noopener noreferrer"
          >
            naih.hu
          </a>
          , y la AEPD en España, en{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
          >
            aepd.es
          </a>
          .
        </p>
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">Conviene saberlo antes.</strong> Como las cookies
            que ponemos son las que mantienen tu sesión iniciada, bloquearlas te impedirá iniciar
            sesión: volverás a la página de inicio de sesión cada vez. No es un fallo, ni una
            forma de presionarte para que aceptes un seguimiento, porque no hay ninguno que
            aceptar. Borrar la cookie del idioma solo hace que el sitio vuelva a seguir el idioma
            de tu navegador. Bloquear el almacenamiento de sesión hará que pierdas tus respuestas
            al recargar.
          </p>
        </div>
        <p>
          Algunos navegadores y herramientas de privacidad bloquean con mucha agresividad las
          cookies de terceros. Eso no afecta a nuestras cookies, pero puede interferir con la
          vuelta desde el inicio de sesión de Google o desde Stripe. Si el inicio de sesión falla
          una vez y luego funciona, suele ser por eso.
        </p>
        <p>
          Las señales &laquo;Do Not Track&raquo; y Global Privacy Control no cambian nada aquí,
          porque para empezar no te estamos rastreando.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Si esto cambia">
        <p>
          Si alguna vez añadimos algo que guarde información en tu dispositivo, actualizaremos
          esta página antes de que entre en funcionamiento. Si lo nuevo no es estrictamente
          necesario,{' '}
          <strong className="text-white">te pediremos permiso antes</strong>, con una elección
          real y un verdadero &laquo;rechazar todo&raquo;.
        </p>
        <p>
          Preguntas sobre cualquier cosa de esta página:{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
