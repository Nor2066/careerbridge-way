// app/terms/TermsEs.tsx
//
// The terms of service in Spanish: a translation of the English page in
// page.tsx, which binds (section 13). Change both together.

import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONTACT, HOSTING, LAST_UPDATED, MINIMUM_AGE } from '@/lib/legal';
import { JURISDICTION_ES, registrationDetailsEs } from '@/lib/legal-es';
import { BRAND } from '@/lib/site';

export default function TermsEs() {
  const details = registrationDetailsEs();
  const hostingAddress = HOSTING.address.replace('United States', 'Estados Unidos');

  return (
    <LegalPage
      locale="es"
      title="Términos del servicio"
      lastUpdated={LAST_UPDATED.terms}
      intro={
        <>
          <p>
            Estas condiciones son el acuerdo entre tú y {COMPANY.legalName} cuando usas{' '}
            {COMPANY.tradingName}. Al crear una cuenta las aceptas. Se aplican igual tanto si
            pagas tú el acceso como si te lo da tu universidad.
          </p>
          <p>
            Las dos secciones que merece la pena leer con atención son{' '}
            <a className="text-indigo-300 underline" href="#what-this-is-not">
              lo que este servicio no es
            </a>{' '}
            y{' '}
            <a className="text-indigo-300 underline" href="#liability">
              nuestra responsabilidad
            </a>
            . Si tu acceso viene de una universidad, lee también la{' '}
            <a className="text-indigo-300 underline" href="#university-access">
              sección 4
            </a>
            . El resto es lo que cabría esperar.
          </p>
          <p>
            Otros cinco documentos forman parte de este acuerdo y quedan incorporados a él: la{' '}
            <a className="text-indigo-300 underline" href="/privacy">
              Política de privacidad
            </a>
            , la{' '}
            <a className="text-indigo-300 underline" href="/cookies">
              Política de cookies
            </a>
            , la{' '}
            <a className="text-indigo-300 underline" href="/refunds">
              Política de reembolsos y desistimiento
            </a>
            , la{' '}
            <a className="text-indigo-300 underline" href="/acceptable-use">
              Política de uso aceptable
            </a>{' '}
            y el{' '}
            <a className="text-indigo-300 underline" href="/ai-notice">
              Aviso de transparencia sobre la IA
            </a>
            . Si se contradicen, prevalecen estas condiciones, salvo que la Política de
            privacidad rige todo lo relativo a datos personales y la Política de reembolsos todo lo
            relativo a reembolsos.
          </p>
        </>
      }
    >
      <LegalSection id="who-we-are" title="1. Con quién contratas">
        <p>
          {COMPANY.tradingName} es un nombre comercial de {COMPANY.legalName}, sociedad de
          responsabilidad limitada establecida en {JURISDICTION_ES}.
          {details ? ` ${details}` : ''} Puedes contactarnos en{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>
          {CONTACT.phone ? ` o por teléfono en el ${CONTACT.phone}` : ''}.
        </p>
        <p>
          El sitio web está alojado por {HOSTING.name}, {hostingAddress}, {HOSTING.email}.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Quién puede usarlo">
        <p>
          Debes tener al menos {MINIMUM_AGE} años para crear una cuenta, vivas donde vivas. Te
          pedimos que lo confirmes al registrarte, y marcar esa casilla es también la forma de
          aceptar estas condiciones. Si sabemos que una cuenta pertenece a alguien menor de{' '}
          {MINIMUM_AGE} años, la cerraremos y borraremos los datos vinculados a ella.
        </p>
        <p>
          Si tienes menos de 18 años, deberías repasar tus resultados con tu madre, tu padre, tu
          tutor, un profesor o un orientador, en lugar de basarte solo en ellos. Nada de esto
          está pensado para sustituir a un adulto que te conoce.
        </p>
        <p>
          Si tienes menos de 18 años, pregunta a tu madre, a tu padre o a tu tutor antes de
          comprar nada: la ley del lugar donde vives puede exigir su conformidad. Si uno de ellos
          nos dice que no estaba de acuerdo con una compra, la cancelaremos y la reembolsaremos
          íntegramente.
        </p>
        <p>
          Puedes tener una sola cuenta. Eres responsable de lo que ocurra en ella, así que no
          compartas tus datos de acceso y avísanos enseguida si crees que otra persona ha entrado
          en ella.
        </p>
      </LegalSection>

      <LegalSection id="what-we-provide" title="3. Qué ofrecemos">
        <p>
          Un cuestionario, un modelo de puntuación que agrupa tus respuestas en áreas
          profesionales, y un informe escrito generado por IA a partir de esas respuestas. Algunos
          intentos incluyen también un cuestionario de seguimiento que genera una hoja de ruta más
          detallada. El sitio y tus informes están disponibles en inglés y en español.
        </p>
        <p>
          Consigues intentos de una de dos formas: comprándolos, o a través de una universidad
          asociada que paga por sus estudiantes. Lo que te da una compra se muestra en la página
          desde la que compras, antes de pagar.
        </p>
        <p>
          Podemos cambiar el servicio más allá de lo necesario para que siga funcionando como se
          describe, pero solo por un buen motivo: para mejorarlo, para mantenerlo seguro, para
          seguir un cambio en la ley, o porque un proveedor del que dependemos cambia lo que
          ofrece. Un cambio no te cuesta nada extra. Si empeora de forma más que menor algo que
          has pagado, te escribiremos con antelación suficiente, y entonces podrás resolver el
          contrato sin coste en un plazo de 30 días y recuperar lo que pagaste y no has usado. Si
          retiramos algo que ya has pagado y no podemos darte algo equivalente, te
          reembolsaremos esa parte.
        </p>
        <p>
          <strong className="text-white">Qué necesitas.</strong> Una conexión a internet y un
          navegador actualizado, como Chrome, Edge, Firefox o Safari, en un ordenador, una tableta
          o un móvil. No hay nada que instalar. Los informes se pueden imprimir o guardar en PDF
          desde el navegador, y no tienen protección contra copia. Si algo no funciona, podemos
          preguntarte por tu navegador y tu dispositivo para averiguar si la causa está de
          nuestro lado, y solo lo que necesitemos, como una captura de pantalla. Si no colaboras
          en eso, puede corresponderte demostrar que el fallo era nuestro.
        </p>
      </LegalSection>

      <LegalSection id="university-access" title="4. Acceso a través de tu universidad">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Cómo lo consigues.</strong> Si te registras con una
            dirección de correo confirmada de uno de los dominios de una universidad asociada, tu
            cuenta recibe automáticamente el acceso de esa universidad. Está pensado para los
            estudiantes de la universidad y para cualquier otra persona a la que dé una dirección
            en esos dominios.
          </li>
          <li>
            <strong className="text-white">Qué incluye.</strong> Un número de intentos gratuitos
            por cada periodo de licencia, y la hoja de ruta de seguimiento si el plan de la
            universidad la incluye. Tu cuenta muestra lo que tienes. Los intentos gratuitos de la
            universidad se usan antes que los que hayas comprado tú.
          </li>
          <li>
            <strong className="text-white">Cuánto dura.</strong> Mientras la licencia de la
            universidad con nosotros esté activa. Cuando se renueva, recibes una nueva asignación.
            Algunas licencias cubren un número máximo de estudiantes y, una vez alcanzado, los
            nuevos registros no reciben acceso.
          </li>
          <li>
            <strong className="text-white">Cuando termina.</strong> Si la licencia termina, se
            acaban los intentos gratuitos.{' '}
            <strong className="text-white">
              Tu cuenta, tus informes y lo que hayas comprado tú siguen siendo tuyos.
            </strong>
          </li>
          <li>
            <strong className="text-white">Qué ve tu universidad.</strong> Solo totales anónimos
            de todos sus estudiantes juntos; nunca tus respuestas, tus informes, tus comentarios
            ni tu nombre. La{' '}
            <a className="text-indigo-300 underline" href="/privacy#universities">
              Política de privacidad
            </a>{' '}
            explica exactamente qué.
          </li>
          <li>
            <strong className="text-white">Con quién es tu contrato.</strong> Con nosotros. La
            universidad nos paga en virtud de un acuerdo aparte y no es parte de estas
            condiciones. No puede cambiar los derechos que te dan, y no necesitas su permiso para
            usar o eliminar tu cuenta.
          </li>
          <li>
            <strong className="text-white">Si algo sale mal.</strong> El acceso universitario no
            te cuesta nada, así que la Política de reembolsos no se le aplica. Si un informe que
            obtuviste así falla o es defectuoso, avísanos y lo regeneraremos o te devolveremos el
            intento.
          </li>
        </ul>
        <p>
          <strong className="text-white">Si eres personal de una universidad</strong> con acceso
          a un panel universitario, lo usas en nombre de tu universidad conforme a su acuerdo con
          nosotros. No debes intentar averiguar qué estudiante hay detrás de una cifra, ni usar{' '}
          {BRAND.name} para tomar o apoyar una decisión sobre un estudiante, como la admisión, la
          calificación o la disciplina.
        </p>
      </LegalSection>

      <LegalSection id="what-this-is-not" title="5. Lo que este servicio no es">
        <p>
          Esto importa aquí más que en la mayoría de sitios web, así que va en palabras claras y
          no escondido en mayúsculas.
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              No es asesoramiento profesional de orientación ni orientación psicológica.
            </strong>{' '}
            No somos un servicio de orientación regulado, y tu informe no lo elabora ni lo revisa
            un orientador cualificado, ni siquiera cuando una universidad te da acceso.
          </li>
          <li>
            <strong className="text-white">
              No es una evaluación psicológica ni psicométrica.
            </strong>{' '}
            El cuestionario no es un instrumento validado clínicamente y no diagnostica nada
            sobre ti.
          </li>
          <li>
            <strong className="text-white">No es asesoramiento médico ni de salud mental.</strong>{' '}
            Si lo estás pasando mal, habla con un médico o con uno de los servicios de apoyo que
            te mostramos. Nada de esto lo sustituye.
          </li>
          <li>
            <strong className="text-white">No garantiza ningún resultado.</strong> No prometemos
            que seguir el informe te consiga un trabajo, una plaza en unos estudios, un sueldo ni
            una carrera que te guste.
          </li>
          <li>
            <strong className="text-white">Lo genera una IA, y la IA se equivoca.</strong> Los
            informes pueden contener afirmaciones inexactas, desactualizadas o simplemente
            erróneas sobre trabajos, titulaciones y sueldos. Comprueba todo lo importante antes de
            actuar. Nuestro{' '}
            <a className="text-indigo-300 underline" href="/ai-notice">
              Aviso de transparencia sobre la IA
            </a>{' '}
            explica bien los fallos conocidos, y merece la pena leerlo entero.
          </li>
        </ul>
        <p>
          Todas las decisiones sobre tu formación, tu trabajo y tu futuro siguen siendo tuyas.
          Trata el informe como una opinión más entre varias, junto a la de personas que de verdad
          te conocen.
        </p>
      </LegalSection>

      <LegalSection id="payment" title="6. Pago">
        <p>
          Los precios se muestran antes de pagar, incluyen los impuestos aplicables y se cobran en
          la moneda que aparece en el pago. Del pago se encarga Stripe; nunca vemos los datos de
          tu tarjeta.
        </p>
        <p>
          Lo que te da cada producto se indica en la página de pago antes de pagar. Las compras
          son únicas: no tenemos suscripciones, nada se renueva automáticamente y nunca te
          volveremos a cobrar sin que tú decidas comprar algo.
        </p>
        <p>
          Lo que compras es contenido digital suministrado de inmediato. Al completar una compra{' '}
          <strong className="text-white">nos pides expresamente</strong> que lo pongamos a tu
          disposición enseguida, y{' '}
          <strong className="text-white">
            reconoces que pierdes tu derecho de desistimiento de 14 días
          </strong>{' '}
          respecto de cualquier parte que entonces se suministre. Marcas una casilla que lo dice
          en el pago, antes de pagar; no está escondido en esta página. El recibo que te enviamos
          enseguida por correo lo confirma, y repite la información esencial del contrato para que
          la tengas en un formato que puedas conservar.
        </p>
        <p>
          Lo que no hayas usado sigue siendo reembolsable durante 14 días. Tus derechos completos,
          y los casos en que reembolsamos aunque no estemos obligados, están en nuestra{' '}
          <a className="text-indigo-300 underline" href="/refunds">
            Política de reembolsos y desistimiento
          </a>
          , que forma parte de estas condiciones. Es algo distinto de tus derechos si algo es
          defectuoso; consulta la{' '}
          <a className="text-indigo-300 underline" href="#liability">
            sección 9
          </a>
          .
        </p>
        <p>
          <strong className="text-white">Cómo se hace una compra en línea.</strong> Eliges un
          producto en la página de precios, inicias sesión y vas a una página de pago gestionada
          por Stripe, que muestra el producto, el precio y tu dirección de correo. Marcas la
          casilla descrita arriba y pulsas pagar. Hasta entonces puedes volver atrás, elegir otro
          producto, corregir tus datos de pago o salir sin pagar, y no se cobra nada. El contrato
          se celebra cuando el pago se completa, y te lo confirmamos en pantalla y por correo.
          Según la ley húngara, un contrato celebrado así no es un contrato por escrito (írásba
          foglalt szerződés): guardamos un registro electrónico de cada compra, con la versión de
          estas condiciones que se le aplicó, y tus compras aparecen en tu cuenta. El contrato se
          celebra en inglés. No nos hemos adherido a ningún código de conducta.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="7. Cómo puedes usarlo">
        <p>
          Las normas completas están en nuestra{' '}
          <a className="text-indigo-300 underline" href="/acceptable-use">
            Política de uso aceptable
          </a>
          , que forma parte de estas condiciones. En resumen, por favor, no:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Intentes romper o sobrecargar el servicio, ni acceder a él sin autorización</li>
          <li>Uses herramientas automáticas para enviar evaluaciones o generar informes en masa</li>
          <li>Revendas tus informes ni los presentes como un producto tuyo</li>
          <li>Envíes como respuestas los datos personales de otra persona</li>
          <li>Uses una dirección de correo a la que no tienes derecho para conseguir acceso universitario</li>
          <li>
            Intentes que la IA produzca contenido ajeno a la orientación profesional, ni extraer
            nuestras instrucciones o los datos de otros usuarios
          </li>
        </ul>
        <p>
          Podemos suspender o cerrar una cuenta que haga estas cosas. Cuando razonablemente
          podamos, te diremos antes por qué.
        </p>
      </LegalSection>

      <LegalSection id="your-content" title="8. Tus respuestas y tu informe">
        <p>
          Tus respuestas siguen siendo tuyas. Nos das permiso para tratarlas para hacer la
          evaluación y elaborar tu informe, como se describe en nuestra{' '}
          <a className="text-indigo-300 underline" href="/privacy">
            Política de privacidad
          </a>
          .
        </p>
        <p>
          Ese permiso cubre también{' '}
          <strong className="text-white">
            estudiar las respuestas y los resultados que tenemos para mejorar el servicio
          </strong>
          : arreglar preguntas que no funcionan, corregir la puntuación y mejorar los informes.
          Lo hacemos con cifras y con datos sin los datos identificativos siempre que podemos, y
          podemos usar herramientas de IA para la lectura.{' '}
          <strong className="text-white">
            No vendemos tus datos ni los usamos para publicidad. No entrenamos modelos de IA con
            ellos: ni los nuestros, ni los de nuestros proveedores, ni los de nadie. Si algún día
            queremos hacerlo, te lo preguntaremos antes en lugar de basarnos en esta cláusula.
          </strong>{' '}
          Puedes decirnos en cualquier momento que dejemos tus datos fuera de ese trabajo, sin
          perder nada:{' '}
          <a className="text-indigo-300 underline" href="/privacy#improving">
            cómo funciona y cómo oponerte
          </a>
          .
        </p>
        <p>
          Tu informe es tuyo para usarlo con tus propios fines, incluido enseñárselo a una
          universidad, a una empresa o a un orientador si lo decides. Nadie puede obligarte a
          compartirlo. El cuestionario, el modelo de puntuación y el propio sitio siguen siendo
          nuestros.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="9. Nuestra responsabilidad ante ti">
        <p>
          Nada de estas condiciones limita nuestra responsabilidad por un incumplimiento
          intencionado, por daños a la vida, la integridad física o la salud de cualquier persona,
          por fraude, ni por nada que la ley del lugar donde vives no nos permita limitar. Nada de
          ellas te quita un derecho que te dé la ley de consumo de tu país.
        </p>
        <p className="font-medium text-white">Tus derechos si algo es defectuoso</p>
        <p>
          Tu informe y el servicio deben ser{' '}
          <strong className="text-white">
            conformes con lo descrito, aptos para su finalidad y de la calidad que cabría esperar
            normalmente.
          </strong>{' '}
          Si no lo son:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">En Hungría y el resto de la Unión Europea</strong>, las
            normas que aplican la Directiva de la UE sobre contenidos digitales (en Hungría, el
            Decreto del Gobierno 373/2021 y las normas de consumo del Código Civil) te dan
            derecho a que el contenido se ponga en conformidad con lo prometido (en nuestro caso,
            regenerar el informe o devolverte el intento) y, si eso es imposible o no lo
            conseguimos, a una rebaja del precio o a resolver el contrato y recuperar tu dinero. Si
            nuestro contenido digital daña un dispositivo u otro contenido tuyo por falta de un
            cuidado razonable por nuestra parte, tienes derecho a una indemnización. Asesoramiento
            gratuito: la{' '}
            <a
              className="text-indigo-300 underline"
              href="https://www.eccnet.eu"
              target="_blank"
              rel="noopener noreferrer"
            >
              Red de Centros Europeos del Consumidor
            </a>
            .
          </li>
          <li>
            <strong className="text-white">En cualquier otro lugar</strong> (el Reino Unido,
            Suiza, Estados Unidos o cualquier otro país) conservas los derechos que te dé la ley
            de consumo de tu país, además de estas condiciones.
          </li>
        </ul>
        <p>
          Según la ley húngara, que rige estas condiciones, esto es la{' '}
          <strong className="text-white">garantía legal de conformidad (kellékszavatosság)</strong>.
          Comunícanos un fallo sin demora; hacerlo en los dos meses siguientes a darte cuenta es
          siempre a tiempo. Puedes invocarla durante dos años desde que se suministró el contenido.
          Durante el primer año basta con que nos lo digas: se presume que el fallo existía desde
          el principio, salvo que demostremos lo contrario. No puedes arreglar un fallo tú mismo,
          ni encargar a otra persona que lo arregle, a nuestra costa. La garantía de producto
          húngara (termékszavatosság) solo cubre bienes físicos, y no ofrecemos una garantía
          comercial (jótállás).
        </p>
        <p>Sin perjuicio de todo lo anterior:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              No respondemos de las decisiones que tomes basándote en un informe.
            </strong>{' '}
            Eso incluye elegir o dejar unos estudios, un trabajo o una trayectoria profesional, y
            cualquier pérdida de ingresos, oportunidades o tiempo que se derive.
          </li>
          <li>
            No respondemos de pérdidas que no fueran razonablemente previsibles, ni de pérdidas
            empresariales: el servicio es para uso personal.
          </li>
          <li>
            <strong className="text-white">
              No limitamos nuestra responsabilidad ante ti a una cantidad fija.
            </strong>{' '}
            Indemnizamos las pérdidas que, cuando se celebró el contrato, podían preverse como
            consecuencia posible de nuestro incumplimiento, y todas si el incumplimiento fue
            intencionado.
          </li>
          <li>
            No respondemos de un fallo causado por un hecho ajeno a nuestro control que no
            pudimos prever ni razonablemente evitar, como un desastre natural o una caída
            generalizada de internet. Los proveedores que usamos para el alojamiento, los pagos,
            el correo y la IA no son un hecho de ese tipo: respondemos de ellos como de nosotros
            mismos.
          </li>
          <li>
            No podemos prometer que el servicio nunca se interrumpa ni que nunca contenga un
            error, pero eso no reduce tus derechos si algo que compraste es defectuoso.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="indemnity" title="10. Tu responsabilidad ante nosotros">
        <p>
          Si usas el servicio de una forma que estas condiciones prohíben (incumpliendo las
          normas de uso aceptable, enviando datos personales de otra persona o vulnerando
          derechos ajenos) y eso hace que un tercero nos reclame, aceptas cubrir los costes y
          daños razonables que suframos por ello.
        </p>
        <p>
          Esto no se aplica a nada que se derive de nuestro propio incumplimiento de estas
          condiciones o de nuestra propia negligencia, ni al uso normal del servicio.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="11. Fin del acuerdo">
        <p>
          Puedes cerrar tu cuenta cuando quieras, desde la configuración de tu cuenta. Eliminar
          tu cuenta borra tus datos como se describe en la Política de privacidad, y los intentos
          no usados se pierden al hacerlo, así que úsalos o pide antes su reembolso.
        </p>
        <p>
          Si no usas tu cuenta durante dos años, te escribiremos a la dirección que tiene. Si no
          has iniciado sesión en los tres meses siguientes a ese correo, eliminaremos la cuenta
          exactamente igual que si la hubieras cerrado tú, y los intentos no usados también se
          pierden entonces. Iniciar sesión en cualquier momento antes de eso lo conserva todo.
        </p>
        <p>
          Podemos poner fin a este acuerdo si incumples estas condiciones de forma grave o
          reiterada, o si dejamos de prestar el servicio. Si cerramos tu cuenta por motivos
          nuestros y no tuyos, te reembolsaremos lo que hayas pagado y no hayas recibido.
        </p>
      </LegalSection>

      <LegalSection id="complaints" title="12. Reclamaciones">
        <p>
          Si algo ha ido mal, escribe a{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>
          {CONTACT.phone ? ` o llámanos al ${CONTACT.phone}` : ''}. Respondemos a un correo en 3
          días hábiles y procuramos darte una respuesta definitiva en 14 días. Una respuesta por
          escrito te llegará como muy tarde en 30 días y, si no estamos de acuerdo contigo, te
          diremos por qué y a dónde puedes acudir. Si no te convence nuestra respuesta, dínoslo y
          otra persona lo revisará.
        </p>
        <p>
          Seguimos las normas húngaras sobre reclamaciones de consumidores (Ley CLV de 1997,
          artículo 17/A). Si reclamas por teléfono y no podemos resolverlo durante la llamada,
          anotamos tu reclamación y nuestra postura y te enviamos una copia con nuestra
          respuesta, con un número de referencia. Conservamos las reclamaciones y nuestras
          respuestas durante tres años, como exige esa ley.
        </p>
        <p>
          Vivas donde vivas, puedes llevar un conflicto con nosotros a una{' '}
          <strong className="text-white">junta de conciliación húngara (békéltető testület)</strong>,
          de forma gratuita, y participaremos en el procedimiento. Si vives en Hungría, es la
          junta del lugar donde vives; si no, la del lugar de nuestro domicilio social. En ambos
          casos puedes pedir otra junta. Antes debes haber intentado resolver el conflicto con
          nosotros. Los procedimientos son en húngaro, y las audiencias pueden celebrarse en
          línea. Las ocho juntas y cómo contactarlas figuran en nuestra{' '}
          <a className="text-indigo-300 underline" href="/refunds#problems">
            Política de reembolsos y desistimiento
          </a>
          . En cualquier país de la Unión Europea, el{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.eccnet.eu"
            target="_blank"
            rel="noopener noreferrer"
          >
            Centro Europeo del Consumidor
          </a>{' '}
          de tu país te ayuda gratis. No nos hemos adherido a ningún otro sistema de resolución
          de conflictos, y nada de esto te impide acudir a los tribunales o a un organismo de
          consumo.
        </p>
      </LegalSection>

      <LegalSection id="law" title="13. Ley aplicable e idioma">
        <p>
          Estas condiciones y cualquier conflicto que surja de ellas se rigen por la ley de{' '}
          {JURISDICTION_ES}.
        </p>
        <p>
          Si eres consumidor, esa elección no te quita la protección de las leyes de consumo
          imperativas del país donde vives, sea cual sea. Puedes demandar ante los tribunales de{' '}
          {JURISDICTION_ES} o ante los del lugar donde vives, y nosotros solo te demandaremos ante
          los tribunales del lugar donde vives.
        </p>
        <p>
          Estas condiciones están redactadas en inglés. Esta página es una traducción: si las dos
          versiones difieren, se aplica el texto en inglés, salvo que la ley del lugar donde vives
          te dé derecho a basarte en la traducción.
        </p>
      </LegalSection>

      <LegalSection id="general" title="14. Otras cuestiones">
        <p>
          Si un tribunal considera que una parte de estas condiciones no es exigible, el resto
          sigue en vigor. Si no exigimos algo enseguida, no hemos renunciado al derecho a
          exigirlo más tarde. Estas condiciones son entre tú y nosotros; nadie más, incluida una
          universidad asociada, puede exigirlas.
        </p>
        <p>
          Solo podemos actualizar estas condiciones por un buen motivo: un cambio en la ley, un
          cambio en el servicio, un cambio en los proveedores de los que dependemos, para
          corregir un error o aclararlas, o para añadir algo que te beneficie. Si un cambio afecta
          de forma importante a tus derechos, te escribiremos al menos 30 días antes de que entre
          en vigor, y cambiará la fecha de arriba. Si no lo aceptas, puedes cerrar antes tu cuenta
          y te reembolsaremos lo que hayas pagado y no hayas recibido. Un cambio nunca altera una
          compra que ya hayas hecho.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
