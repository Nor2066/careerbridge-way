// app/ai-notice/AiNoticeEs.tsx
//
// The AI transparency notice in Spanish: a translation of the English page in
// page.tsx, which binds (Terms 13). Change both together.

import LegalPage, { LegalSection } from '@/components/LegalPage';
import { CONTACT, LAST_UPDATED } from '@/lib/legal';
import { BRAND } from '@/lib/site';

export default function AiNoticeEs() {
  return (
    <LegalPage
      locale="es"
      title="Aviso de transparencia y exención de responsabilidad sobre la IA"
      lastUpdated={LAST_UPDATED.aiNotice}
      intro={
        <>
          <p>
            Una parte de este servicio es inteligencia artificial y otra no. Las puntuaciones por
            área profesional salen de una fórmula fija que no aprende. El informe escrito lo genera
            un modelo de IA,{' '}
            <strong className="text-white">ninguna persona lo revisa antes de que lo veas</strong>, y
            puede equivocarse, con total seguridad, sobre trabajos, sueldos, titulaciones y vías de
            acceso.
          </p>
          <p>
            Es información para reflexionar. No es asesoramiento de orientación profesional, no es
            una predicción y no decide nada sobre ti.
          </p>
        </>
      }
    >
      <LegalSection id="which-parts" title="Qué partes son IA y cuáles no">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-4 font-medium">Parte</th>
                <th className="py-2 pr-4 font-medium">¿IA?</th>
                <th className="py-2 font-medium">Qué es en realidad</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-medium text-white">El cuestionario</td>
                <td className="py-3 pr-4 text-gray-300">No</td>
                <td className="py-3 text-gray-300">
                  Un conjunto fijo de preguntas. Todo el mundo ve las mismas, en el mismo orden.
                </td>
              </tr>
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-medium text-white">Tus puntuaciones por área</td>
                <td className="py-3 pr-4 text-gray-300">No</td>
                <td className="py-3 text-gray-300">
                  Un cálculo fijo basado en reglas. Cada respuesta tiene un peso predeterminado y los
                  totales son aritmética. No aprende, no se adapta y no cambia según lo que haya
                  respondido otra persona. Las mismas respuestas dan siempre las mismas
                  puntuaciones.
                </td>
              </tr>
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-medium text-white">Tu informe escrito</td>
                <td className="py-3 pr-4 font-medium text-indigo-300">Sí</td>
                <td className="py-3 text-gray-300">
                  Un gran modelo de lenguaje, proporcionado por OpenAI, escribe el texto a partir de
                  tus respuestas y tus puntuaciones. Es IA generativa, con todo lo que eso implica.
                </td>
              </tr>
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-medium text-white">La hoja de ruta de seguimiento</td>
                <td className="py-3 pr-4 font-medium text-indigo-300">Sí</td>
                <td className="py-3 text-gray-300">
                  El mismo modelo, que escribe a partir de tus respuestas de seguimiento junto con
                  tus respuestas principales y tu primer informe, para que la hoja de ruta se apoye
                  en lo que ya se te dijo.
                </td>
              </tr>
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-medium text-white">Detección de angustia</td>
                <td className="py-3 pr-4 text-gray-300">No</td>
                <td className="py-3 text-gray-300">
                  Una lista fija de expresiones, comparadas literalmente. Consulta más abajo.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="what-it-gets" title="Qué recibe la IA">
        <p>
          Cuando pides un informe, enviamos al modelo{' '}
          <strong className="text-white">
            todas tus respuestas a la evaluación, incluido el texto libre, tus puntuaciones
            calculadas y el idioma en que usas el sitio
          </strong>
          , para que el informe se escriba en ese idioma. Para la hoja de ruta también enviamos
          tus respuestas de seguimiento y el primer informe del mismo intento. Si una universidad
          te da acceso, indicamos al modelo en qué país está, para que sus sugerencias encajen con
          el lugar donde estudias.
        </p>
        <p>
          <strong className="text-white">No</strong> enviamos tu dirección de correo, tu nombre,
          tus datos de pago, tu identificador de cuenta, tu dirección IP, el nombre de tu
          universidad ni los informes de tus otros intentos.
        </p>
        <p>
          Tus respuestas pasan antes por un filtro que elimina contenido que podría servir para
          manipular el modelo. Es una medida de seguridad.{' '}
          <strong className="text-white">No confíes en ella para quitar información personal</strong>
          : no está diseñada para eso y no lo detectará todo.
        </p>
        <p>
          <strong className="text-white">
            No entrenamos modelos de IA con tus respuestas. Ni los nuestros, ni los de OpenAI, ni
            los de nadie.
          </strong>{' '}
          Si algún día decidimos que queremos hacerlo, te lo preguntaremos antes, en lugar de
          tratar algo que aceptaste en el pasado como un permiso. Nuestra{' '}
          <a className="text-indigo-300 underline" href="/privacy#ai">
            Política de privacidad
          </a>{' '}
          explica la situación contractual y dónde se hace el tratamiento.
        </p>
        <p>
          Hay un segundo uso de la IA, distinto, que conviene conocer.{' '}
          <strong className="text-white">
            También usamos IA para leer a la vez las respuestas de muchas personas
          </strong>
          , resumiendo qué preguntas confunden a la gente, dónde parece fallar la puntuación y
          dónde salen flojos los informes, para poder arreglar esas cosas. Ese análisis se hace
          con datos sin los datos identificativos, produce temas y cifras y no nada sobre una
          persona concreta, y tampoco es entrenamiento: el modelo no aprende nada ni guarda nada.
        </p>
        <p>
          De ahí se derivan dos cosas. Un cambio que hagamos por ello (una pregunta reformulada,
          un peso corregido) es una decisión de una persona apoyada en el análisis, no algo que
          un modelo haya decidido por su cuenta. Y puedes decirnos que dejemos tus datos
          totalmente fuera, sin perder nada:{' '}
          <a className="text-indigo-300 underline" href="/privacy#improving">
            cómo funciona y cómo oponerte
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="failures" title="En qué se equivocan los informes generados por IA">
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">Esta es la sección que hay que leer.</strong> Todo lo
            que sigue es un fallo normal y conocido de esta tecnología, no un error raro. Cuenta
            con encontrar algo de esto en tu informe.
          </p>
        </div>
        <ul className="ml-5 flex list-disc flex-col gap-3">
          <li>
            <strong className="text-white">Se inventa cosas.</strong> Los modelos de lenguaje
            producen textos convincentes sean ciertos o no. Un informe puede mencionar un sueldo,
            una titulación, un requisito de acceso, un colegio profesional o un curso que no
            existe, con el mismo tono seguro que las partes correctas. No puedes distinguirlos
            leyendo.
          </li>
          <li>
            <strong className="text-white">Está desactualizado.</strong> El modelo se entrenó con
            información hasta un momento del pasado y no tiene conexión en directo con el mercado
            laboral. Los sueldos, los requisitos de acceso, las vías de formación profesional, las
            normas de visados y las ayudas cambian, y él no lo sabrá.
          </li>
          <li>
            <strong className="text-white">No conoce tu mercado laboral local</strong>: dónde
            vives, qué empresas tienes cerca o qué se está contratando en tu zona. Su conocimiento
            de los sistemas educativos, las titulaciones y los sueldos es desigual entre países, y
            puede describir las vías de un país como si se aplicaran en otro.
          </li>
          <li>
            <strong className="text-white">
              No sabe nada de ti más allá de lo que escribiste.
            </strong>{' '}
            No puede ver tus notas, tu situación económica, tu salud, tus responsabilidades de
            cuidado ni tu situación migratoria salvo que las escribieras.
          </li>
          <li>
            <strong className="text-white">
              Puede reflejar sesgos de los datos con que se entrenó
            </strong>
            , incluidas ideas preconcebidas sobre quién hace qué trabajo. Si un informe parece
            orientarte por algo que debería ser irrelevante,{' '}
            <strong className="text-white">es un fallo y queremos saberlo.</strong>
          </li>
          <li>
            <strong className="text-white">No es coherente.</strong> Pregunta dos veces y
            obtendrás dos informes distintos. Ninguno es la respuesta &laquo;de verdad&raquo;.
          </li>
          <li>
            <strong className="text-white">Ninguna persona lo lee antes que tú.</strong> El
            informe va del modelo a tu pantalla. Nadie aquí lo revisa, y ningún orientador
            cualificado lo revisa ni lo aprueba.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="not" title="Lo que este servicio no es">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              No es asesoramiento profesional de orientación ni orientación psicológica.
            </strong>{' '}
            No somos un servicio de orientación regulado.
          </li>
          <li>
            <strong className="text-white">No es un test psicométrico.</strong> El cuestionario no
            está validado, no está baremado con ninguna población y no tiene datos publicados de
            fiabilidad ni de validez. No debe usarse para contratación, selección ni admisiones.
          </li>
          <li>
            <strong className="text-white">
              No es asesoramiento médico, psicológico ni de salud mental
            </strong>
            , ni un diagnóstico de nada.
          </li>
          <li>
            <strong className="text-white">
              No es asesoramiento jurídico, financiero, fiscal, migratorio ni sobre admisiones.
            </strong>{' '}
            Lo que diga un informe sobre visados, préstamos, ayudas, requisitos de acceso o
            colegiación profesional debe comprobarse en una fuente oficial.
          </li>
          <li>
            <strong className="text-white">No es una predicción ni una garantía.</strong> Ningún
            informe te promete un trabajo, una plaza, un sueldo ni una carrera que te vaya a
            gustar.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="decides-nothing" title="Nada de esto decide nada sobre ti">
        <p>
          El servicio produce información para que la tengas en cuenta.{' '}
          <strong className="text-white">No decide</strong> si consigues un trabajo, una plaza en
          unos estudios, un préstamo ni ninguna otra cosa, y no está conectado con ninguna
          organización que tome esas decisiones.
        </p>
        <p>
          Tus puntuaciones e informes{' '}
          <strong className="text-white">
            no se comparten con ninguna universidad, empresa, centro educativo ni servicio de
            orientación.
          </strong>{' '}
          Nadie fuera de {BRAND.name} los ve salvo que decidas enseñarlos, y dentro de{' '}
          {BRAND.name} un fundador los abre solo por los motivos que enumera nuestra{' '}
          <a className="text-indigo-300 underline" href="/privacy#our-access">
            Política de privacidad
          </a>
          , por ejemplo cuando tú nos lo pides. Si una universidad te da acceso, solo ve totales
          anónimos de todos sus estudiantes juntos, nunca tus resultados. Nuestro contrato con
          ella le prohíbe usar {BRAND.name} para decidir nada sobre un estudiante: admisión,
          calificación, disciplina ni ninguna otra cosa.
        </p>
        <p>
          Como nada de esto produce efectos jurídicos en ti ni te afecta significativamente de
          modo similar, no consideramos aplicable el artículo 22 del RGPD (el derecho a no ser
          objeto de una decisión basada únicamente en un tratamiento automatizado). Te mostramos
          nuestro razonamiento en lugar de pedirte que te fíes, y nuestra{' '}
          <a className="text-indigo-300 underline" href="/privacy#automated">
            Política de privacidad
          </a>{' '}
          lo explica con más detalle.
        </p>
      </LegalSection>

      <LegalSection id="human-review" title="Pedir que intervenga una persona">
        <p>
          Sea cual sea la situación legal estricta, siempre puedes pedirnos que revisemos un
          resultado.{' '}
          <strong className="text-white">
            Lo ofrecemos porque es lo correcto, no porque hayamos concluido que estamos obligados.
          </strong>
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Pídenos que te expliquemos con palabras sencillas la lógica del modelo de puntuación.</li>
          <li>Pide que una persona de nuestro equipo mire tu informe o tus puntuaciones y te dé su opinión.</li>
          <li>Dinos que crees que un resultado es erróneo o injusto, y lo revisaremos.</li>
          <li>Pídenos que borremos un informe que preferirías que no existiera.</li>
        </ul>
        <p>
          Una revisión es una comprobación de nuestro propio equipo. No es orientación
          psicológica ni el consejo de un psicólogo o de un profesional de la orientación.
        </p>
        <p>
          Escribe a{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
          . Procuramos responder en 3 días hábiles y completar una revisión en el plazo de un mes.
        </p>
      </LegalSection>

      <LegalSection id="distress" title="Si tus respuestas sugieren que lo estás pasando mal">
        <p>
          Un cuestionario que pregunta en qué has fracasado y qué te da miedo recibirá a veces
          respuestas que describen una angustia real. Para que el servicio no responda a eso
          enumerando alegremente áreas profesionales, tus respuestas de texto libre se comparan
          con una lista fija de expresiones, en inglés y en español, que sugieren autolesiones o
          pensamientos suicidas.
        </p>
        <p>
          Si alguna coincide, se muestra información de apoyo encima de tu informe y se indica al
          modelo que escriba con más cuidado. El contenido profesional de tu informe{' '}
          <strong className="text-white">no se bloquea, no se retrasa ni se cambia</strong>: lo
          pediste y tienes derecho a él.
        </p>
        <p className="font-medium text-white">Lo que esto no es:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Es una <strong className="text-white">búsqueda de palabras, no una evaluación</strong>.
            Se le escaparán cosas y a veces saltará con frases normales.
          </li>
          <li>
            <strong className="text-white">No se guarda nada.</strong> El resultado existe durante
            una solicitud y después desaparece: no se guarda, no se vincula a tu cuenta y nadie lo
            ve.
          </li>
          <li>
            <strong className="text-white">No se avisa a nadie.</strong> No se notifica a ninguna
            persona, y no vigilamos a nadie.
          </li>
          <li>
            <strong className="text-white">No es una red de seguridad</strong>. Por favor, no
            confíes en ella.
          </li>
        </ul>
        <p>
          La información de apoyo que se muestra es la de tu país: el país de tu universidad
          asociada si la tienes y, si no, el país aproximado de tu conexión, con un directorio
          internacional de teléfonos de ayuda donde no tenemos una lista local.
        </p>
        <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 p-4">
          <p className="text-sm text-indigo-100">
            <strong className="font-semibold">
              Si ahora mismo estás en peligro, llama al número de emergencias local
            </strong>
            : el <strong>112</strong> en cualquier país de Europa, el <strong>999</strong> en el
            Reino Unido. En España, la línea de atención a la conducta suicida, el{' '}
            <strong>024</strong>, es gratuita y funciona las 24 horas. En el Reino Unido,
            Samaritans atiende gratis las 24 horas en el <strong>116 123</strong>. En otros
            lugares,{' '}
            <a
              className="underline"
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              findahelpline.com
            </a>{' '}
            enumera servicios gratuitos por país. Si eres estudiante, tu universidad tendrá un
            servicio de bienestar.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="tell-us" title="Avísanos cuando la IA se equivoque">
        <p>
          <strong className="text-white">Por favor, avísanos.</strong> Escribe a{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          con lo que decía el informe y lo que tenía de malo.
        </p>
        <p>
          Es lo más útil que puedes hacer por el producto. No vemos tus informes de forma
          rutinaria, y un fallo que no conocemos es un fallo que no podemos arreglar. Nos interesa
          especialmente saber de datos inventados afirmados con seguridad, consejos que sería
          perjudicial seguir, cualquier cosa que parezca sesgada o que te empuje en una
          dirección, y cualquier cosa angustiosa.
        </p>
      </LegalSection>

      <LegalSection id="regulation" title="Nuestra situación ante los reguladores">
        <p>
          <strong className="text-white">Unión Europea.</strong> Estamos establecidos en Hungría
          y ofrecemos el servicio en toda la UE, así que se le aplica el Reglamento de IA de la
          UE. Nuestra lectura es que no es un sistema de &laquo;alto riesgo&raquo;: es una
          herramienta de ayuda personal, y no se usa para decidir la admisión en estudios, evaluar
          el aprendizaje, asignar un nivel educativo, vigilar a estudiantes durante exámenes ni
          contratar o seleccionar a nadie, y nuestros contratos con las universidades les
          prohíben usarlo para cualquiera de esas cosas. Lo que se nos aplica son las obligaciones
          de transparencia del Reglamento sobre contenido generado por IA. Tu informe está
          etiquetado como informe de IA dondequiera que aparezca, y este aviso explica lo que eso
          significa. Cada informe lleva además una marca que el software puede leer (el código
          estándar para contenido generado por IA), en la página y en la descarga de tus datos.
        </p>
        <p>
          <strong className="text-white">Otros lugares.</strong> Muchos países, entre ellos el
          Reino Unido, no tienen una ley general sobre IA. Allí nuestras obligaciones vienen de la
          ley de protección de datos, la ley de consumo y las normas generales sobre negligencia y
          declaraciones engañosas. Uses el servicio donde lo uses, se aplican el mismo aviso y los
          mismos límites. Si una ley de un lugar donde ofrecemos el servicio exige más, esta
          página cambiará con ella y lo diremos.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Cambios">
        <p>
          Si cambiamos el proveedor de IA, el modelo o lo que le enviamos, actualizaremos este
          aviso y la fecha de arriba. Si el cambio afecta de forma importante a lo que hace el
          servicio con tus respuestas, te escribiremos.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
