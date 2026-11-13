// app/privacy/PrivacyPolicyEs.tsx
//
// The privacy policy in Spanish: a translation of the English page in
// page.tsx, which binds (Terms 13). Change both together.

import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONTACT, LAST_UPDATED, MINIMUM_AGE } from '@/lib/legal';
import { JURISDICTION_ES, registrationDetailsEs, retentionEs, subprocessorsEs } from '@/lib/legal-es';
import { BRAND } from '@/lib/site';

export default function PrivacyPolicyEs() {
  const privacyLink = (
    <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
      {CONTACT.privacy}
    </a>
  );
  const details = registrationDetailsEs();

  return (
    <LegalPage
      locale="es"
      title="Política de privacidad"
      lastUpdated={LAST_UPDATED.privacy}
      intro={
        <>
          <p>
            <strong className="text-white">Sí, recogemos tus datos personales.</strong> No
            puedes hacer una evaluación de orientación profesional sin contarnos cosas sobre ti,
            así que esta página explica exactamente qué recogemos, qué hacemos con ello y cómo
            hacer que lo borremos.
          </p>
          <p>
            En resumen: recogemos tu dirección de correo electrónico y tus respuestas a la
            evaluación, enviamos esas respuestas a un proveedor de inteligencia artificial para
            que redacte tu informe y las guardamos hasta que nos digas que dejemos de hacerlo. No
            vendemos nada a nadie y no usamos tus respuestas para publicidad.
          </p>
          <p>
            <strong className="text-white">
              También estudiamos las respuestas y los resultados que ya tenemos para mejorar el
              servicio
            </strong>
            : qué preguntas funcionan, dónde falla la puntuación, dónde los informes son flojos.
            Normalmente con cifras y no con personas concretas, y a veces con herramientas de IA
            que hacen la lectura.{' '}
            <a className="text-indigo-300 underline" href="#improving">
              Cómo funciona y cómo decir que no
            </a>
            .
          </p>
          <p>
            Si tu universidad te da acceso, paga tu cuenta, pero{' '}
            <strong className="text-white">nunca ve tus respuestas, tus informes ni tu nombre</strong>
            : solo totales anónimos de todos sus estudiantes juntos.{' '}
            <a className="text-indigo-300 underline" href="#universities">
              Qué puede ver
            </a>
            .
          </p>
        </>
      }
    >
      <LegalSection id="who-we-are" title="Quiénes somos">
        <p>
          {COMPANY.tradingName} es un nombre comercial de {COMPANY.legalName}, sociedad de
          responsabilidad limitada establecida en {JURISDICTION_ES}.
          {details ? ` ${details}` : ''}
        </p>
        <p>
          {COMPANY.legalName} es el <strong className="text-white">responsable del tratamiento</strong>{' '}
          de los datos personales que se describen en esta página, y responde de ellos. Eso
          incluye a los estudiantes que llegan a través de una universidad asociada: tienes tu
          propia cuenta con nosotros, y somos nosotros, no la universidad, quienes decidimos cómo
          se usan tus datos. Para cualquier cuestión sobre tus datos, escribe a {privacyLink}.
        </p>
        <p>
          No hemos designado un delegado de protección de datos. El RGPD lo exige cuando la
          actividad principal de una empresa consiste en una observación habitual y sistemática
          de personas a gran escala, o en el tratamiento a gran escala de datos sensibles
          (artículo 37), y algunos países añaden casos propios: España, por ejemplo, lo exige a
          los servicios en línea que elaboran perfiles de sus usuarios a gran escala.{' '}
          {BRAND.name} elabora un perfil de cada persona que lo usa, pero no a gran escala. Lo
          volvemos a comprobar cada vez que se une una universidad, y designaremos uno, y lo
          indicaremos aquí, antes de llegar a esa escala.
        </p>
        <p>
          Ofrecemos el servicio a personas de muchos países. Estamos establecidos en Hungría,
          dentro de la Unión Europea, así que el Reglamento General de Protección de Datos de la
          UE (RGPD) rige cómo tratamos tus datos vivas donde vivas, y la autoridad húngara de
          protección de datos, la NAIH, es nuestra autoridad de control principal. Si la ley de
          tu propio país también protege tus datos, conservas esa protección; consulta{' '}
          <a className="text-indigo-300 underline" href="#your-rights">
            Tus derechos
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" title="Qué recogemos">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Tu dirección de correo electrónico</strong>, para que
            puedas iniciar sesión y para enviarte recibos, enlaces de inicio de sesión y un aviso
            cuando tu informe esté listo. Si inicias sesión con Google, recibimos tu dirección de
            correo de Google, no tu contraseña.
          </li>
          <li>
            <strong className="text-white">Tus respuestas a la evaluación</strong>, incluidas
            las respuestas de texto libre sobre tus intereses, valores y aspiraciones, y tus
            respuestas al cuestionario de seguimiento si lo haces.
          </li>
          <li>
            <strong className="text-white">Los informes que generamos para ti</strong>, para que
            puedas volver a leerlos desde tu historial.
          </li>
          <li>
            <strong className="text-white">Valoraciones y comentarios</strong> que decidas dejar
            sobre lo acertado que te pareció un informe.
          </li>
          <li>
            <strong className="text-white">Tu historial de compras</strong>: qué compraste,
            cuándo y por cuánto. Nunca vemos ni guardamos el número de tu tarjeta; de eso se
            encarga Stripe.
          </li>
          <li>
            <strong className="text-white">La universidad asociada a través de la que te uniste</strong>
            , si la hay. La deducimos del dominio de tu dirección de correo confirmada (la parte
            después de la @), y la usamos para darte el acceso gratuito de la universidad y para
            contarte en sus totales anónimos.
          </li>
          <li>
            <strong className="text-white">Tu idioma</strong> (inglés o español), para que el
            sitio y tu informe estén escritos en él. Si eliges uno con el selector de idioma, una
            cookie lo recuerda.
          </li>
          <li>
            <strong className="text-white">Tu país aproximado</strong>, que nuestro proveedor de
            alojamiento deduce de tu conexión y que usamos solo para mostrarte los teléfonos de
            ayuda adecuados si tus respuestas sugieren que lo estás pasando mal. No lo
            guardamos.
          </li>
          <li>
            <strong className="text-white">Registros técnicos</strong>: tu dirección IP y los
            datos de tu navegador, en los registros del servidor y de errores. Los usamos para
            mantener el servicio en marcha y para impedir abusos.
          </li>
        </ul>
        <p>
          No te pedimos tu fecha de nacimiento, tu domicilio ni ningún documento de identidad, y
          no deberías incluirlos en una respuesta de texto libre.
        </p>
      </LegalSection>

      <LegalSection id="sensitive" title="Información sensible, y lo que escribes en texto libre">
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">
              Si puedes, evita incluir datos de categorías especiales en una respuesta de texto
              libre.
            </strong>{' '}
            No necesitas revelar un problema de salud, una discapacidad, tu religión, tu origen
            étnico, tu orientación sexual, tus opiniones políticas ni tu afiliación sindical para
            obtener un informe útil.
          </p>
        </div>
        <p>
          Las preguntas de texto libre preguntan con qué te ha costado, qué te da miedo y cómo
          quieres que sea tu vida. Algunas personas responden con información que se considera{' '}
          <strong className="text-white">datos de categorías especiales</strong> según el
          artículo 9 del RGPD, sobre todo de salud o discapacidad.
        </p>
        <p>
          No la pedimos, no la queremos y nada del modelo de puntuación la busca. Pero si la das
          por tu cuenta, necesariamente la tratamos para elaborar el informe que nos pediste.
        </p>
        <p>
          Cuando eso ocurre, nos basamos en{' '}
          <strong className="text-white">tu consentimiento explícito</strong> según el artículo
          9.2.a). Cada pregunta escrita te recuerda que no incluyas esos datos. Antes de ver tus
          resultados hay una casilla, sin marcar, con la que puedes consentir que usemos los
          datos sensibles que hayas escrito para redactar tu informe y para revisarlos en busca de
          señales de angustia. Guardamos con tus respuestas si la marcaste y cuándo. Marcarla es
          opcional: si prefieres no hacerlo, vuelve atrás y quita esos datos, y recibirás tus
          resultados igualmente. Puedes retirar tu consentimiento en cualquier momento pidiéndonos
          que borremos el informe o eliminando tu cuenta. Nada de ello llega nunca a tu
          universidad.
        </p>
      </LegalSection>

      <LegalSection id="distress" title="Detección de señales de angustia">
        <p>
          Un cuestionario que pregunta a estudiantes en qué han fracasado recibirá a veces
          respuestas que describen una angustia real. Para que el servicio no responda a algo así
          enumerando alegremente áreas profesionales,{' '}
          <strong className="text-white">
            tus respuestas de texto libre se comparan con una lista fija de expresiones
          </strong>
          , en inglés y en español, que pueden indicar autolesiones o pensamientos suicidas. Si
          alguna coincide, mostramos información de apoyo encima de tu informe e indicamos a la IA
          que escriba en un tono más delicado.
        </p>
        <p>Debes saber exactamente qué es esto y qué no es:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Es una <strong className="text-white">búsqueda de palabras, no una evaluación</strong>.
            Se le escaparán cosas, y a veces saltará con frases inocentes.
          </li>
          <li>
            <strong className="text-white">El resultado nunca se guarda.</strong> Existe solo
            durante una solicitud y después desaparece: no se escribe en nuestra base de datos, no
            se vincula a tu cuenta, nadie lo ve y nunca se pasa a tu universidad.
          </li>
          <li>No bloquea ni retrasa tu informe, y no cambia tus resultados profesionales.</li>
          <li>
            <strong className="text-white">No nos avisa</strong>, y no se notifica a ninguna
            persona. No vigilamos a nadie.
          </li>
        </ul>
        <p>
          Los teléfonos de ayuda que mostramos dependen de dónde estés: el país de tu universidad
          asociada si la tienes y, si no, el país aproximado de tu conexión. Donde no tenemos una
          lista local, mostramos un directorio internacional.
        </p>
        <p>
          Lo diseñamos así a propósito: una deducción sobre la salud mental de alguien es un dato
          de categoría especial, y guardarla crearía un registro sobre ti que nunca nos pediste.
        </p>
        <p>
          Si ahora mismo estás en peligro, llama al número de emergencias local: el 112 en
          cualquier país de Europa, el 999 en el Reino Unido.
        </p>
      </LegalSection>

      <LegalSection id="ai" title="Usamos IA para redactar tu informe">
        <p>
          <strong className="text-white">
            Tus respuestas las trata un sistema de inteligencia artificial.
          </strong>{' '}
          Cuando pides un informe, enviamos a OpenAI tus respuestas a la evaluación, incluido el
          texto libre, tus puntuaciones por área profesional y el idioma en que usas el sitio.
          Para la hoja de ruta también enviamos tus respuestas de seguimiento y el primer
          informe, para que la hoja de ruta se apoye en él. Si llegaste a través de una
          universidad, indicamos a la IA en qué país está, para que sus consejos encajen con el
          lugar donde estudias. Esto es el núcleo de lo que hace el producto, así que no hay
          forma de usar el servicio sin ello.
        </p>
        <p>
          No enviamos tu nombre, tu dirección de correo electrónico, tus datos de pago, tu
          identificador de cuenta ni tu dirección IP.
        </p>
        <p>
          OpenAI trata estos datos siguiendo nuestras instrucciones, como encargado del
          tratamiento, conforme a su acuerdo de tratamiento de datos. Según sus condiciones de
          la API, los datos enviados a través de la API no se usan para entrenar sus modelos;
          OpenAI los guarda hasta 30 días para detectar abusos y después los borra. Su
          tratamiento se realiza en Estados Unidos.
        </p>
        <p>
          El texto generado por IA puede ser erróneo, y a veces con mucha seguridad. Tu informe
          es información para reflexionar, no asesoramiento profesional de orientación, y nunca
          una predicción de lo que te va a pasar. Consulta nuestras{' '}
          <a className="text-indigo-300 underline" href="/terms">
            Términos del servicio
          </a>{' '}
          para saber qué significa eso.
        </p>
      </LegalSection>

      <LegalSection id="improving" title="Cómo usamos tus respuestas para mejorar el servicio">
        <p>
          Un cuestionario de orientación profesional es tan bueno como las pruebas que lo
          respaldan. Las únicas pruebas que tenemos son lo que la gente respondió de verdad y lo
          que le parecieron los informes, así que{' '}
          <strong className="text-white">
            estudiamos las respuestas y los resultados que ya tenemos para mejorar el servicio.
          </strong>{' '}
          Preferimos decirlo claramente aquí que describirlo de forma vaga como
          &laquo;analítica&raquo;.
        </p>

        <p className="font-medium text-white">Qué hacemos exactamente</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Encontrar preguntas confusas, mal redactadas o que nadie responde, y reescribirlas o
            quitarlas.
          </li>
          <li>
            Comprobar si el modelo de puntuación da resultados razonables, y cambiar los pesos que
            lo sostienen cuando no es así.
          </li>
          <li>
            Ver dónde los informes son flojos, repetitivos o poco útiles, y mejorar las
            instrucciones que damos a la IA que los redacta.
          </li>
          <li>
            Leer las valoraciones y comentarios que la gente deja sobre los informes, y ver qué
            tienen en común.
          </li>
          <li>Entender en qué partes del servicio abandona la gente, y arreglarlas.</li>
        </ul>

        <p className="font-medium text-white">Cómo lo hacemos</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              Siempre que la pregunta se pueda responder con cifras, usamos cifras
            </strong>
            : recuentos, medias y patrones entre muchas personas, no un recorrido por cuentas
            individuales.
          </li>
          <li>
            Cuando necesitamos ver el contenido de las respuestas, trabajamos con{' '}
            <strong className="text-white">datos de los que se han quitado los datos identificativos</strong>
            : sin dirección de correo, sin nombre, sin identificador de cuenta, sin registro de
            pago.
          </li>
          <li>
            <strong className="text-white">Podemos usar herramientas de IA para esa lectura.</strong>{' '}
            No es práctico leer a mano miles de respuestas de texto libre, así que podemos pedir a
            un sistema de IA que resuma temas y patrones entre ellas. Eso va al mismo proveedor
            que aparece más abajo, en las mismas condiciones, y ve las respuestas sin los datos
            que te identifican.
          </li>
          <li>
            Nada de lo que aprendemos se publica de forma que pueda identificarte, y ningún
            informe ni respuesta individual se muestra nunca a nadie fuera de {BRAND.name}.
          </li>
        </ul>

        <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 p-4">
          <p className="text-sm text-indigo-100">
            <strong className="font-semibold">Lo que nunca hacemos con ellos.</strong> No vendemos
            tus datos ni los compartimos con nadie que quiera venderte algo. No los usamos para
            publicidad ni construimos con ellos un perfil comercial. Y nunca los usamos para
            tomar una decisión sobre ti.
          </p>
          <p className="mt-3 text-sm text-indigo-100">
            <strong className="font-semibold">
              No entrenamos modelos de IA con tus datos. Ni los nuestros, ni los de nuestros
              proveedores, ni los de nadie.
            </strong>{' '}
            Usar una IA para leer y resumir respuestas no es lo mismo que entrenarla: el modelo
            recibe un texto, responde y no guarda nada después.
          </p>
          <p className="mt-3 text-sm text-indigo-100">
            Si algún día decidimos que sí queremos entrenar un modelo con lo que nos ha contado la
            gente,{' '}
            <strong className="font-semibold">antes te lo preguntaremos.</strong> No trataremos
            esta política, ni el hecho de que la aceptaras una vez, como permiso para ello.
          </p>
        </div>

        <p className="font-medium text-white">La información sensible queda fuera</p>
        <p>
          Si diste información de categoría especial en una respuesta de texto libre (lo más
          frecuente, sobre salud o discapacidad),{' '}
          <strong className="text-white">
            se usa solo para redactar tu propio informe y queda excluida de este trabajo.
          </strong>{' '}
          Diste tu consentimiento explícito para lo primero y no para lo segundo, y no vamos a
          tratar uno como si cubriera el otro.
        </p>

        <p className="font-medium text-white">Por qué podemos hacerlo, y cómo decir que no</p>
        <p>
          Nos basamos en el <strong className="text-white">interés legítimo</strong>. Nuestro
          interés es construir un cuestionario que funcione; el tuyo, que no te estudien sin
          decírtelo. Hemos ponderado ambos y concluido que esto no prevalece sobre tus derechos,
          porque el trabajo se hace con datos sin identificar o agregados, no se publica nada
          sobre ti, nadie fuera de {BRAND.name} ve tus respuestas y no se toma ninguna decisión
          sobre ti.
        </p>
        <p>
          <strong className="text-white">Puedes oponerte, y pararemos.</strong> Escribe a{' '}
          {privacyLink} y excluiremos tus respuestas y resultados de este trabajo. No te cuesta
          nada: tus informes, tu historial y tu acceso no cambian, y no te pediremos que lo
          justifiques.
        </p>
        <p>
          Esto se aplica a todo el mundo por igual,{' '}
          <strong className="text-white">
            tanto si pagas tu propio acceso como si lo paga una universidad
          </strong>
          . Es algo distinto de los totales anónimos que ve tu universidad, que se explican a
          continuación, y oponerte a uno no es oponerte al otro: dinos si quieres quedar fuera
          de ambos.
        </p>
      </LegalSection>

      <LegalSection id="universities" title="Si tu universidad te da acceso">
        <p>
          Algunas universidades pagan para que sus estudiantes usen {BRAND.name}. Si te
          registras con una dirección de correo confirmada de uno de los dominios de una
          universidad asociada, recibes automáticamente el acceso gratuito de esa universidad.
          Para ello usamos el dominio de tu dirección de correo, y nada más sobre ti.
        </p>
        <p>
          <strong className="text-white">
            Tu universidad nunca ve tus respuestas, tus informes, tus comentarios ni tu nombre.
          </strong>{' '}
          El personal que nos designa ve un panel con totales de todos sus estudiantes juntos:
          cuántos se han unido, cuántos informes y hojas de ruta se generaron y en qué meses, qué
          áreas profesionales aparecen con más frecuencia como las más fuertes de los
          estudiantes, y la valoración media que los estudiantes dieron a sus informes.{' '}
          <strong className="text-white">
            Cualquier cifra basada en menos de cinco estudiantes se oculta
          </strong>
          , para que un número no pueda señalar a una persona. Estos totales son anónimos: no te
          identifican y no son datos personales sobre ti.
        </p>
        <p>
          Tu universidad no tiene forma de buscarte, y no le enviamos nada sobre ti
          individualmente: ni si te uniste, ni si terminaste, ni lo que se te recomendó. Nuestro
          contrato con cada universidad le prohíbe intentar identificar a estudiantes a partir de
          los totales y usar {BRAND.name} para tomar cualquier decisión sobre un estudiante,
          como la admisión, la calificación o la disciplina.
        </p>
        <p className="font-medium text-white">Por qué podemos hacerlo</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Vincular tu cuenta a tu universidad, para que tengas el acceso que paga, forma parte
            de prestarte el servicio en el que te registraste (contrato).
          </li>
          <li>
            Contarte en los totales anónimos responde a nuestro interés legítimo y al de la
            universidad: le muestra que el acceso que paga se está usando, y hacia qué carreras
            se inclinan sus estudiantes, sin decirle nada sobre ningún estudiante concreto.
          </li>
        </ul>
        <p>
          Puedes oponerte a que te cuenten. Escribe a {privacyLink} y quitaremos tus resultados
          de las cifras de tu universidad; conservas tu acceso gratuito. Si prefieres no tener
          ningún vínculo con tu universidad, usa una dirección de correo personal y compra el
          acceso tú.
        </p>
        <p>
          Aparte de los totales, tus respuestas y resultados también se usan para mejorar el
          servicio, exactamente igual que los de cualquier persona que paga su propio acceso: ni
          más porque haya una universidad de por medio, ni menos.{' '}
          <a className="text-indigo-300 underline" href="#improving">
            Cómo funciona y cómo oponerte
          </a>
          .
        </p>
        <p>
          <strong className="text-white">Cuando termina una licencia</strong>, tu cuenta y tus
          informes siguen siendo tuyos. Solo se acaban los intentos gratuitos; lo que compraste
          tú no cambia.
        </p>
      </LegalSection>

      <LegalSection id="university-staff" title="Si trabajas en una universidad asociada">
        <p>
          Si tu universidad te ha designado como alguien que puede ver su panel, nos dio tu
          dirección de correo del trabajo. La usamos solo para que puedas entrar en ese panel y
          para contactarte sobre la licencia de la universidad. Nos basamos en nuestro interés
          legítimo en cumplir nuestro acuerdo con tu universidad.
        </p>
        <p>
          Guardamos tu dirección hasta que la universidad nos pida retirarte, y como máximo 12
          meses después de que termine su acuerdo con nosotros. Tienes los mismos derechos que
          cualquier otra persona en esta página.
        </p>
      </LegalSection>

      <LegalSection id="our-access" title={`Quién en ${BRAND.name} puede ver tus datos`}>
        <p>
          Solo los fundadores de {BRAND.name} pueden acceder a la base de datos donde se guardan
          tus respuestas e informes, y entran en ella con verificación en dos pasos.{' '}
          <strong className="text-white">Poder acceder no da permiso para leer.</strong> Según
          nuestras normas escritas, un fundador abre las respuestas, puntuaciones o informes de
          una persona identificada solo:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            cuando tú nos lo pides: para ayudarte, para que una persona revise un resultado, o
            para ver, corregir, exportar o borrar tus datos;
          </li>
          <li>para arreglar un fallo que no se puede arreglar de otra forma, mirando solo lo necesario;</li>
          <li>para investigar un mal uso del servicio o un incidente de seguridad; o</li>
          <li>cuando la ley lo exige.</li>
        </ul>
        <p>
          Cada vez, anotamos quién miró, cuándo y por qué. Nuestras pantallas de administración no
          muestran las respuestas ni los informes de nadie. Nunca leemos cuentas por curiosidad,
          nunca contamos a nadie lo que escribió una persona y nunca citamos las respuestas ni el
          informe de nadie en nuestra publicidad. El trabajo de mejora descrito más arriba usa
          copias sin tus datos identificativos.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Quién más trata tus datos">
        <p>
          Estos son todos los terceros a los que enviamos datos personales, y lo que recibe cada
          uno. No vendemos tus datos. La mayoría de estas empresas trabaja solo siguiendo
          nuestras instrucciones y no puede usarlos para sus propios fines. Tres deciden algunas
          cosas por sí mismas, según sus propias políticas de privacidad:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Stripe</strong> también usa los datos de pago para
            sus propios fines como proveedor de pagos, como prevenir el fraude y cumplir sus
            obligaciones legales. Su{' '}
            <a
              className="text-indigo-300 underline"
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad
            </a>{' '}
            explica cómo.
          </li>
          <li>
            <strong className="text-white">Google</strong>, si eliges iniciar sesión con Google:
            el inicio de sesión se hace en tu cuenta de Google, según las condiciones de Google.
          </li>
          <li>
            <strong className="text-white">El buzón del final de la tabla</strong>: hasta que
            pasemos a un buzón de empresa, es una cuenta normal de Gmail que Google gestiona con
            sus propias condiciones.
          </li>
        </ul>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-4 font-medium">Empresa</th>
                <th className="py-2 pr-4 font-medium">Para qué</th>
                <th className="py-2 pr-4 font-medium">Qué recibe</th>
                <th className="py-2 font-medium">Dónde</th>
              </tr>
            </thead>
            <tbody>
              {subprocessorsEs().map((s) => (
                <tr key={s.name} className="border-b border-white/10 align-top">
                  <td className="py-3 pr-4 font-medium text-white">{s.name}</td>
                  <td className="py-3 pr-4 text-gray-300">{s.purpose}</td>
                  <td className="py-3 pr-4 text-gray-300">{s.data}</td>
                  <td className="py-3 text-gray-400">{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Las universidades asociadas no están en esta lista porque no reciben de nosotros datos
          personales, solo los totales anónimos descritos más arriba.
        </p>
        <p>
          Algunas de estas empresas tratan datos fuera del Espacio Económico Europeo, sobre todo
          en Estados Unidos. Cada transferencia está cubierta por una garantía reconocida del
          capítulo V del RGPD: una decisión de adecuación cuando existe (incluido el Marco de
          Privacidad de Datos UE-EE. UU., cuando la empresa está certificada) o, si no, las
          cláusulas contractuales tipo de la Comisión Europea. Cuando la ley de otro país también
          rige tus datos (por ejemplo, si vives en el Reino Unido o en Suiza), nos acogemos
          también a las garantías equivalentes de ese país. Pídenos una copia de la garantía que
          se aplica.
        </p>
      </LegalSection>

      <LegalSection id="lawful-basis" title="Por qué podemos hacerlo">
        <p>
          Nos basamos en estas bases del artículo 6 del RGPD, y en las mismas bases de las leyes
          equivalentes de otros países cuando se te aplican:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Contrato</strong>: para tu cuenta, tu evaluación, tus
            informes, tus pagos y el acceso gratuito que te da una universidad asociada. No
            podemos prestar el servicio sin tratar estos datos.
          </li>
          <li>
            <strong className="text-white">Interés legítimo</strong>: para los registros de
            seguridad, la limitación de solicitudes y la corrección de fallos; para{' '}
            <a className="text-indigo-300 underline" href="#improving">
              estudiar respuestas y resultados para mejorar el servicio
            </a>
            ; para contarte en los totales anónimos de tu universidad; para deducir tu país
            aproximado y mostrar los teléfonos de ayuda adecuados; y para los datos de contacto
            del personal universitario. En cada caso los datos son los mínimos y puedes
            oponerte.
          </li>
          <li>
            <strong className="text-white">Obligación legal</strong>: para conservar los
            registros de ventas a efectos fiscales, para tramitar y dejar constancia de una compra
            que cancelas, y para responder a una reclamación y conservarla, con nuestra respuesta,
            durante los tres años que exige la ley húngara de consumo.
          </li>
          <li>
            <strong className="text-white">Consentimiento explícito</strong>: solo para los datos
            de categorías especiales que decidas escribir en una respuesta de texto libre, como se
            explica más arriba.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="automated"
        title="Tratamiento automatizado, y si una máquina decide algo sobre ti"
      >
        <p>
          A tus respuestas les ocurren dos cosas automatizadas: un{' '}
          <strong className="text-white">modelo de puntuación fijo</strong> ordena las áreas
          profesionales, y un <strong className="text-white">sistema de IA</strong> redacta un
          informe. Ambas son automatizadas y, juntas, constituyen elaboración de perfiles en el
          sentido que da a esa expresión la ley de protección de datos.
        </p>
        <p>
          <strong className="text-white">Ninguna de las dos toma una decisión sobre ti.</strong>{' '}
          Nada de esto determina si consigues un trabajo, una plaza en unos estudios, una nota,
          un crédito, una ayuda ni ninguna otra cosa. El resultado es información para que la
          tengas en cuenta, todas las decisiones siguen siendo tuyas, y el contrato prohíbe a las
          universidades asociadas usarlo para decidir nada sobre un estudiante.
        </p>
        <p>
          Por eso no consideramos aplicable el artículo 22 (el derecho a no ser objeto de una
          decisión basada únicamente en un tratamiento automatizado que produzca efectos
          jurídicos o te afecte significativamente de modo similar). Te explicamos nuestro
          razonamiento en lugar de pedirte que te fíes, y si no estás de acuerdo tienes derecho a
          decírnoslo.
        </p>
        <p>Con independencia de ese análisis, y sin aceptar que estemos obligados:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>te explicaremos con palabras sencillas la lógica del modelo de puntuación si lo pides;</li>
          <li>
            puedes pedir que una persona de nuestro equipo revise un informe o unas puntuaciones
            y te dé su propia opinión; y
          </li>
          <li>puedes decirnos que crees que un resultado es erróneo, y lo revisaremos.</li>
        </ul>
        <p>
          Esa revisión es una comprobación de nuestro propio equipo. No es orientación
          psicológica ni el consejo de un psicólogo o de un profesional de la orientación.
        </p>
        <p>
          Pídelo en {privacyLink}. El{' '}
          <a className="text-indigo-300 underline" href="/ai-notice">
            Aviso de transparencia sobre la IA
          </a>{' '}
          explica lo que la IA puede y no puede hacer.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="Cuánto tiempo lo guardamos">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-4 font-medium">Qué</th>
                <th className="py-2 pr-4 font-medium">Cuánto tiempo</th>
                <th className="py-2 font-medium">Por qué</th>
              </tr>
            </thead>
            <tbody>
              {retentionEs().map((r) => (
                <tr key={r.what} className="border-b border-white/10 align-top">
                  <td className="py-3 pr-4 font-medium text-white">{r.what}</td>
                  <td className="py-3 pr-4 text-gray-300">{r.how_long}</td>
                  <td className="py-3 text-gray-400">{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="deletion" title="Borrar tus datos">
        <p>
          Puedes eliminar tu cuenta y todo lo vinculado a ella desde la configuración de tu
          cuenta. Se borran tu perfil, tus respuestas a la evaluación, tu progreso guardado,
          todos los informes que generamos para ti y tu vínculo con cualquier universidad
          asociada. Es inmediato y no se puede deshacer. Los totales de tu universidad
          simplemente dejan de contarte.
        </p>
        <p>
          Tampoco guardamos una cuenta que nadie usa. Si no has usado la tuya en cuatro años, te
          escribimos a la dirección que tiene. Si tres meses después de ese correo no has iniciado
          sesión, eliminamos la cuenta del mismo modo. Iniciar sesión antes de ese plazo la
          conserva. <strong className="text-white">Nunca lo hacemos con una cuenta que aún tenga
          un intento que pagaste y no has usado, o uno que empezaste y no terminaste</strong>: esa
          cuenta se queda hasta que la elimines tú.
        </p>
        <p>
          Los registros de pagos son la única excepción: la ley de contabilidad húngara nos
          obliga a conservar durante ocho años los registros de cada venta. Quitamos de ellos tu
          nombre y tu correo cuando podemos, y dejamos solo lo que exige la ley. Si cancelaste una
          compra, conservamos lo que nos enviaste durante el mismo tiempo, con tu nombre, porque
          es la prueba de que cancelaste a tiempo y de que te devolvimos el dinero.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Tus derechos">
        <p>
          Según el RGPD (y según leyes parecidas de otros lugares, como el RGPD del Reino Unido si
          vives allí), puedes pedirnos que:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Te demos una copia de tus datos: hay un botón para exportarlos en la configuración de tu cuenta</li>
          <li>Corrijamos lo que esté mal</li>
          <li>Borremos tus datos</li>
          <li>Limitemos su uso o dejemos de usarlos, incluido que te contemos en los totales de tu universidad</li>
          <li>Entreguemos tus datos a otro proveedor en un formato portable</li>
        </ul>
        <p>
          Ofrecemos estos derechos a todo el mundo, vivas donde vivas. Escribe a {privacyLink} y
          responderemos <strong className="text-white">en el plazo de un mes</strong>. Si tu
          solicitud es compleja, o has hecho varias, podemos ampliarlo hasta dos meses más, y te
          lo diremos dentro del primer mes si lo hacemos.
        </p>
        <p>
          Ejercer estos derechos es gratuito. Solo podemos cobrar un canon razonable, o negarnos,
          si una solicitud es manifiestamente infundada o excesiva, y si alguna vez lo hacemos te
          explicaremos por qué. Si no podemos saber si una solicitud viene de ti, podemos pedirte
          que la confirmes desde la dirección de la cuenta; no te exigiremos documentos de
          identidad.
        </p>
        <p>
          Algunos derechos tienen límites. No podemos borrar los registros de pagos que la ley nos
          obliga a conservar, y podemos guardar una nota mínima de que nos pediste borrar algo,
          para poder demostrar que lo hicimos.
        </p>
        <p>
          Si crees que hemos tratado mal tus datos, puedes reclamar ante una autoridad de
          protección de datos en cualquier momento, sin tener que acudir antes a nosotros, aunque
          preferiríamos que nos lo dijeras para poder arreglarlo.
        </p>
        <p>
          Nuestra autoridad de control principal es la húngara,{' '}
          <strong className="text-white">
            Nemzeti Adatvédelmi és Információszabadság Hatóság
          </strong>{' '}
          (NAIH, Autoridad Nacional de Protección de Datos y Libertad de Información), 1055
          Budapest, Falk Miksa utca 9&ndash;11, Hungría,{' '}
          <a className="text-indigo-300 underline" href="mailto:ugyfelszolgalat@naih.hu">
            ugyfelszolgalat@naih.hu
          </a>
          ,{' '}
          <a
            className="text-indigo-300 underline"
            href="https://naih.hu"
            target="_blank"
            rel="noopener noreferrer"
          >
            naih.hu
          </a>
          . También puedes reclamar ante la autoridad del país donde vives o trabajas: en España,
          la{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agencia Española de Protección de Datos
          </a>
          ; fuera del Espacio Económico Europeo, tu autoridad nacional de protección de datos,
          como la{' '}
          <a
            className="text-indigo-300 underline"
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Information Commissioner&rsquo;s Office
          </a>{' '}
          en el Reino Unido. También tienes derecho a acudir a los tribunales.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies y lo que guardamos en tu dispositivo">
        <p>
          Usamos unas pocas cookies estrictamente necesarias para mantener tu sesión iniciada, una
          que recuerda tu idioma si eliges uno, y un poco de almacenamiento de sesión del
          navegador para llevar tus respuestas de una página a otra. No usamos cookies
          publicitarias ni seguimiento entre sitios, y por eso no ves un aviso de cookies.
        </p>
        <p>
          La lista completa (nombres, finalidades y duración, incluidas las cookies que Stripe y
          Google ponen en sus propias páginas) está en nuestra{' '}
          <a className="text-indigo-300 underline" href="/cookies">
            Política de cookies
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="age" title="Si tienes menos de 18 años">
        <p>
          Necesitas tener al menos {MINIMUM_AGE} años para tener una cuenta, en cualquier país.
          Algunos países permiten que personas más jóvenes se registren solas en servicios en
          línea; nosotros hemos elegido {MINIMUM_AGE} en todas partes porque las preguntas son
          personales y el informe trata sobre decisiones vitales. Si tienes menos de{' '}
          {MINIMUM_AGE}, pide a tu madre, a tu padre o a tu tutor que abra una cuenta y la use
          contigo.
        </p>
        <p>
          Si crees que un menor de {MINIMUM_AGE} años nos ha dado sus datos, escribe a{' '}
          {privacyLink} y los borraremos.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Cambios en esta política">
        <p>
          Si cambiamos cómo usamos tus datos, actualizaremos esta página y la fecha de arriba. Si
          el cambio es importante, te escribiremos en lugar de esperar a que te des cuenta.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
