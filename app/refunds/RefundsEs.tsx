// app/refunds/RefundsEs.tsx
//
// The refund and cancellation policy in Spanish: a translation of the English
// page in page.tsx, which binds (Terms 13). Change both together.

import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONCILIATION_BOARDS, CONTACT, LAST_UPDATED } from '@/lib/legal';
import { boardCoversEs } from '@/lib/legal-es';

export default function RefundsEs() {
  return (
    <LegalPage
      locale="es"
      title="Política de reembolsos y desistimiento"
      lastUpdated={LAST_UPDATED.refunds}
      intro={
        <>
          <p>
            Tienes derecho por ley a cambiar de opinión sobre la mayoría de las compras en línea
            durante 14 días. Esta página explica cómo funciona aquí, cuándo deja de aplicarse y
            cómo pedir que te devolvamos el dinero.
          </p>
          <p>
            <strong className="text-white">
              No tenemos suscripciones y nada se renueva automáticamente.
            </strong>{' '}
            Cada compra es única. Nunca se te volverá a cobrar salvo que decidas comprar otra
            cosa.
          </p>
        </>
      }
    >
      <LegalSection id="right-to-cancel" title="Tu derecho de desistimiento de 14 días">
        <p>
          Puedes cancelar una compra en los 14 días siguientes y recibir un reembolso íntegro,
          sin tener que dar ningún motivo. Este derecho procede de la Directiva de la UE sobre los
          derechos de los consumidores. Somos una empresa húngara, así que lo aplicamos tal como
          lo ha incorporado Hungría, en el Decreto del Gobierno 45/2014 (II. 26.), junto con las
          normas de consumo del Código Civil húngaro. Lo aplicamos igual a todo el mundo, vivas
          donde vivas, y si la ley de tu propio país te da más, también lo tienes.
        </p>
        <p>
          La única excepción, y es importante: el contenido digital que se entrega de inmediato.
          Cuando compras intentos y después usas uno para generar un informe, has recibido el
          contenido digital, y la ley te permite renunciar a tu derecho de desistimiento a cambio
          de recibirlo enseguida. Marcas una casilla que lo dice en el pago, y el recibo que te
          enviamos por correo lo confirma.
        </p>
      </LegalSection>

      <LegalSection id="withdraw" title="Cancelar en línea">
        <p>
          La forma más rápida de cancelar es el enlace{' '}
          <a className="text-indigo-300 underline" href="/withdraw">
            Desistir del contrato aquí
          </a>
          , al pie de cada página y en la página de tu cuenta. Indica tu nombre y qué compra,
          pulsa <strong className="text-white">Confirmar desistimiento</strong> y te enviamos
          enseguida por correo una confirmación de lo que enviaste y cuándo. No tienes que haber
          iniciado sesión ni dar ningún motivo.
        </p>
        <p>
          Está disponible durante los 14 días siguientes a cada compra. Un desistimiento enviado
          antes de que termine el día 14 llega a tiempo, tardemos lo que tardemos después en
          tramitarlo.
        </p>
      </LegalSection>

      <LegalSection id="how-it-works" title="Qué significa en la práctica">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Intentos sin usar: reembolso íntegro, 14 días.</strong>{' '}
            Si has comprado un plan o una recarga y no has generado ningún informe con ellos,
            pídelo en 14 días y te devolveremos todo.
          </li>
          <li>
            <strong className="text-white">
              Intentos usados: sin derecho automático a reembolso.
            </strong>{' '}
            Una vez generado un informe para ti, esa parte de la compra se ha entregado, y en el
            pago aceptaste recibirla de inmediato.
          </li>
          <li>
            <strong className="text-white">Compras usadas en parte:</strong> reembolsamos la
            parte que no has usado. Compras tres intentos, usas uno y cambias de opinión en los
            primeros 14 días: recuperas dos tercios.
          </li>
          <li>
            <strong className="text-white">El paquete de seguimiento</strong> cuenta como usado
            en cuanto generas con él cualquier hoja de ruta.
          </li>
          <li>
            <strong className="text-white">El acceso a través de tu universidad</strong> es
            gratuito para ti, así que no hay nada que reembolsar. Lo que pagó la universidad es
            cosa suya y nuestra. Si un informe que obtuviste así falla o es defectuoso, avísanos y
            lo regeneraremos o te devolveremos el intento.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="faulty" title="Tus derechos aparte si algo es defectuoso">
        <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 p-4">
          <p className="text-sm text-indigo-100">
            <strong className="font-semibold">
              El derecho de 14 días y tus derechos por contenido defectuoso son dos cosas
              distintas.
            </strong>{' '}
            Los 14 días son para cambiar de opinión. Los derechos de abajo son para cuando algo
            está mal, y no se limitan a 14 días.
          </p>
        </div>
        <p>
          El contenido digital que compras debe ser conforme con lo descrito, apto para su
          finalidad y de la calidad que cabría esperar normalmente. Esto procede de la{' '}
          <strong className="text-white">Directiva de la UE sobre contenidos digitales</strong>:
          en Hungría, el Decreto del Gobierno 373/2021 y las normas de consumo del Código Civil, y
          en el resto de la Unión Europea, las normas de tu propio país que aplican esa misma
          directiva. Si no es como debe ser, tienes derecho a:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            una <strong className="text-white">reparación o sustitución</strong> (en nuestro caso,
            regenerar el informe o devolverte el intento) en un plazo razonable y sin
            inconvenientes importantes para ti; y
          </li>
          <li>
            una <strong className="text-white">rebaja del precio</strong>, o a{' '}
            <strong className="text-white">resolver el contrato y recuperar tu dinero</strong>, si
            eso no funciona o no es posible.
          </li>
        </ul>
        <p>
          Si nuestro contenido digital daña tu dispositivo u otro contenido, y no lo habría hecho
          si hubiéramos actuado con un cuidado razonable, tienes derecho a una indemnización.
        </p>
        <p>
          Según la ley húngara, esto es la{' '}
          <strong className="text-white">garantía legal de conformidad (kellékszavatosság)</strong>.
          Comunícanos un fallo sin demora; hacerlo en los dos meses siguientes a darte cuenta es
          siempre a tiempo. Puedes invocarla durante dos años desde que se suministró el
          contenido, y durante el primer año se presume que el fallo existía desde el principio.
          No puedes arreglar un fallo tú mismo a nuestra costa. La garantía de producto
          (termékszavatosság) solo cubre bienes físicos, y no ofrecemos una garantía comercial
          (jótállás).
        </p>
        <p>
          Fuera de la Unión Europea, conservas los derechos que te dé la ley de consumo de tu
          propio país si algo es defectuoso.
        </p>
        <p>
          <strong className="text-white">
            Nada de esta política ni de nuestras condiciones te quita esos derechos
          </strong>
          , y no podemos pedirte que renuncies a ellos.
        </p>
      </LegalSection>

      <LegalSection id="beyond-the-rules" title="Cuándo reembolsamos de todos modos">
        <p>
          Lo anterior es el mínimo legal. Preferimos tener a una persona que se sintió tratada con
          justicia que 3 €. Te reembolsaremos fuera de esas normas si:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Algo falló: tu informe no se generó, llegó vacío, o se descontó un intento sin que
            recibieras nada a cambio
          </li>
          <li>Se te cobró dos veces lo mismo</li>
          <li>
            El informe que recibiste no es, claramente, lo que se describía en la página desde la
            que compraste
          </li>
        </ul>
        <p>
          Si se descontó un intento y no te llegó ningún informe, avísanos y te devolveremos el
          intento o lo reembolsaremos. No deberías tener que insistir para eso.
        </p>
      </LegalSection>

      <LegalSection id="how-to-ask" title="Cómo pedirlo">
        <p>
          Dentro de los 14 días, usa el{' '}
          <a className="text-indigo-300 underline" href="/withdraw">
            formulario de desistimiento
          </a>
          . O, en cualquier momento, escribe a{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          desde la dirección de tu cuenta{CONTACT.phone ? `, o llámanos al ${CONTACT.phone},` : ''}{' '}
          y dinos qué compraste y aproximadamente cuándo. No necesitas un número de referencia
          ni un motivo.
        </p>
        <p>
          Responderemos en 3 días hábiles. Los reembolsos aprobados vuelven a la tarjeta con la
          que pagaste, a través de Stripe, en un plazo de 14 días, normalmente mucho antes. Tu
          banco puede tardar unos días más en mostrarlo.
        </p>
        <p>
          <strong className="text-white">Después de cancelar.</strong> Tus respuestas e informes
          son datos personales, y la{' '}
          <a className="text-indigo-300 underline" href="/privacy">
            Política de privacidad
          </a>{' '}
          explica cómo los guardamos. Puedes descargarlos gratis, en un formato de uso común y
          legible por máquina, desde la configuración de tu cuenta, antes o después de cancelar.
          Cuando te reembolsamos, los intentos reembolsados se retiran de tu cuenta.
        </p>
      </LegalSection>

      <LegalSection id="cancelling-account" title="Cerrar tu cuenta">
        <p>
          Puedes eliminar tu cuenta en cualquier momento desde la configuración de tu cuenta. Es
          un clic y no está escondido detrás de un correo a nosotros.
        </p>
        <p>
          Eliminar tu cuenta no reembolsa automáticamente los intentos sin usar, así que, si
          quieres recuperar tu dinero, pídenoslo antes de eliminarla: después ya no tenemos los
          registros que nos permiten calcular lo que te correspondía.
        </p>
      </LegalSection>

      <LegalSection id="problems" title="Si no te convence el resultado">
        <p>
          Responde y dínoslo, y otra persona lo revisará. La mayoría de los desacuerdos acaban
          aquí.
        </p>
        <p>
          Puedes recibir asesoramiento gratuito e independiente en cualquier país de la Unión
          Europea del{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.eccnet.eu"
            target="_blank"
            rel="noopener noreferrer"
          >
            Centro Europeo del Consumidor
          </a>{' '}
          de tu país, que ayuda gratis con compras a empresas de otros países. Fuera de la Unión
          Europea, puede asesorarte el organismo de consumo de tu país.
        </p>
        <p>
          Vivas donde vivas, puedes llevar el conflicto a una{' '}
          <strong className="text-white">junta de conciliación húngara (békéltető testület)</strong>.
          Es gratuito, más rápido que un juicio, y participaremos en el procedimiento. Si vives en
          Hungría, se ocupa la junta del lugar donde vives; si no, la del lugar de nuestro
          domicilio social. En ambos casos puedes pedir otra junta. Antes debes haber intentado
          resolver el conflicto con nosotros. Los procedimientos son en húngaro, y las audiencias
          pueden celebrarse en línea. El portal nacional,{' '}
          <a
            className="text-indigo-300 underline"
            href="https://bekeltetes.hu"
            target="_blank"
            rel="noopener noreferrer"
          >
            bekeltetes.hu
          </a>
          , tiene un formulario para iniciar un caso en línea. No hemos hecho una declaración
          general de aceptación anticipada de las decisiones de las juntas (általános alávetési
          nyilatkozat), y no nos hemos adherido a ningún otro sistema de resolución de
          conflictos. Las ocho juntas, los condados que cubre cada una y cómo contactarlas
          (cuando no se indica una dirección postal, escribe a la dirección que figura):
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2 text-sm">
          {CONCILIATION_BOARDS.map((b) => (
            <li key={b.name}>
              <strong className="text-white">{b.name}</strong> &mdash; {boardCoversEs(b.covers)}.{' '}
              {b.address}
              {b.postal ? ` (dirección postal: ${b.postal})` : ''}. {b.phone}.{' '}
              {b.email ? (
                <>
                  <a className="text-indigo-300 underline" href={`mailto:${b.email}`}>
                    {b.email}
                  </a>
                  .{' '}
                </>
              ) : null}
              <a
                className="text-indigo-300 underline"
                href={`https://${b.web}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {b.web}
              </a>
            </li>
          ))}
        </ul>
        <p>
          También puedes preguntar a tu banco o al emisor de tu tarjeta por una retrocesión del
          cargo. Preferimos con mucho resolverlo directamente contigo, y no cerraremos tu cuenta
          por pedirla. Nada de esto te impide acudir a los tribunales.
        </p>
      </LegalSection>

      <LegalSection id="cancellation-form" title="Modelo de formulario de desistimiento">
        <p>
          No tienes que usarlo. Está aquí porque la ley de consumo de la UE nos obliga a ponerlo a
          tu disposición (en Hungría, el anexo 2 del Decreto del Gobierno 45/2014); un simple
          correo diciendo que quieres cancelar sirve igual, y es más rápido.
        </p>
        <div className="rounded-lg border border-white/15 bg-white/5 p-4 font-mono text-xs leading-relaxed text-gray-300">
          <p>
            A la atención de: {COMPANY.legalName}
            {COMPANY.address ? `, ${COMPANY.address}` : ''}
          </p>
          <p>Correo electrónico: {CONTACT.support}</p>
          <p className="mt-3">
            Por la presente le comunico que desisto de mi contrato de prestación del siguiente
            servicio:
          </p>
          <p className="mt-3">Pedido el / recibido el: ................................</p>
          <p className="mt-2">Nombre del consumidor: ...................................</p>
          <p className="mt-2">Domicilio del consumidor: ................................</p>
          <p className="mt-2">Dirección de correo de la cuenta: ........................</p>
          <p className="mt-2">
            Firma (solo si el presente formulario se presenta en papel): ..............
          </p>
          <p className="mt-2">Fecha: ...................................................</p>
        </div>
        <p>Cumplimenta y envía este formulario solo si deseas desistir del contrato.</p>
      </LegalSection>
    </LegalPage>
  );
}
