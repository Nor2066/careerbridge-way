// The 404 page and the sample report.
import type { Entry } from './types';

export const misc = {
  'notFound.title': { en: 'That page isn’t here', es: 'Esa página no existe' },
  'notFound.body': {
    en: 'The link may be out of date, or the page may have moved. Your account and any reports you have generated are unaffected.',
    es: 'Puede que el enlace esté anticuado o que la página se haya movido. Tu cuenta y los informes que hayas generado no se ven afectados.',
  },
  'notFound.home': { en: 'Go to the homepage', es: 'Ir a la página de inicio' },
  'notFound.assess': { en: 'Take the assessment', es: 'Hacer la evaluación' },
  'notFound.history': { en: 'Looking for a report you already generated?', es: '¿Buscas un informe que ya generaste?' },

  'sample.example.strong': { en: 'This is an example.', es: 'Esto es un ejemplo.' },
  'sample.example.rest': {
    en: ' It was written for a made-up person so you can see the format before you buy. Yours will be based on your own answers.',
    es: ' Está escrito para una persona inventada, para que veas el formato antes de comprar. El tuyo se basará en tus propias respuestas.',
  },
  'sample.title': { en: 'What your report looks like', es: 'Así es tu informe' },
  'sample.intro': {
    en: 'Every assessment produces a breakdown of your strongest career clusters and a written report explaining why you fit them. The follow-up adds specific roles, qualifications, and a three-month plan.',
    es: 'Cada evaluación genera un desglose de tus áreas profesionales más fuertes y un informe escrito que explica por qué encajas en ellas. El seguimiento añade puestos concretos, titulaciones y un plan de tres meses.',
  },
  'sample.top3': { en: 'Top 3 career clusters', es: 'Tus 3 áreas profesionales principales' },
  'sample.cluster.1': { en: 'Healthcare & Wellbeing', es: 'Salud y bienestar' },
  'sample.cluster.2': { en: 'Education & Training', es: 'Educación y formación' },
  'sample.cluster.3': { en: 'Social & Community', es: 'Social y comunitario' },
  'sample.reportTitle': { en: 'Your personalised career report', es: 'Tu informe de carrera personalizado' },
  'sample.report': {
    en: `Thank you for taking the time to work through the assessment properly — the detail in your answers makes a real difference to what follows.

Your three strongest clusters are Healthcare & Wellbeing, Education & Training, and Social & Community. That combination is a coherent one rather than a coincidence, and it says something specific about you.

Healthcare & Wellbeing came out highest, driven mainly by how you rated empathy and working under pressure, and by your comfort with responsibility. You described wanting work where the outcome of a good day is that someone is better off. That is the thread running through this cluster: the value is delivered to a person, and you can see it land.

Education & Training follows closely, and for related reasons. Your communication and patience scores are high, and you wrote about explaining things to people who had been made to feel stupid elsewhere. Teaching rewards the same instinct as care work — noticing where somebody actually is, rather than where the material assumes they are.

Social & Community rounds out the picture. Your answers on values placed fairness and stability above income and status. That does not mean you should expect to earn little; it means you are unlikely to stay somewhere that pays well and asks you to be indifferent.

Two things worth naming honestly. You rated your tolerance for uncertainty on the lower side, which sits awkwardly with parts of frontline healthcare where shifts and workload are unpredictable. And you said you would rather not relocate, which narrows some routes considerably. Neither is a problem — both are worth deciding about deliberately rather than discovering later.

The follow-up questionnaire is where this becomes concrete: specific roles, the qualifications each one needs, and a realistic sense of what the next three months could look like.`,
    es: `Gracias por dedicar tiempo a hacer la evaluación con calma: el detalle de tus respuestas marca una diferencia real en lo que viene a continuación.

Tus tres áreas más fuertes son Salud y bienestar, Educación y formación, y Social y comunitario. Esa combinación tiene coherencia, no es casualidad, y dice algo concreto sobre ti.

Salud y bienestar ha salido en primer lugar, sobre todo por cómo valoraste tu empatía y tu capacidad de trabajar bajo presión, y por lo cómodo que te sientes con la responsabilidad. Describiste querer un trabajo en el que, al final de un buen día, alguien esté mejor. Ese es el hilo de esta área: el valor llega a una persona, y puedes ver cómo llega.

Educación y formación le sigue muy de cerca, por motivos parecidos. Tus puntuaciones en comunicación y paciencia son altas, y escribiste sobre explicar cosas a personas a las que en otros sitios habían hecho sentir torpes. La enseñanza premia el mismo instinto que el trabajo de cuidados: fijarte en dónde está de verdad alguien, no en dónde da por hecho el temario que está.

Social y comunitario completa el cuadro. En tus valores pusiste la justicia y la estabilidad por encima de los ingresos y el estatus. Eso no significa que debas esperar ganar poco; significa que difícilmente te quedarás en un sitio que pague bien y te pida que te dé igual todo.

Dos cosas que conviene decir con sinceridad. Valoraste tu tolerancia a la incertidumbre en la parte baja, lo que encaja mal con algunos puestos sanitarios de primera línea, donde los turnos y la carga de trabajo son imprevisibles. Y dijiste que preferirías no mudarte, lo que reduce bastante algunos caminos. Ninguna de las dos es un problema; ambas merecen decidirse a conciencia en lugar de descubrirlas más tarde.

El cuestionario de seguimiento es donde todo esto se concreta: puestos específicos, las titulaciones que exige cada uno y una idea realista de cómo podrían ser los próximos tres meses.`,
  },
  'sample.disclaimer.before': {
    en: 'Reports are generated by AI from your answers. They are information to think about alongside people who know you — not professional careers advice, and not a prediction. See our ',
    es: 'Los informes los genera una IA a partir de tus respuestas. Son información para reflexionar junto a personas que te conocen, no asesoramiento profesional ni una predicción. Consulta nuestros ',
  },
  'sample.disclaimer.terms': { en: 'terms', es: 'términos' },
  'sample.disclaimer.after': { en: ' for what that means.', es: ' para saber qué significa.' },
  'sample.assess': { en: 'Take the assessment', es: 'Hacer la evaluación' },
  'sample.pricing': { en: 'See pricing', es: 'Ver precios' },
} satisfies Record<string, Entry>;
