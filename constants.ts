import { AntimethodStage, DailyActivityGoal, ActivityCategory, Resource, Skill, ActivityDetailType, RewardItem, DashboardCardDisplayMode, Language, AppTheme } from './types';

export const COLORS = {
  primary: '#4a148c', // Deep Purple (Main App Color)
  secondary: '#7b1fa2', // Medium Purple (Secondary Elements)
  accent: '#9c27b0', // Lighter Purple (Accent, Buttons, Highlights)
  lightPurple: '#d1c4e9', // Very Light Purple (Background Tints, Borders)
  
  appBgLight: '#f8f7fa', // Light App Background
  cardBgLight: '#ffffff', // Light Card Background
  textMainLight: '#333333', // Dark Text on Light Background
  textLightLight: '#666666', // Lighter Text on Light Background

  appBgDark: '#121212', // Very Dark Gray/Black (Dark App Background) - Material Dark
  cardBgDark: '#1E1E1E', // Darker Gray (Dark Card Background) - Material Darker Surface
  textMainDark: '#E0E0E0', // Light Gray Text on Dark Background
  textLightDark: '#B0B0B0', // Dimmer Text on Dark Background
  
  error: '#ef4444', // Red-500
  success: '#22c55e', // Green-500
  warning: '#f97316', // Orange-500
  inputBorderLight: '#cbd5e1', // approx. gray-300
  inputBgLight: '#ffffff',
  inputTextLight: '#111827', // approx. gray-900
  placeholderTextLight: '#9ca3af', // approx. gray-400

  inputBorderDark: '#4B5563', // Gray-600 for dark theme
  inputBgDark: '#374151',    // Gray-700 for dark theme
  inputTextDark: '#F3F4F6',    // Gray-100 for dark theme
  placeholderTextDark: '#9CA3AF', // Gray-400 (can remain same or be lighter)
};


// Specific colors for charts, especially for dark backgrounds
export const CHART_COLORS = {
  cardBackgroundDark: COLORS.cardBgDark, // Dark background for chart cards
  textOnDark: COLORS.textMainDark,         // Light text for dark cards
  gridLineDark: '#4B5563',       // Grid lines on dark cards
  primaryLineBarDark: COLORS.accent, // Vibrant purple for lines/bars
  tooltipBackgroundDark: '#374151', // Darker gray for tooltips
  tooltipBorderDark: '#4B5563',
  gaugeTrackDark: '#374151', // Track for the gauge (darker part)
  gaugeRemainingDark: '#4B5563', // Similar to grid lines for remaining part of gauge
};


export const CATEGORY_COLORS_CHART_HEX: Record<ActivityCategory, string> = {
  [ActivityCategory.ACTIVE_IMMERSION]: '#8A3FFC', // Vibrant Purple
  [ActivityCategory.PASSIVE_IMMERSION]: '#3B82F6', // Blue-500
  [ActivityCategory.ACTIVE_STUDY]: '#6366F1',     // Indigo-500
  [ActivityCategory.PRODUCTION]: '#14B8A6',       // Teal-500
};

export const SKILL_COLORS_CHART_HEX: Record<Skill, string> = {
  [Skill.LISTENING]: '#8A3FFC',   // Vibrant Purple (same as Active Immersion for consistency)
  [Skill.READING]: '#6366F1',     // Indigo (same as Active Study, can be changed)
  [Skill.SPEAKING]: '#14B8A6',    // Teal (same as Production)
  [Skill.WRITING]: '#3B82F6',     // Blue (same as Passive Immersion, can be changed)
  [Skill.STUDY]: '#A855F7',       // Lighter Purple (distinct for study)
};


export const HOUR_MILESTONES = [50, 100, 150, 250, 350, 500, 750, 1000];
export const LEARNING_DAY_POINTS_AWARD = 10;
export const HABIT_POINTS_MAP = { // Points for habit completion percentage
  SOME: 2,  // 1-39%
  HALF: 5,  // 40-74%
  GOOD: 8,  // 75-99%
  FULL: 12, // 100%
};


export const STAGE_DETAILS: Record<AntimethodStage, { name: string; description: string; longDescription: string; objective: string; keyObjectives?: string[]; successTips?: string[]; commonChallenges?: string[]; nextStageCriteria?: string[]; }> = {
  [AntimethodStage.ONE]: {
    name: "Primera etapa: preparación previa",
    description: "Rampa de acceso al input real. Aprender vocabulario (Anki) y usar apps de idiomas (Busuu).",
    objective: "Construir un vocabulario base inicial (ej. ~1000 palabras más frecuentes), familiarizarse con las estructuras y sonidos más básicos del idioma, establecer el hábito y el contacto diario con el idioma, y prepararse para la futura inmersión.",
    longDescription: `El objetivo de esto es utilizarla como una rampa de acceso para lanzarnos más fácilmente al input real, porque es mucho más eficaz que lanzarnos a la inmersión de una, ya que el input debe ser en parte comprensible.

Para este paso recomendamos empezar aprendiendo vocabulario mediante una aplicación de repetición espaciada (Anki) con un mazo de 1000 palabras más comunes (NO BÁSICAS) en el idioma. Para esto recomendamos los mazos de Refold. Ten en cuenta que estos mazos tienen un costo. Si buscas opciones gratuitas, puedes explorar cientos de mazos populares creados por la comunidad en AnkiWeb.

Utilizar aplicaciones de idiomas: estas aplicaciones no te pueden llevar a un nivel avanzado ni a la fluidez, pero pueden ayudarte a construir las bases. Recomendamos especialmente Busuu.

Otras alternativas: Son totalmente opcionales y dependen de cada persona. La piedra angular de este método es que lo disfrutes y hagas actividades que te gusten: fonética, gramática, cursos de idiomas, etc.

¿Es la gramática necesaria? No recomendamos el estudio formal de gramática en esta etapa, y sostenemos que puedes aprender cualquier idioma sin tocarla. Sin embargo, si disfrutas estudiar gramática, puedes usarla como apoyo básico en esta primera etapa de preparación para comprender mejor las estructuras, o más adelante en la etapa de output para refinar detalles.

Recomendamos firmemente el uso de Refold Tracker. Es una aplicación que te permite registrar el tiempo que pasas en tu idioma y en qué actividades. Te ayudará a crear el hábito y a tener claridad sobre tus horas reales de exposición.`,
    keyObjectives: [
      "Construir un vocabulario base inicial (ej. ~1000 palabras más frecuentes).",
      "Familiarizarse con las estructuras y sonidos más básicos del idioma.",
      "Establecer el hábito y el contacto diario con el idioma.",
      "Prepararse para la futura inmersión."
    ],
    successTips: [
      "No necesitas gramática: Olvídate de la gramática si así lo prefieres. La aprenderás por exposición. Pero si te gusta, úsala solo como apoyo, nunca como base.",
      "Estudia palabras frecuentes (No básicas).",
      "Sé Constante.",
      "No te estanques aquí: Esta etapa es una rampa, no una residencia. El objetivo no es quedarte con Anki y Busuu por meses, sino usarlos como impulso inicial para lanzarte al input real lo antes posible.",
      "Hazlo rápido, no perfecto: No necesitas dominar todas las palabras ni “terminar el mazo”. Solo necesitas lo suficiente para no ahogarte cuando empieces la inmersión."
    ],
    commonChallenges: [
      "Sentirse Abrumado por Anki: Es normal sentirse abrumado por anki porque no es una aplicación divertida. Recomendamos empezar con pocas tarjetas e ir subiendo progresivamente. Nuestro objetivo es estudiar 15 palabras por día durante esta etapa (Revisar pestaña de rutinas).",
      "Dudar si se está aprendiendo \"suficiente\" gramática: Confiar en el proceso. Es normal creer que necesitamos la gramática pero es un mito completamente; si lo necesitas puedes hacer una consulta rápida de reglas, pero no convertirlo en el foco."
    ],
    nextStageCriteria: [
      "Después pasar las 700+ palabras revisadas en el mazo de frecuencia."
    ]
  },
  [AntimethodStage.TWO]: {
    name: "Segunda etapa: Inmersión total en el idioma",
    description: "Consumir contenido auténtico (películas, series, etc.) con subtítulos en idioma meta. Énfasis en contenido fácil y disfrutable.",
    objective: "Lograr entender películas y series en el mismo idioma con subtítulos (CC) Fácilmente, expandir el vocabulario y la comprensión de estructuras gramaticales de forma intuitiva y contextual, desarrollar la capacidad de seguir tramas y entender ideas principales en el idioma meta, incluso si no se comprende cada palabra, y disfrutar del proceso de aprendizaje a través de contenido de interés personal.",
    longDescription: `En esta etapa consumiremos contenido auténtico en el idioma, esto incluye películas, series, libros, videojuegos. En un comienzo no vas a entender cada una de las palabras que dicen, lo importante y lo que vas a hacer es tratar de entender el mensaje, entender lo que está sucediendo en la pantalla, por ejemplo si estuvieras viendo un show de comedia no deberías de tratar cada una de las palabras que dicen de los chistes, si no buscar entender el chiste.

Al principio tenemos que poner énfasis en consumir contenido fácil, tenemos que encontrarnos en el punto en donde entendamos y no lo que estamos consumiendo y debemos de estar disfrutando y de encontrar el contenido interesante. En estos momentos recomendamos absolutamente activar los subtítulos (CC) en el mismo idioma meta, al ser un contenido audiovisual contaremos con lo que esta pasando en la pantalla (gestos, acciones) y los subtítulos nos ayudan en este punto a mejorar muchísimo nuestra comprensión y aprender como se escribe el idioma en relación a como se escucha.

Para encontrar contenido recomendamos plataformas de streaming como YouTube, Netflix, Prime Video. Para más información y herramientas específicas, revisa nuestra sección de Recursos.

Es importante estar en contacto todos los días con el idioma, a la vez que consumimos contenido usar también Anki para aprender nuevas palabras. Recomendamos 2 horas al día en inmersión activa con la inmersión pasiva como extra opcional. Esto nos permite notar progreso de forma rápida y evidente, lo cual nos mantendrá con una motivación alta. Además, al tratarse de un método que se compone de actividades agradables, las dos horas serán no solo sostenibles, sino que también placenteras.

Tipos de Inmersión en esta Etapa
Inmersión activa: Esta es la actividad más importante. Presta toda tu atención al contenido intentando deducir por el contexto. Dentro de esta categoría entra la inmersión libre (freeflow) que es sin buscar nada o casi nada significados de palabras aprendiendo por input comprensible.
Inmersión intensiva: Es cuando utilizas un diccionario emergente en tu inmersión buscando en cada frase para saber su significado y entender la frase. Nosotros recomendamos muy poco este tipo de inmersión porque puede llegar a ser tedioso o una carga y puede reducir tu tiempo total bruto en el idioma.
Inmersión pasiva: Es cuando se presta una atención parcial al idioma, pueden ser podcast o audios. Este tipo de inmersión puede ser increíblemente beneficiosa si es utilizada de manera correcta. Si bien al no prestar mucha atención se pierden muchos de los beneficios al sí hacerlo, puede ayudarte a incrementar muchísimo tu tiempo de exposición al idioma, lo cual ayuda realmente a gente ocupada. No remplaza a la inmersión activa y es completamente opcional, pero puede ayudarte a acelerar el proceso. Recomendamos la inmersión pasiva a partir de esta segunda etapa, cuando ya puedas entender una parte de lo que escuchas pasivamente.

Estudio activo (opcional): Este es realmente opcional para nosotros pero puede tener grandes beneficios, abarca actividades como estudiar la fonética, vocabulario con Anki y estudiar el sistema de escritura. En la mayoría de idiomas aprender la fonética y el sistema de escritura te pueden tomar menos de una semana de aprender.`,
    keyObjectives: [
      "Lograr entender películas y series en el mismo idioma con subtítulos (CC) Fácilmente.",
      "Expandir el vocabulario y la comprensión de estructuras gramaticales de forma intuitiva y contextual.",
      "Desarrollar la capacidad de seguir tramas y entender ideas principales en el idioma meta, incluso si no se comprende cada palabra.",
      "Disfrutar del proceso de aprendizaje a través de contenido de interés personal."
    ],
    successTips: [
      "Encuentra TU Contenido: La clave es que sea interesante PARA TI. Si te aburres, cambia de contenido.",
      "Disfruta el proceso: Si quieres ver una seria, ¡vela!",
      "No te Obsesiones con Entenderlo TODO: Al principio es normal entender solo un porcentaje. Enfócate en la idea general y disfruta. La comprensión crecerá.",
      "Usa los Subtítulos (en idioma meta) Sabiamente: Son una ayuda, no una muleta permanente. Presta atención a cómo suenan las palabras que lees.",
      "Varía tus Fuentes de Input: No te quedes solo con un tipo de contenido. La variedad te expondrá a más vocabulario y acentos.",
      "Sé Consistente: La consistencia es el punto más importante de todos; 3 minutos es mejor que nada."
    ],
    nextStageCriteria: [
      "Puedes entender con facilidad el contenido que consumes con subtítulos (CC).",
      "Tienes una buena base de vocabulario pasivo y una intuición creciente sobre cómo suena el idioma."
    ]
  },
  [AntimethodStage.THREE]: {
    name: "Tercera etapa: Free Flow Listening",
    description: "Independizarse de los subtítulos. Consumir contenido sin subtítulos y minar oraciones i+1.",
    objective: "Desarrollar la capacidad de entender contenido auténtico SIN subtítulos, mejorar la velocidad de procesamiento auditivo, afianzar la comprensión intuitiva de la gramática y el vocabulario en contextos variados, y comenzar a identificar y aprender activamente vocabulario nuevo a través del \"minado de oraciones\" (i+1).",
    longDescription: `Después de haber pasado un cierto tiempo nos daremos cuenta que entendemos bastante bien el idioma, en este punto aprenderemos a independizarnos de los subtítulos para entender sin necesidad de ellos. Para este paso recomendamos el freeflow listening, es básicamente consumir el contenido sin subtítulos junto con (opcional) intensive listening, este demanda mucha energía y puede llegar a ser hasta aburrido, consiste en escuchar un mismo dialogo hasta 3 veces analizando las voces para en la cuarta leer lo que dicen y escuchar una vez más.

En esta etapa entenderemos muy bien y probablemente haya varias oraciones i+1 donde haya una palabra que desconozcamos en el mismo enunciado, el minado de oraciones consiste en minar la oración completa i+1 en anki, creando una tarjeta con la imagen del contenido que estemos viendo con la oración completa traducida al español, para entender el significado de la palabra en ese contexto en específico, no recomendamos en lo absoluto minar solo la palabra ya que suelen cambiar de significado según el contexto.`,
    keyObjectives: [
      "Desarrollar la capacidad de entender contenido auténtico SIN subtítulos.",
      "Mejorar la velocidad de procesamiento auditivo.",
      "Afianzar la comprensión intuitiva de la gramática y el vocabulario en contextos variados.",
      "Comenzar a identificar y aprender activamente vocabulario nuevo a través del \"minado de oraciones\" (i+1)."
    ],
    successTips: [
      "No Tengas Miedo de \"Perderte\": Es normal no entender todo al principio sin subtítulos. Tu cerebro se adaptará. Relájate y confía en el proceso.",
      "Prioriza el Minado de Calidad (i+1): No intentes minar cada palabra desconocida. Enfócate en oraciones donde solo una cosa sea nueva. Esto es mucho más eficiente."
    ],
    nextStageCriteria: [
      "Puedes entender la gran mayoría del contenido audiovisual para nativos sin necesidad de subtítulos.",
      "Te sientes cómodo con la velocidad y la variedad del habla nativa.",
      "Tienes un vocabulario pasivo muy extenso y una fuerte intuición gramatical.",
      "Sientes un deseo creciente de empezar a EXPRESARTE en el idioma, de compartir tus propias ideas."
    ]
  },
  [AntimethodStage.FOUR]: {
    name: "Cuarta etapa: Producción del idioma",
    description: "Activar conocimiento pasivo para hablar y escribir. Practicar output con IA, escritura, etc.",
    objective: "Activar el conocimiento pasivo adquirido y convertirlo en habilidad productiva (hablar y escribir), desarrollar fluidez y naturalidad al expresarse, ganar confianza en la comunicación oral y escrita, e identificar y pulir áreas de mejora en la gramática y pronunciación a través de la práctica y el feedback (si se busca).",
    longDescription: `Imagina que, durante todo este proceso de input, tu cerebro ha estado construyendo una máquina compleja. Una máquina diseñada para entender el idioma: con engranes, sensores y cables que se activan cada vez que escuchas, ves o lees algo en esa lengua. Al principio, era lenta, torpe, apenas encendía. Pero con cada día de exposición, con cada minuto de inmersión, la máquina fue tomando forma. Se ajustó, se afinó, se volvió eficiente.

Y entonces sucede algo mágico: esa misma máquina, que parecía creada solo para entender, puede invertirse. Es como si le dieras vuelta a su mecanismo. Lo que antes era input, ahora puede ser output. La comprensión se convierte en producción. Ya no solo reconoces estructuras, sonidos o palabras; ahora puedes usarlas. La máquina está lista para hablar, para escribir, para crear con el idioma.

Aquí empieza esa transición. Si bien existen casos documentados de personas que fueron fluidas solo con recibir input ese no es el caso con la mayoría, y tenemos que practicar mucho para llegar a la fluidez. Para lograr esto tenemos que primero diferenciar entre lo que podemos lograr con escribir y hablar. El speaking ayuda más que nada a hablar más de manera fluida, pero tiene sus problemas, notarás muy fácilmente tus errores y el problema es de que no tendrás el tiempo de solucionarlos. En la escritura en cambio tendremos más tiempo para buscar algo que no recordamos cómo decir, activando el input en output, y teniendo más tiempo para corregir fácilmente. Recomendamos como actividades escribir y hacer llamadas con inteligencia artificial, haciendo énfasis en hacer una conversación fluida, donde te corrija y siga el flujo de la conversación a la vez. Será muy fácil corregir los errores ya que con las horas de input serán obvios los errores. Otra de las actividades es simplemente hablar consigo mismo puede ser mentalmente o en voz alta, o llevar un diario. Aquí recomendamos 1 hora de output (producir el idioma) y una hora de input.`,
    keyObjectives: [
      "Activar el conocimiento pasivo adquirido y convertirlo en habilidad productiva (hablar y escribir).",
      "Desarrollar fluidez y naturalidad al expresarse.",
      "Ganar confianza en la comunicación oral y escrita.",
      "Identificar y pulir áreas de mejora en la gramática y pronunciación a través de la práctica y el feedback (si se busca)."
    ],
    successTips: [
      "Empieza Simple y Sé Valiente: No esperes hablar perfectamente desde el primer día. Lo importante es empezar a comunicar tus ideas.",
      "Enfócate en la Comunicación, no en la Perfección Gramatical: El objetivo es hacerte entender y entender a otros. Los errores son parte del proceso. Tu \"monitor adquirido\" te ayudará a autocorregirte con el tiempo.",
      "La Escritura Ayuda al Habla: Practicar la escritura te da tiempo para pensar, buscar vocabulario y estructurar tus ideas, lo cual luego se transfiere positivamente al habla.",
      "Grábate Hablando: Aunque pueda ser incómodo al principio, es una excelente forma de identificar áreas de mejora en tu pronunciación y fluidez."
    ],
    commonChallenges: [
      "Miedo a Equivocarse / \"Pánico Escénico\": Recuerda que todos los aprendices pasan por esto. El Antimétodo te ha preparado bien. Tu comprensión es alta. ¡Lánzate! Cuanto más practiques, menos miedo tendrás.",
      "\"No se me ocurren las palabras cuando quiero hablar\": Es normal. Tu vocabulario activo aún se está desarrollando. Sigue con el input y, al hablar, no tengas miedo de parafrasear o usar palabras más simples si no recuerdas la exacta."
    ]
  },
};

export const DEFAULT_DAILY_GOALS: DailyActivityGoal[] = [];
export const DEFAULT_DASHBOARD_CARD_DISPLAY_MODE: DashboardCardDisplayMode = 'learning_days_and_health';


export const ONBOARDING_SCREENS = [
  {
    title: "¡Bienvenido/a a El Antimétodo!",
    text: "Tu compañero definitivo para adquirir idiomas de forma natural y disfrutando del proceso. Olvídate de la gramática forzada y las lecciones aburridas.",
    image: "/assets/supremacy.jpg"
  },
  {
    title: "Input Comprensible es la Clave",
    text: "Nos centramos en la exposición masiva a contenido que entiendes y te gusta: series, música, videojuegos, libros... ¡lo que tú elijas!",
    image: "/assets/recursos-viajero-antimetodo.png"
  },
  {
    title: "Tú Tienes el Control",
    text: "Esta app es tu centro de mando para registrar tu inmersión y visualizar tu progreso. Es 100% gratuita y sin anuncios. ⚠️Importante: Tus datos se guardan solo en este navegador. ¡Recuerda exportarlos desde Configuración para tener un respaldo!",
    image: "/assets/welearnthisway.png"
  },
  {
    title: "List@ para Empezar?",
    text: "Vamos a realizar un breve test para ubicarte en la etapa correcta del Antimétodo y personalizar tu experiencia.",
    image: "/assets/supremacy.png"
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  // ... (existing resources remain unchanged) ...
  // Seguimiento de Tiempo
  { id: 'res001', name: 'Refold Tracker', category: 'Seguimiento de Tiempo (¡Esencial!)', description: 'Aplicación esencial para registrar tu tiempo de inmersión y estudio, ayudándote a medir tu progreso y mantener la motivación. Usuario del autor: LuiseM93.', link: 'https://www.notion.so/refold/Refold-Tracker-Android-iOS-af780595f503430686256f007cca3d92', isCommunityRecommended: true, platform: 'Android/iOS', notes: 'Descargar de Notion de Refold o Play Store (Android).', subCategory: 'Recomendada' },
  { id: 'res002', name: 'Toggl Track', category: 'Seguimiento de Tiempo (¡Esencial!)', description: 'Alternativa para registrar tiempo.', link: 'https://toggl.com/track/', subCategory: 'Alternativas' },
  { id: 'res003', name: 'Polylogger', category: 'Seguimiento de Tiempo (¡Esencial!)', description: 'Otra alternativa para el seguimiento de tiempo.', link: 'https://polylogger.com/', subCategory: 'Alternativas' },

  // Etapa 1: Preparación Previa
  { id: 'res101', name: 'Anki (PC/Mac/Linux)', category: 'Etapa 1: Preparación Previa', subCategory: 'Anki (Sistema de Repetición Espaciada)', description: 'Software de flashcards para repetición espaciada.', link: 'https://apps.ankiweb.net/', platform: 'PC/Mac/Linux', cost: 'Gratis (Web Oficial)' },
  { id: 'res102', name: 'AnkiDroid (Android)', category: 'Etapa 1: Preparación Previa', subCategory: 'Anki (Sistema de Repetición Espaciada)', description: 'Versión de Anki para Android.', link: 'https://play.google.com/store/apps/details?id=com.ichi2.anki&hl=en_US&gl=US', platform: 'Android', cost: 'Gratis' },
  { id: 'res103', name: 'AnkiMobile (iOS)', category: 'Etapa 1: Preparación Previa', subCategory: 'Anki (Sistema de Repetición Espaciada)', description: 'Versión de Anki para iOS.', link: 'https://apps.apple.com/us/app/ankimobile-flashcards/id373493387', platform: 'iOS', cost: '$24.99 USD (razón desconocida)', notes: '⚠️ Costo elevado.'},
  { id: 'res104', name: 'Mazos de Refold', category: 'Etapa 1: Preparación Previa', subCategory: 'Mazos Recomendados para Anki', description: 'Mazos de vocabulario base. Valen completamente la pena.', link: 'https://refold.la/roadmap/stage-1/a/anki-setup#Starter%20Packs', cost: 'De paga ($20 USD)' },
  { id: 'res105', name: 'Mazo 1000 Palabras Inglés (Comunidad Refold)', category: 'Etapa 1: Preparación Previa', subCategory: 'Mazos Recomendados para Anki', description: 'Mazo gratuito de la comunidad Refold para inglés.', link: 'https://ankiweb.net/shared/info/1M9S7L2Q', cost: 'Gratis', notes: '⚠️ Basado en español.' },
  { id: 'res106', name: 'Mazo 1000 Palabras (Inglés a Francés)', category: 'Etapa 1: Preparación Previa', subCategory: 'Mazos Recomendados para Anki', description: 'Mazo gratuito de la comunidad para inglés a francés.', link: 'https://ankiweb.net/shared/decks/french', cost: 'Gratis', notes: '⚠️ Comunidad.' }, 
  { id: 'res107', name: 'Mazo Fonética del Francés', category: 'Etapa 1: Preparación Previa', subCategory: 'Mazos Recomendados para Anki', description: 'Mazo gratuito para fonética francesa.', link: 'https://ankiweb.net/shared/decks/french%20phonetics', cost: 'Gratis' }, 
  { id: 'res108', name: 'Busuu', category: 'Etapa 1: Preparación Previa', subCategory: 'Plataformas de Aprendizaje Inicial', description: 'Plataforma para construir bases en un idioma. Recomendada.', link: 'https://www.busuu.com/es', isCommunityRecommended: true, platform: 'Web/iOS/Android' },
  
  // Etapa 2: Inmersión Total en el Idioma
  { id: 'res201', name: 'Language Reactor', category: 'Etapa 2: Inmersión Total', subCategory: 'Asistentes de Lectura, Video y Contenido', description: 'Diccionario emergente y herramientas para Netflix, YouTube, etc. Ver video tutorial de Mr. Salas.', link: 'https://www.languagereactor.com/', platform: 'Extensión de Navegador' },
  { id: 'res202', name: 'LingQ', category: 'Etapa 2: Inmersión Total', subCategory: 'Asistentes de Lectura, Video y Contenido', description: 'Herramienta para aprender mediante lectura y escucha. Para cualquier etapa.', link: 'https://www.lingq.com/es/', cost: 'De paga (opción gratuita limitada)' },
  { id: 'res203', name: 'Readlang', category: 'Etapa 2: Inmersión Total', subCategory: 'Asistentes de Lectura, Video y Contenido', description: 'Alternativa a LingQ para lectura. Recurso en exploración.', link: 'https://readlang.com/', cost: 'De paga ($6 USD/mes, con versión limitada gratuita)', notes: '⚠️ No probado por el autor pero recomendado.'},
  { id: 'res204', name: 'Lute', category: 'Etapa 2: Inmersión Total', subCategory: 'Asistentes de Lectura, Video y Contenido', description: 'Alternativa gratuita a LingQ. Ver tutorial de Lute por Refold.', link: 'https://github.com/jzohrab/lute-v3#readme', cost: 'Gratis' }, 
  { id: 'res205', name: 'Voracious', category: 'Etapa 2: Inmersión Total', subCategory: 'Asistentes de Lectura, Video y Contenido', description: 'Reproductor para aprendizaje de idiomas.', link: 'https://voracious.app/', notes: '⚠️ Aún no explorado pero recomendado.' },
  { id: 'res206', name: 'Audiblez', category: 'Etapa 2: Inmersión Total', subCategory: 'Crea tus Propios Audiolibros', description: 'Genera audiobooks desde e-books.', link: 'https://audiblez.com/' }, 
  { id: 'res207', name: 'ebook2audiobook', category: 'Etapa 2: Inmersión Total', subCategory: 'Crea tus Propios Audiolibros', description: 'Convierte ebooks en audiobooks.', link: 'https://github.com/Rudloff/ebook2audiobook' }, 
  { id: 'res208', name: 'Voice (Audiobook Player)', category: 'Etapa 2: Inmersión Total', subCategory: 'Gestor de Audiolibros (Android)', description: 'Reproductor de audiolibros para Android.', link: 'https://play.google.com/store/apps/details?id=com.hyperionics.avar', platform: 'Android', cost: 'Gratis sin anuncios' },
  { id: 'res209', name: 'Netflix', category: 'Etapa 2: Inmersión Total', subCategory: 'Plataformas de Streaming', description: 'Plataforma de streaming para series y películas.', link: 'https://www.netflix.com' },
  { id: 'res210', name: 'Prime Video', category: 'Etapa 2: Inmersión Total', subCategory: 'Plataformas de Streaming', description: 'Plataforma de streaming de Amazon.', link: 'https://www.primevideo.com' },
  { id: 'res211', name: 'Disney Plus', category: 'Etapa 2: Inmersión Total', subCategory: 'Plataformas de Streaming', description: 'Plataforma de streaming de Disney.', link: 'https://www.disneyplus.com' },
  { id: 'res212', name: 'YouTube', category: 'Etapa 2: Inmersión Total', subCategory: 'Plataformas de Streaming', description: 'Plataforma de videos.', link: 'https://www.youtube.com', cost: 'Gratis' },
  { id: 'res213', name: 'France.tv', category: 'Etapa 2: Inmersión Total', subCategory: 'Plataformas de Streaming', description: 'Sitio de streaming para ver contenido en francés.', link: 'https://www.france.tv/', cost: 'Gratis', notes: 'De Francia - puede requerir VPN.' },
  { id: 'res214', name: 'Tubi TV', category: 'Etapa 2: Inmersión Total', subCategory: 'Plataformas de Streaming', description: 'Sitio de streaming para ver contenido en inglés.', link: 'https://tubitv.com/', cost: 'Gratis', notes: 'De Estados Unidos - puede requerir VPN.' },
  { id: 'res215', name: 'OpenSubtitles', category: 'Etapa 2: Inmersión Total', subCategory: 'Descargar Subtítulos', description: 'Sitio para descargar subtítulos.', link: 'https://www.opensubtitles.org' },
  { id: 'res216', name: 'My Subs', category: 'Etapa 2: Inmersión Total', subCategory: 'Descargar Subtítulos', description: 'Otro sitio para descargar subtítulos.', link: 'https://mysubs.io/' }, 
  { id: 'res217', name: 'Urban VPN', category: 'Etapa 2: Inmersión Total', subCategory: 'VPN (Contenido Geobloqueado)', description: 'VPN gratuita para cambiar tu ubicación.', link: 'https://www.urban-vpn.com/', cost: 'Gratuita', platform: 'Play Store/App Store' },
  
  // Etapa 3: Free Flow Listening y Minado de Oraciones
  { id: 'res301', name: 'Migaku', category: 'Etapa 3: Free Flow Listening y Minado', subCategory: 'Herramientas Minado Asistido/Automático', description: 'Minado de oraciones automático con video y audio.', link: 'https://www.migaku.io/', cost: 'De paga ($10 USD/mes)' },
  { id: 'res302', name: 'Yomitan (Extensión)', category: 'Etapa 3: Free Flow Listening y Minado', subCategory: 'Herramientas Minado Asistido/Automático', description: 'Solo mina las palabras en definiciones exactas; es recomendable minar manually.', link: 'https://foosoft.net/projects/yomichan/', cost: 'Gratuito', notes: '⚠️ Se recomienda minar manualmente para definición correcta.' },
  
  // Inmersión Pasiva (Recomendada desde Etapa 2)
  { id: 'resP01', name: 'Spotify', category: 'Inmersión Pasiva (desde Etapa 2)', subCategory: 'Podcasts', description: 'Plataforma para escuchar podcasts y música.', link: 'https://www.spotify.com' },
  { id: 'resP02', name: 'Podcast Addict (Android)', category: 'Inmersión Pasiva (desde Etapa 2)', subCategory: 'Podcasts', description: 'App para podcasts en Android.', link: 'https://podcastaddict.com/apk', platform: 'Android', cost: 'Gratis' },
  { id: 'resP03', name: 'Apple Podcasts (iOS)', category: 'Inmersión Pasiva (desde Etapa 2)', subCategory: 'Podcasts', description: 'App para podcasts en iOS.', link: 'https://www.apple.com/apple-podcasts/', platform: 'iOS', cost: 'Gratis' },
  { id: 'resP04', name: 'Base de datos de podcast (Japonés)', category: 'Inmersión Pasiva (desde Etapa 2)', subCategory: 'Podcasts', description: 'Hoja de cálculo con podcasts para inmersión pasiva en japonés.', link: 'https://docs.google.com/spreadsheets/d/17PxD1uU2h7Zpl2hHzKUDO_X2HK2zSgG7WaY82bAl0sM/edit#gid=0', cost: 'Gratis' }, 
  { id: 'resP05', name: 'Radio France', category: 'Inmersión Pasiva (desde Etapa 2)', subCategory: 'Radio Online', description: 'Radio online en francés.', link: 'https://www.radiofrance.fr/', cost: 'Gratis', platform: 'Play Store/App Store' },

  // Etapa 4: Producción del Idioma
  { id: 'res401', name: 'ChatGPT', category: 'Etapa 4: Producción del Idioma', subCategory: 'IA para Conversar', description: 'IA para conversación escrita u oral.', link: 'https://chat.openai.com/' },
  { id: 'res402', name: 'Character.ai', category: 'Etapa 4: Producción del Idioma', subCategory: 'IA para Conversar', description: 'IA para conversación escrita u oral con personajes.', link: 'https://character.ai/' },
  { id: 'res403', name: 'Issen (Tutor IA)', category: 'Etapa 4: Producción del Idioma', subCategory: 'IA para Conversar', description: 'Tutor IA para conversación.', link: 'https://issen.io/', cost: 'De paga' },
  { id: 'res404', name: 'Tandem', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'Habla gratis con nativos.', link: 'https://www.tandem.net/', cost: 'Gratis' },
  { id: 'res405', name: 'HelloTalk', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'App para intercambio de idiomas.', link: 'https://www.hellotalk.com/', cost: 'Gratis' },
  { id: 'res406', name: 'Episoden', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'Plataforma para intercambio de idiomas.', link: 'https://episoden.com/', cost: 'Gratis' },
  { id: 'res407', name: 'Speaky', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'App para intercambio de idiomas.', link: 'https://www.speaky.com/', notes: '⚠️ Aún no explorado pero recomendado.' },
  { id: 'res408', name: 'Lingbe', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'Llamadas con nativos.', link: 'https://lingbe.com/', platform: 'Apps: Play Store, App Store' },
  { id: 'res409', name: 'Conversation Exchange', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'Sitio web para encontrar compañeros de intercambio.', link: 'https://www.conversationexchange.com/', cost: 'Gratis' },
  { id: 'res410', name: 'Language.exchange', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'Otro sitio para intercambio de idiomas.', link: 'https://language.exchange/', cost: 'Gratis' },
  { id: 'res411', name: 'VRChat', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'Únete a servidores donde hablen tu idioma meta.', link: 'https://hello.vrchat.com/', cost: 'Gratis' },
  { id: 'res412', name: 'Discord', category: 'Etapa 4: Producción del Idioma', subCategory: 'Intercambio de Idiomas con Nativos', description: 'Busca grupos donde hablen tu idioma meta.', link: 'https://discord.com/', cost: 'Gratis' },
  { id: 'res413', name: 'italki', category: 'Etapa 4: Producción del Idioma', subCategory: 'Clases y Tutores', description: 'Habla con nativos en tu idioma meta (tutores).', link: 'https://www.italki.com/', cost: 'De Pago' },
  { id: 'res414', name: 'Cambly', category: 'Etapa 4: Producción del Idioma', subCategory: 'Clases y Tutores', description: 'Clases con tutores nativos de inglés.', link: 'https://www.cambly.com/', cost: 'De Pago' },
  
  // Mejora de Pronunciación
  { id: 'resM01', name: 'Youglish', category: 'Mejora de Pronunciación', subCategory: 'Recursos Generales', description: 'Revisa pronunciación de palabras en contexto de videos de YouTube.', link: 'https://youglish.com/' },
  { id: 'resM02', name: 'Forvo', category: 'Mejora de Pronunciación', subCategory: 'Recursos Generales', description: 'Escucha palabras pronunciadas por nativos.', link: 'https://forvo.com/' },
  { id: 'resM03', name: 'Elsa Speak (Inglés)', category: 'Mejora de Pronunciación', subCategory: 'Aplicaciones y Técnicas', description: 'Aprende fonética y mejora tu pronunciación en inglés.', link: 'https://elsaspeak.com/en/', cost: 'De pago (opción gratuita limitada)' },
  { id: 'resM04', name: 'Flow-verlapping (Tutorial Mr. Salas)', category: 'Mejora de Pronunciación', subCategory: 'Aplicaciones y Técnicas', description: 'Mejora la pronunciación grabando y repitiendo. Tutorial por Mr. Salas.', link: 'https://www.youtube.com/watch?v=sFym3nL_620', notes: 'Link a video de ejemplo' }, 
  { id: 'resM05', name: 'Shadowing (Setup y Tutorial Óptimo)', category: 'Mejora de Pronunciación', subCategory: 'Aplicaciones y Técnicas', description: 'Técnica de imitación para mejorar pronunciación y fluidez. Setup y tutorial.', link: 'https://www.youtube.com/watch?v=H3hI1GnHznM', notes: 'Link a video de ejemplo' }, 

  // Apoyo Extra y Guías Adicionales
  { id: 'resX01', name: 'Test de Ubicación Antimétodo (con IA)', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Guías', description: 'Guía para que la IA te ayude a encontrar tu etapa ideal.', link: '#/onboarding', notes: 'Integrado en la app (Onboarding)' }, 
  { id: 'resX02', name: 'Guías de Idiomas de Refold', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Guías', description: 'Guías específicas por idioma de Refold.', link: 'https://refold.la/guides', isCommunityRecommended: true },
  { id: 'resX03', name: 'AJATT (All Japanese All The Time)', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Guías', description: 'Método obsesivo para aprender japonés (+5 horas/día).', link: 'http://www.alljapaneseallthetime.com/blog/', notes: '⚠️ Método intensivo.' },
  { id: 'resX04', name: 'Mr. Salas (YouTube)', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Canales de YouTube', description: 'Canal sobre inmersión y aprendizaje de idiomas.', link: 'https://www.youtube.com/@MrSalas', isCommunityRecommended: true },
  { id: 'resX05', name: 'Matt vs Japan (YouTube)', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Canales de YouTube', description: 'Canal sobre aprendizaje de japonés por inmersión.', link: 'https://www.youtube.com/@mattvsjapan', isCommunityRecommended: true },
  { id: 'resX06', name: 'Refold (YouTube)', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Canales de YouTube', description: 'Canal oficial de Refold sobre aprendizaje de idiomas.', link: 'https://www.youtube.com/@Refold', isCommunityRecommended: true },
  { id: 'resX07', name: 'LearnJapanese.moe', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Bases de Datos de Recursos Comunitarios', description: 'Recursos para japonés.', link: 'https://learnjapanese.moe/', isCommunityRecommended: true },
  { id: 'resX08', name: 'Recursos para Japonés (Sitio AJATT de Tatsumoto Ren)', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Bases de Datos de Recursos Comunitarios', description: 'Recursos para japonés.', link: 'https://tatsumoto.neocities.org/blog/resources-for-learning-japanese.html', isCommunityRecommended: true },
  { id: 'resX09', name: 'Base de Recursos de la Comunidad Refold (Varios Idiomas)', category: 'Apoyo Extra y Guías Adicionales', subCategory: 'Bases de Datos de Recursos Comunitarios', description: 'Recursos comunitarios de Refold para varios idiomas.', link: 'httpsold.la/community/document/5xvbdNboPSxL92N03iR4', isCommunityRecommended: true },
];


export const ANTIMETHOD_ACTIVITIES_DETAILS: ActivityDetailType[] = [
  {
    name: "Estudio de vocabulario Anki",
    description: "Consiste en el aprendizaje de nuevas palabras y frases utilizando aplicaciones de repetición espaciada como Anki, a menudo con mazos de las palabras más comunes.",
    category: ActivityCategory.ACTIVE_STUDY,
    skill: Skill.STUDY,
  },
  {
    name: "Uso de apps de idiomas para bases (ej. Busuu)",
    description: "Implica el uso de herramientas digitales que ayudan a construir las bases iniciales del idioma de forma guiada.",
    category: ActivityCategory.ACTIVE_STUDY,
    skill: Skill.STUDY, // Or could be a mix, but primarily study for structure
  },
  {
    name: "Fonética (opcional y recomendada)",
    description: "Se refiere a realizar sesiones breves para familiarizarse con los sonidos y la pronunciación del idioma.",
    category: ActivityCategory.ACTIVE_STUDY,
    skill: Skill.STUDY, // Or SPEAKING if practice-focused
  },
  {
    name: "Gramática (opcional, como apoyo básico si disfrutas estudiarla)",
    description: "El estudio formal de la gramática no es el foco principal, pero puede usarse de forma opcional como apoyo básico para comprender mejor las estructuras, o para refinar detalles en etapas más avanzadas, si el estudiante lo disfruta.",
    category: ActivityCategory.ACTIVE_STUDY,
    skill: Skill.STUDY,
  },
  {
    name: "Estudio del sistema de escritura (Si es necesario)",
    description: "Se dedica a aprender el sistema de escritura del idioma, lo cual puede ser un proceso rápido en la mayoría de los casos.",
    category: ActivityCategory.ACTIVE_STUDY,
    skill: Skill.STUDY, // Or WRITING if practice-focused
  },
  {
    name: "Lectura (Libros, artículos)",
    description: "Consumir contenido escrito auténtico en el idioma meta, como libros o artículos, para aprender de forma natural a través del input comprensible.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.READING,
  },
  {
    name: "Lectura más audio (Libro + Audiolibro)",
    description: "Consumir contenido que combina texto y audio, como leer un libro mientras se escucha su audiolibro, lo que permite asociar la forma escrita con la pronunciación.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.READING, // Primary skill, listening is secondary benefit
  },
  {
    name: "Inmersión intensiva con subtítulos (revisar palabras)",
    description: "Consiste en consumir contenido con subtítulos en el idioma meta, prestando mucha atención para deducir el significado por el contexto y, en ocasiones, utilizando herramientas de apoyo para revisar palabras específicas. Principalmente visual y auditivo.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.READING, 
  },
  {
    name: "Inmersión con subtítulos freeflow",
    description: "Implica consumir contenido con subtítulos en el idioma meta, pero sin detenerse a buscar cada palabra desconocida, permitiendo que el aprendizaje ocurra de forma más fluida y natural por el contexto.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.READING, 
  },
  {
    name: "Free Flow Listening (sin subtítulos)",
    description: "Se enfoca en escuchar y comprender el idioma sin el apoyo de subtítulos, desarrollando la habilidad de entender el habla natural. Puede ser TV, YouTube, podcasts, etc.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.LISTENING,
  },
  {
    name: "Intensive Listening (opcional)",
    description: "Implica escuchar repetidamente un diálogo corto (hasta tres veces), luego leer su transcripción y finalmente volver a escucharlo para una comprensión profunda.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.LISTENING,
  },
  {
    name: "Crosstalk",
    description: "Dos personas conversan, cada una en su propio idioma nativo, enfocándose en comprender el input del otro a través del contexto y las pistas visuales, sin la presión de producir en el idioma meta.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.LISTENING,
  },
  {
    name: "Videojuegos (con subtítulos en idioma meta)",
    description: "Jugar videojuegos con diálogos y textos en el idioma meta, utilizando subtítulos en el mismo idioma para reforzar la lectura y la asociación audio-texto.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.READING,
  },
  {
    name: "Videojuegos (audio en idioma meta, sin subtítulos)",
    description: "Jugar videojuegos con el audio en el idioma meta, centrándose en la comprensión auditiva sin la ayuda de subtítulos.",
    category: ActivityCategory.ACTIVE_IMMERSION,
    skill: Skill.LISTENING,
  },
  {
    name: "Inmersión Pasiva (podcasts, música de fondo)",
    description: "Consiste en exponerse al idioma de fondo, prestando atención parcial, como escuchar podcasts o música mientras se realizan otras actividades, para aumentar la exposición general.",
    category: ActivityCategory.PASSIVE_IMMERSION,
    skill: Skill.LISTENING,
  },
  {
    name: "Minado de oraciones (i+1) con Anki",
    description: "Consiste en crear tarjetas de Anki con oraciones completas que contengan solo una palabra nueva, incluyendo una imagen y la traducción, para aprender vocabulario en contexto.",
    category: ActivityCategory.ACTIVE_STUDY,
    skill: Skill.STUDY, 
  },
  {
    name: "Actividades de escritura (ej. llevar un diario)",
    description: "Implica practicar la expresión escrita en el idioma, como llevar un diario o simplemente escribir textos cortos para activar el conocimiento pasivo.",
    category: ActivityCategory.PRODUCTION,
    skill: Skill.WRITING,
  },
   {
    name: "Actividades de escritura asistida",
    description: "Practicar la escritura utilizando herramientas que ofrecen correcciones o sugerencias, como correctores gramaticales o plataformas de intercambio de textos (ej. Journaly).",
    category: ActivityCategory.PRODUCTION,
    skill: Skill.WRITING,
  },
  {
    name: "Conversación con compañero de intercambio",
    description: "Practicar el habla y la escucha con un hablante nativo o avanzado del idioma meta, a menudo a cambio de ayudarle a practicar tu idioma nativo.",
    category: ActivityCategory.PRODUCTION,
    skill: Skill.SPEAKING,
  },
  {
    name: "Conversación con Inteligencia Artificial (IA)",
    description: "Se refiere a interactuar verbalmente o por escrito con una IA para practicar la fluidez conversacional, donde la IA puede corregir y mantener el flujo de la conversación.",
    category: ActivityCategory.PRODUCTION,
    skill: Skill.SPEAKING, // Assuming voice interaction primarily, or mixed
  },
  {
    name: "Hablar consigo mismo (mentalmente o en voz alta)",
    description: "Consiste en practicar la producción oral del idioma de forma individual, ya sea pensando en el idioma o hablando en voz alta con uno mismo.",
    category: ActivityCategory.PRODUCTION,
    skill: Skill.SPEAKING,
  },
  {
    name: "FLOW-VERLAPPING (Chorusing)",
    description: "Técnica de producción donde se escucha una frase corta en el idioma meta y se intenta repetirla simultáneamente o inmediatamente después, imitando la pronunciación, ritmo y entonación.",
    category: ActivityCategory.PRODUCTION,
    skill: Skill.SPEAKING,
  }
];


export const AVAILABLE_LANGUAGES_FOR_LEARNING: Language[] = [
  Language.SPANISH, Language.ENGLISH, Language.FRENCH, Language.GERMAN, Language.ITALIAN, Language.PORTUGUESE, Language.JAPANESE, Language.KOREAN, Language.CHINESE
]; 

export const PLACEMENT_TEST_QUESTIONS = [
  { id: 'language', label: '¿Qué idioma estás aprendiendo o quieres aprender?', type: 'select', options: AVAILABLE_LANGUAGES_FOR_LEARNING },
  { id: 'experience', label: '¿Cuánto tiempo llevas aprendiendo este idioma?', type: 'radio', options: ['Nada / Acabo de empezar', 'Unas pocas semanas', 'Unos pocos meses', '1 año o más'] },
  { id: 'understandsBasic', label: '¿Puedes entender frases básicas o saludos?', type: 'radio', options: ['No, nada', 'Sí, algunas', 'Sí, bastantes'] },
  { id: 'understandsWithSubs', label: '¿Puedes entender contenido nativo (TV, podcasts) con subtítulos en el idioma que aprendes?', type: 'radio', options: ['No', 'Un poco', 'Bastante bien', 'Casi perfectamente'] },
  { id: 'understandsWithoutSubs', label: '¿Puedes entender contenido nativo sin subtítulos?', type: 'radio', options: ['No', 'Un poco', 'Bastante bien', 'Casi perfectamente'] },
  { id: 'speakingComfort', label: '¿Qué tan cómodo/a te sientes hablando frases básicas?', type: 'radio', options: ['Nada cómodo/a', 'Un poco', 'Bastante', 'Muy cómodo/a'] },
  { id: 'mainGoal', label: '¿Cuál es tu principal objetivo con este idioma?', type: 'text', placeholder: 'Ej: Viajar, trabajo, hobby...' },
];

export const ACTIVITY_CATEGORIES_OPTIONS = [
  ActivityCategory.ACTIVE_IMMERSION,
  ActivityCategory.PASSIVE_IMMERSION,
  ActivityCategory.ACTIVE_STUDY,
  ActivityCategory.PRODUCTION,
];

// Updated to use the more descriptive names from ANTIMETHOD_ACTIVITIES_DETAILS
export const COMMON_SUB_ACTIVITIES: Record<ActivityCategory, string[]> = (() => {
  const activitiesByCat: Record<ActivityCategory, string[]> = {
    [ActivityCategory.ACTIVE_STUDY]: [],
    [ActivityCategory.ACTIVE_IMMERSION]: [],
    [ActivityCategory.PASSIVE_IMMERSION]: [],
    [ActivityCategory.PRODUCTION]: [],
  };

  ANTIMETHOD_ACTIVITIES_DETAILS.forEach(detail => {
    if (detail.category && activitiesByCat[detail.category]) {
      // Check if the activity name already exists to prevent duplicates, though should be fine
      if (!activitiesByCat[detail.category].includes(detail.name)) {
        activitiesByCat[detail.category].push(detail.name);
      }
    }
  });
  
  return activitiesByCat;
})();

export const PREDEFINED_TIPS_BY_STAGE: Record<AntimethodStage | 'GENERAL', string[]> = {
  [AntimethodStage.ONE]: [
    "No memorices, familiarízate. Aprender vocabulario no es repetir, es reconocerlo cuando lo ves.",
    "No te estanques en Anki. 700 tarjetas es la rampa de salida, no el destino.",
    "¿Gramática? Solo si la disfrutas. No la necesitas para avanzar.",
    "15 palabras hoy > 0 palabras perfectas. Lo importante es avanzar, no dominar.",
    "Usa Busuu como apoyo, no como centro. Tu motor será el input, no las apps."
  ],
  [AntimethodStage.TWO]: [
    "Tu primer objetivo no es hablar. Es entender sin miedo al idioma.",
    "Ver Netflix = Estudiar. Si lo haces con intención, cuenta.",
    "¿No entendiste todo? Está bien. Si entiendes el mensaje, ¡vas bien!",
    "Subtítulos en el idioma meta. Siempre. Son tu mejor aliado visual.",
    "No busques cada palabra. Deja que el contexto trabaje por ti.",
    "Varía tu contenido. Cambia de serie, de género, de canal… eso amplía tu input.",
    "2 horas diarias = progreso exponencial. Haz que se vuelva hábito.",
    "Lo aburrido no sirve. Si no te gusta el contenido, cámbialo ya."
  ],
  [AntimethodStage.THREE]: [
    "Di adiós a los subtítulos. Hoy puedes entender más de lo que crees.",
    "Una palabra nueva por frase. Esa es la regla de oro del minado (i+1).",
    "Minar oraciones, no palabras. Porque el contexto lo es todo.",
    "El error es minar en exceso. Solo mina frases con una sola palabra desconocida.",
    "No traduzcas. Aprende a sentir el idioma, no a traducirlo.",
    "Repite escenas que ames. Tu cerebro se entrena mejor con lo que le gusta."
  ],
  [AntimethodStage.FOUR]: [
    "No esperes hablar perfecto. Solo empieza. Ya tienes la base.",
    "Habla con IA, no con miedo. Es el lugar perfecto para practicar sin juicio.",
    "La escritura desbloquea tu habla. Lo que escribes, un día lo dirás.",
    "Grábate. Escucharte a ti mismo te da el mejor feedback.",
    "Tu acento no es un error. Es una etapa. Pulirás con el tiempo.",
    "Equivocarte es avanzar. Cada error activa tu monitor adquirido."
  ],
  GENERAL: [
    "Un mal día no borra tu progreso. Vuelve mañana.",
    "Tu progreso es invisible... hasta que un día entiendes todo.",
    "No compares tu avance. Cada camino es único.",
    "No estás solo. Hay miles aprendiendo como tú, a su ritmo.",
    "La duda es parte del proceso. La certeza llega después.",
    "Si hoy solo viste un episodio, ¡es progreso!",
    "La inmersión pasiva también cuenta. ¡Usa tus traslados!",
    "Tu input es tu inversión. No tiene resultado inmediato, pero sí inevitable.",
    "Hazlo divertido. Si no disfrutas, estás usando mal el Antimétodo.",
    "La constancia vence al talento. Hoy es mejor que perfecto."
  ]
};

export const API_KEY_WARNING = "La API Key de Gemini no está configurada. Algunas funciones (Test de Ubicación) estarán limitadas. Configura la variable de entorno process.env.API_KEY para habilitarlas.";

export const AVAILABLE_REWARDS: RewardItem[] = [
  // Existing Flairs
  { id: "flair_futuro", name: "Título: Futuro Políglota", description: "Para aquellos con grandes ambiciones lingüísticas.", type: "flair", cost: 50, value: "Futuro Políglota", category: "Perfil", icon: "/assets/icons/flair_star.svg" },
  { id: "flair_iniciante", name: "Título: Iniciante del Antimétodo", description: "Marcando el comienzo de tu viaje con el método.", type: "flair", cost: 100, value: "Iniciante del Antimétodo", category: "Perfil", icon: "/assets/icons/flair_rocket.svg" },
  { id: "flair_explorador", name: "Título: Explorador de Idiomas", description: "Aventurándose en nuevos territorios lingüísticos.", type: "flair", cost: 250, value: "Explorador de Idiomas", category: "Perfil", icon: "/assets/icons/flair_compass.svg" },
  { id: "flair_aprendiz", name: "Título: Aprendiz Constante", description: "Demuestra tu dedicación diaria.", type: "flair", cost: 350, value: "Aprendiz Constante", category: "Perfil", icon: "/assets/icons/flair_calendar.svg" },
  { id: "flair_polyglot", name: "Título: Políglota en Práctica", description: "Manejando múltiples idiomas con destreza.", type: "flair", cost: 500, value: "Políglota en Práctica", category: "Perfil", icon: "/assets/icons/flair_chat.svg" },
  { id: "flair_inmerso", name: "Título: Inmersión Profunda", description: "Sumergido totalmente en el idioma.", type: "flair", cost: 750, value: "Inmersión Profunda", category: "Perfil", icon: "/assets/icons/flair_headphones.svg" },
  { id: "flair_erudito", name: "Título: Erudito Lingüista", description: "Un conocedor profundo del idioma y su cultura.", type: "flair", cost: 1000, value: "Erudito Lingüista", category: "Perfil", icon: "/assets/icons/flair_book.svg" },
  { id: "flair_maestro", name: "Título: Maestro Políglota", description: "Dominio legendario y sabiduría idiomática.", type: "flair", cost: 2500, value: "Maestro Políglota", category: "Perfil", icon: "/assets/icons/flair_crown.svg" },
  
  // New Expensive Flairs
  { id: "flair_anti_maestro", name: "Título: El Anti-Maestro", description: "Maestría desafiante de las normas.", type: "flair", cost: 3000, value: "El Anti-Maestro", category: "Perfil", icon: "/assets/icons/flair_rebel.svg" },
  { id: "flair_sabio_input", name: "Título: Sabio del Input Comprensible", description: "Entendimiento profundo del poder del input.", type: "flair", cost: 3500, value: "Sabio del Input Comprensible", category: "Perfil", icon: "/assets/icons/flair_brain.svg" },
  { id: "flair_antilinguista_supremo", name: "Título: El Antilingüista Supremo", description: "La cúspide del aprendizaje no convencional.", type: "flair", cost: 5000, value: "El Antilingüista Supremo", category: "Perfil", icon: "/assets/icons/flair_galaxy.svg" },
  { id: "flair_hater_gramatica", name: "Título: Hater de la Gramática", description: "Porque el input es rey.", type: "flair", cost: 2800, value: "Hater de la Gramática", category: "Perfil", icon: "/assets/icons/flair_broken_book.svg" },
  { id: "flair_destructor_gramaticas", name: "Título: Destructor de Gramáticas", description: "Forjando fluidez más allá de las reglas.", type: "flair", cost: 4000, value: "Destructor de Gramáticas", category: "Perfil", icon: "/assets/icons/flair_hammer.svg" },

  // Temas (value is AppTheme type)
  { id: "theme_zen", name: "Tema: Jardín Zen", description: "Una paleta de colores calmante para máxima concentración.", type: "theme", cost: 300, value: "theme-zen", category: "Personalización Visual", icon: "/assets/icons/theme_palette.svg" },
  { id: "theme_neon", name: "Tema: Neón Nocturno", description: "Colores vibrantes para estudiar con energía.", type: "theme", cost: 300, value: "theme-neon", category: "Personalización Visual", icon: "/assets/icons/theme_palette.svg" },
  { id: "theme_ocean", name: "Tema: Brisa Marina", description: "Tonos azules y frescos para una experiencia relajante.", type: "theme", cost: 300, value: "theme-ocean", category: "Personalización Visual", icon: "/assets/icons/theme_palette.svg" },
  // New Cultural Themes
  { id: "theme_japan_neon", name: "Tema: Japón Neón", description: "Sumérgete en las vibrantes noches de Tokio.", type: "theme", cost: 400, value: "theme-japan-neon", category: "Personalización Visual", icon: "/assets/icons/theme_palette.svg" },
  { id: "theme_cafe_parisien", name: "Tema: Café Parisino", description: "Un ambiente acogedor con el encanto de París.", type: "theme", cost: 400, value: "theme-cafe-parisien", category: "Personalización Visual", icon: "/assets/icons/theme_palette.svg" },
  { id: "theme_fiesta_brasil", name: "Tema: Fiesta Brasileña", description: "Colores alegres y energía tropical.", type: "theme", cost: 400, value: "theme-fiesta-brasil", category: "Personalización Visual", icon: "/assets/icons/theme_palette.svg" },
];

// Definitions for Secret Rewards (not displayed in store, only unlockable via code)
export const SECRET_REWARDS_DEFINITIONS: RewardItem[] = [
    { id: "secret_flair_founder", name: "Título: Fundador del Antimétodo", description: "Por estar desde el inicio.", type: "flair", cost: 0, value: "Fundador del Antimétodo", category: "Secreto", icon: "/assets/icons/flair_founder.svg" }, 
    { id: "secret_flair_original_master", name: "Título: El Antimaestro Original", description: "Un pionero del método.", type: "flair", cost: 0, value: "El Antimaestro Original", category: "Secreto", icon: "/assets/icons/flair_original.svg" }, 
];

export const MASTER_REDEEM_CODE = "ANTIMETODOMASTER24";

export const REDEEM_CODES_MAP: Record<string, string> = {
  "FPGLOT24": "flair_futuro",
  "ANTINICIO24": "flair_iniciante",
  "EXPLORALANG24": "flair_explorador",
  "CONSTANTEAP24": "flair_aprendiz",
  "POLIPRAC24": "flair_polyglot",
  "INMERSIONPRO24": "flair_inmerso",
  "ERUDITOLEX24": "flair_erudito",
  "MAESTROPOLY24": "flair_maestro",
  "ZENMODE24": "theme_zen",
  "NEONNIGHT24": "theme_neon",
  "OCEANBREEZE24": "theme_ocean",
  "ANTIMAESTROSUP": "flair_anti_maestro",
  "SABIOINPUTMAX": "flair_sabio_input",
  "ANTILINGUISTAXL": "flair_antilinguista_supremo",
  "NOGRAMMARZONE": "flair_hater_gramatica",
  "GRAMMARSMASHER": "flair_destructor_gramaticas",
  "AMFOUNDERSECRET": "secret_flair_founder",
  "AMORIGINALSECRET": "secret_flair_original_master",
  "JAPANNIGHTS24": "theme_japan_neon",    // New Code
  "PARISCAFE24": "theme_cafe_parisien", // New Code
  "BRASILFEST24": "theme_fiesta_brasil", // New Code
  [MASTER_REDEEM_CODE]: "__UNLOCK_ALL__", // Special identifier for master code
};

export const ALL_REWARD_DEFINITIONS = [...AVAILABLE_REWARDS, ...SECRET_REWARDS_DEFINITIONS];