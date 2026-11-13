// app/acceptable-use/AcceptableUseEs.tsx
//
// The acceptable use policy in Spanish: a translation of the English page in
// page.tsx, which binds (Terms 13). Change both together.

import LegalPage, { LegalSection } from '@/components/LegalPage';
import { CONTACT, LAST_UPDATED } from '@/lib/legal';

export default function AcceptableUseEs() {
  return (
    <LegalPage
      locale="es"
      title="Política de uso aceptable"
      lastUpdated={LAST_UPDATED.acceptableUse}
      intro={
        <>
          <p>
            Usa el servicio como una persona que busca ideas sobre su carrera y nada de esto te
            afectará nunca.
          </p>
          <p>
            Existe para las pocas personas que intentan atacar el servicio, extraer datos de él,
            automatizar contra él o hacer pasar por él datos personales de otras personas. Forma
            parte de nuestras{' '}
            <a className="text-indigo-300 underline" href="/terms">
              Términos del servicio
            </a>
            , así que incumplirla es un incumplimiento del contrato.
          </p>
        </>
      }
    >
      <LegalSection id="who" title="A quién se aplica">
        <p>
          A todas las personas que usan el servicio, hayan pagado o no y tengan cuenta o no.
          También cubre lo que otra persona haga a través de tu cuenta, y por eso no debes
          compartir tus datos de acceso.
        </p>
      </LegalSection>

      <LegalSection id="content" title="Lo que no debes enviar">
        <p>No pongas nada de esto en una respuesta, en un correo al soporte ni en ningún otro sitio:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              Información personal de otra persona identificable.
            </strong>{' '}
            Escribe sobre ti. Si necesitas mencionar a alguien, omite su nombre completo y
            cualquier otra cosa que lo identifique.
          </li>
          <li>
            Contenido <strong className="text-white">ilícito</strong>: que infrinja derechos de
            autor, viole una obligación de confidencialidad, sea difamatorio o cuya posesión o
            difusión sea delito.
          </li>
          <li>
            Contenido que <strong className="text-white">acose o amenace</strong> a cualquier
            persona, o que incite al odio o a la violencia contra una persona o un grupo.
          </li>
          <li>
            Contenido sexual y, en particular, cualquier contenido sexual que implique a un menor.
            Ese tipo de contenido se denunciará a las autoridades.
          </li>
          <li>Material que identifique a un menor, o que le pida información.</li>
          <li>
            Programas maliciosos, scripts o datos deliberadamente malformados con la intención de
            romper el servicio.
          </li>
          <li>
            Información deliberadamente falsa enviada para conseguir un reembolso, un intento
            gratuito o el acceso a la cuenta de otra persona.
          </li>
        </ul>
        <p>
          Si puedes, evita también poner{' '}
          <strong className="text-white">información sensible sobre ti</strong> en una respuesta
          de texto libre. No necesitas revelar un problema de salud, una discapacidad, tu
          religión, tu origen étnico o tu sexualidad para obtener un informe útil. Es una petición
          en tu beneficio, no una prohibición; nuestra{' '}
          <a className="text-indigo-300 underline" href="/privacy#sensitive">
            Política de privacidad
          </a>{' '}
          explica qué ocurre si lo haces.
        </p>
      </LegalSection>

      <LegalSection id="conduct" title="Lo que no debes hacer">
        <p className="font-medium text-white">Contra el servicio</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Intentar acceder sin autorización al servicio, a cualquier cuenta que no sea la tuya o
            a cualquier sistema conectado con ellos.
          </li>
          <li>Atacarlo: denegación de servicio, saturación o cualquier cosa que pretenda afectar a su disponibilidad.</li>
          <li>
            Eludir los límites de solicitudes, la autenticación, el pago o el límite de intentos
            que tiene tu cuenta.
          </li>
          <li>
            Sondear, escanear o poner a prueba la seguridad del servicio sin nuestro permiso
            previo por escrito. Normalmente lo daremos; consulta más abajo.
          </li>
        </ul>

        <p className="mt-2 font-medium text-white">Automatización y extracción</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Usar bots, scrapers, rastreadores o scripts para completar cuestionarios, generar
            informes o recopilar contenido.
          </li>
          <li>Crear varias cuentas para conseguir más uso gratuito del que corresponde a una persona.</li>
          <li>
            Intentar reconstruir el modelo de puntuación enviando grandes cantidades de respuestas
            variadas sistemáticamente.
          </li>
          <li>
            Aplicar ingeniería inversa, descompilar o desensamblar cualquier parte del servicio,
            salvo en la medida limitada en que la ley lo permita pese a esta cláusula.
          </li>
          <li>Usar el servicio, o cualquier cosa que produzca, para entrenar un modelo de aprendizaje automático.</li>
        </ul>

        <p className="mt-2 font-medium text-white">Mal uso de la IA</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Intentar que la IA produzca contenido ajeno a la orientación profesional. El cuadro de
            texto libre no es un chatbot de uso general.
          </li>
          <li>
            Intentar una <strong className="text-white">inyección de instrucciones</strong>{' '}
            (prompt injection): instrucciones escritas en una respuesta y dirigidas al modelo, no
            a nosotros, para cambiar su comportamiento, revelar sus instrucciones o saltarse sus
            límites.
          </li>
          <li>Intentar extraer nuestras instrucciones, nuestras indicaciones de sistema o la lógica de puntuación.</li>
        </ul>

        <p className="mt-2 font-medium text-white">Uso comercial indebido</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Revender, sublicenciar o redistribuir informes, o gestionar un servicio que los genere para otras personas.</li>
          <li>
            Presentar un informe como un producto tuyo, como asesoramiento profesional escrito por
            una persona o como el resultado de un servicio de orientación regulado.
          </li>
          <li>Vender, alquilar o transferir tu cuenta o los intentos que tiene.</li>
        </ul>

        <p className="mt-2 font-medium text-white">Acceso universitario</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Usar una dirección de correo a la que no tienes derecho (la de otra persona, o una
            conseguida solo para esto) para obtener el acceso gratuito de una universidad.
          </li>
          <li>Dejar que otras personas usen tu cuenta para que aprovechen los intentos de tu universidad.</li>
        </ul>

        <p className="mt-2 font-medium text-white">Si tienes un panel universitario</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Intentar averiguar qué estudiante hay detrás de una cifra, también combinando los
            totales con otra información que tengas.
          </li>
          <li>
            Exigir a un estudiante, o presionarlo, para que te muestre su informe, sus respuestas o
            sus puntuaciones.
          </li>
          <li>Compartir el panel, o tu acceso a él, con alguien que tu universidad no nos haya designado.</li>
        </ul>

        <div className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">
              No uses esto para tomar una decisión sobre otra persona
            </strong>
            : contratación, admisiones, ascensos ni ninguna otra cosa. Es una herramienta de ayuda
            para la persona que responde a las preguntas. No está diseñada ni validada para
            evaluar a nadie y, usado como instrumento de selección, un cuestionario no validado con
            una IA puede causar un daño real y exponerte a responsabilidad por discriminación. Lo
            mismo se aplica a las universidades, los centros educativos y su personal, y nuestros
            contratos con ellos lo dicen: ninguna decisión de admisión, calificación, disciplina o
            selección puede basarse en esto. Es la norma que más nos importa.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="rate-limits" title="Límites de solicitudes">
        <p>
          El inicio de sesión, el registro, el restablecimiento de contraseña, el pago y la
          generación de informes tienen límites de solicitudes. Esto protege el servicio y a todas
          las demás personas que lo usan.
        </p>
        <p>
          Llegar a un límite con un uso normal{' '}
          <strong className="text-white">no es un incumplimiento ni motivo de preocupación</strong>
          : espera un momento y vuelve a intentarlo. Eludir uno a propósito sí es un
          incumplimiento. Si un uso legítimo tuyo choca una y otra vez con un límite, dínoslo y lo
          revisaremos.
        </p>
      </LegalSection>

      <LegalSection id="reporting" title="Comunicar un problema">
        <p>
          Si ves algo que incumple esta política, escribe a{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          con detalles suficientes para que podamos encontrarlo.
        </p>
        <p>
          <strong className="text-white">
            Si un informe que recibiste contiene algo dañino, ofensivo o gravemente erróneo, por
            favor, dínoslo.
          </strong>{' '}
          Queremos saberlo. No leemos tus respuestas ni tus informes de forma rutinaria, así que
          un fallo del que no nos avisan es un fallo que no podemos arreglar. Miramos un contenido
          concreto cuando nos lo pides, cuando investigamos una denuncia de abuso o cuando la ley
          lo exige.
        </p>
      </LegalSection>

      <LegalSection id="consequences" title="Qué hacemos ante un incumplimiento">
        <p>Según lo que haya ocurrido, podemos:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>enviar un aviso, ante un primer incumplimiento menor o probablemente accidental;</li>
          <li>retirar o rechazar un contenido concreto, cuando el problema es un envío;</li>
          <li>suspender la cuenta temporalmente, ante un incumplimiento reiterado o mientras investigamos;</li>
          <li>cerrar la cuenta definitivamente, ante un incumplimiento grave o reiterado después de un aviso;</li>
          <li>bloquear el acceso a nivel de red, ante ataques y abusos automatizados;</li>
          <li>denunciar el asunto a la policía o a otra autoridad, cuando la conducta parezca delictiva;</li>
          <li>emprender acciones legales, cuando hayamos sufrido un perjuicio.</li>
        </ul>
        <p>
          Cuando sea razonable y lícito,{' '}
          <strong className="text-white">
            te diremos qué hiciste y te daremos la oportunidad de corregirlo o explicarlo
          </strong>
          . Cuando el incumplimiento es grave (un ataque o un contenido ilegal), podemos actuar de
          inmediato y explicarlo después.
        </p>
        <p>
          <strong className="text-white">
            Reembolsos si cerramos una cuenta por un incumplimiento.
          </strong>{' '}
          No reembolsamos los intentos que ya has usado. Los intentos sin usar sí los
          reembolsaremos, salvo que hayamos sufrido un perjuicio por tu incumplimiento, en cuyo
          caso podemos quedarnos con una cantidad que refleje ese perjuicio, y te explicaremos la
          cifra.
        </p>
        <p>
          Si crees que nos hemos equivocado, responde y dínoslo. Otra persona lo revisará, y
          restableceremos la cuenta si cometimos un error.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Investigadores de seguridad">
        <p>
          Si has encontrado una vulnerabilidad de seguridad,{' '}
          <strong className="text-white">preferimos con mucho que nos lo cuentes.</strong>{' '}
          Escribe a{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          con los detalles, y danos un plazo razonable para arreglarla antes de contárselo a
          nadie más.
        </p>
        <p>
          Si actúas de buena fe, te limitas a lo necesario para demostrar el problema, no accedes
          a los datos de nadie ni los modificas y no perjudicas el servicio para otras personas,{' '}
          <strong className="text-white">
            no trataremos tus pruebas como un incumplimiento de esta política ni emprenderemos
            acciones contra ti por ellas.
          </strong>
        </p>
        <p>
          Eso no incluye las pruebas de denegación de servicio, la ingeniería social sobre nuestro
          personal o nuestros proveedores, los ataques físicos ni el acceso a datos reales de
          clientes.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Cambios">
        <p>
          Podemos actualizar esta política. La versión que se aplica es la publicada cuando usas
          el servicio, y la fecha de arriba indica cuándo cambió por última vez. Si añadimos una
          restricción nueva e importante, escribiremos a los titulares de cuentas para avisarles.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
