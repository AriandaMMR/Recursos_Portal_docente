const hoja = document.getElementById("hoja");
const guiaMargenes = document.getElementById("guia-margenes");
const botones = document.querySelectorAll(".regla");
// Prepara la cara inicial y la cara posterior de cada tarjeta.
botones.forEach((boton) => {
  const titulo = boton.querySelector("strong").textContent;
  const numero = boton.querySelector(".numero").textContent;

  const giro = document.createElement("span");
  giro.className = "tarjeta-giro";
  giro.setAttribute("aria-hidden", "true");

  const frente = document.createElement("span");
  frente.className = "tarjeta-cara tarjeta-frente";

  // Mueve el contenido actual al frente sin perder sus elementos.
  while (boton.firstChild) {
    frente.append(boton.firstChild);
  }

  const reverso = document.createElement("span");
  reverso.className = "tarjeta-cara tarjeta-reverso";

  const informacion = document.createElement("span");

  const tituloPosterior = document.createElement("strong");
  tituloPosterior.textContent = titulo;

  const confirmacion = document.createElement("small");
  confirmacion.textContent = "Regla aplicada";

  const numeroPosterior = document.createElement("span");
  numeroPosterior.className = "numero numero-posterior";
  numeroPosterior.textContent = numero;

  informacion.append(tituloPosterior, confirmacion);
  reverso.append(informacion, numeroPosterior);

  giro.append(frente, reverso);
  boton.append(giro);

  boton.setAttribute("aria-label", titulo);
});
const totalReglas = botones.length;
const estado = document.getElementById("estado");
const cursor = document.getElementById("cursor");
const selloAprobado = document.getElementById("sello-aprobado");
const letrasSello = document.getElementById("letras-sello");
const zonaDocumento = document.querySelector(".zona-documento");
// Coloca el sello dentro de la hoja principal.
hoja.append(selloAprobado);

const pilaHojas = document.getElementById("pila-hojas");
const accionesFinales = document.getElementById("acciones-finales");
const botonComparar = document.getElementById("comparar");

let comparando = false;
let comparacionEnCurso = false;

const tituloExplicacion = document.getElementById("titulo-explicacion");
const detalle = document.getElementById("detalle");

const progreso = document.getElementById("progreso");
const barraProgreso = document.getElementById("barra-progreso");
const contador = document.getElementById("contador");

const reducirMovimiento = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const textos = [
  {
    elemento: document.getElementById("parrafo-uno"),
    texto:
      "Aprender en entornos digitales permite explorar nuevas formas de construir conocimiento. La organización, la participación y el uso de recursos educativos ayudan a desarrollar una experiencia de aprendizaje más autónoma."
  },
  {
    elemento: document.getElementById("parrafo-dos"),
    texto:
      "Presentar las ideas con claridad también implica cuidar la forma del documento. Un formato consistente facilita la lectura y permite reconocer la estructura de cada párrafo."
  }
];

const reglas = {
  margenes: {
    clase: "con-margenes",
    titulo: "Márgenes: 2.54 cm",
    descripcion:
      "Utiliza márgenes de 2.54 cm en los cuatro lados de la página. Observa cómo el contenido se separa de los bordes."
  },

  interlineado: {
    clase: "con-interlineado",
    titulo: "Interlineado doble",
    descripcion:
      "En el cuerpo del trabajo utiliza interlineado doble, sin espacio adicional antes o después de los párrafos. Observa cómo se separan las líneas."
  },

  sangria: {
    clase: "con-sangria",
    titulo: "Sangría de primera línea: 1.27 cm",
    descripcion:
      "La primera línea de los párrafos del cuerpo del texto lleva una sangría de 1.27 cm. Aquí se representa visualmente el desplazamiento."
  },

  fuente: {
    clase: "con-fuente",
    titulo: "Fuente legible y consistente",
    descripcion:
      "APA permite distintas fuentes. En este ejemplo elegimos Arial de 11 puntos, representada a escala en pantalla. Mantén la elección de forma consistente."
  },

  paginacion: {
    clase: "con-paginacion",
    titulo: "Número de página: arriba a la derecha",
    descripcion:
      "Numera las páginas en la esquina superior derecha, incluida la portada. Aquí aparece el número 2 porque estamos representando una página del cuerpo del trabajo después de la portada."
  },

  alineacion: {
    clase: "con-alineacion",
    titulo: "Alineación a la izquierda",
    descripcion:
      "Alinea los párrafos a la izquierda y conserva irregular el borde derecho. Evita justificar el texto."
  }
};

const aplicadas = new Set();

// Permite cancelar una escritura anterior al reiniciar.
let ejecucion = 0;
let temporizadorResaltado;

const esperar = (milisegundos) =>
  new Promise((resolver) => setTimeout(resolver, milisegundos));

async function iniciar() {
  const turnoActual = ++ejecucion;
  comparando = false;
comparacionEnCurso = false;

accionesFinales.hidden = true;

selloAprobado.hidden = true;
letrasSello.replaceChildren();

zonaDocumento.classList.remove("halo-naranja");

botones.forEach((boton) => {
  boton.classList.remove("flip-scale-up-ver");
});

pilaHojas.classList.remove("comparando");
pilaHojas.querySelector(".hoja-original")?.remove();

hoja.removeAttribute("aria-hidden");

botonComparar.textContent = "Observa el cambio";
botonComparar.setAttribute("aria-pressed", "false");

  clearTimeout(temporizadorResaltado);
  aplicadas.clear();

 hoja.className =
  "hoja con-margenes con-interlineado con-sangria";
  guiaMargenes.classList.remove("trazando");

  botones.forEach((boton) => {
    boton.disabled = true;
    boton.classList.remove("activa");
    boton.setAttribute("aria-pressed", "false");
    boton.querySelector(".marca").textContent = "+";
  });

  textos.forEach(({ elemento }) => {
    elemento.textContent = "";
  });

  actualizarProgreso();

  tituloExplicacion.textContent = "Un documento, tres transformaciones";

  detalle.textContent =
    "Los márgenes, el interlineado y la sangría de párrafo ya están preparados. Aplica las tres reglas de presentación.";

  estado.textContent = "Estamos preparando tu documento…";
  cursor.hidden = true;

  // Reinicia la animación de apertura.
  void hoja.offsetWidth;
  hoja.classList.add("entrada");

  await esperar(reducirMovimiento.matches ? 0 : 1150);

  if (turnoActual !== ejecucion) return;

  estado.textContent = "Observa cómo se escribe el texto.";
  cursor.hidden = false;

  for (const { elemento, texto } of textos) {
    if (reducirMovimiento.matches) {
      elemento.textContent = texto;
      continue;
    }

    // Escribe por grupos para que la introducción sea breve.
    for (let posicion = 0; posicion < texto.length; posicion += 4) {
      if (turnoActual !== ejecucion) return;

      elemento.textContent = texto.slice(0, posicion + 4);
      await esperar(18);
    }
  }

  if (turnoActual !== ejecucion) return;

  cursor.hidden = true;
  hoja.classList.remove("entrada");

  // Guarda una copia del documento sin las reglas aplicadas.
const hojaOriginal = hoja.cloneNode(true);

hojaOriginal.className =
  "hoja con-margenes con-interlineado con-sangria hoja-original";
hojaOriginal.removeAttribute("id");

// Evita repetir los identificadores del documento principal.
hojaOriginal.querySelectorAll("[id]").forEach((elemento) => {
  elemento.removeAttribute("id");
});

hojaOriginal.setAttribute("aria-label", "Documento original sin formato");
hojaOriginal.setAttribute("aria-hidden", "true");

pilaHojas.prepend(hojaOriginal);

  botones.forEach((boton) => {
    boton.disabled = false;
  });

  estado.textContent = "Tu turno: toca una regla para transformar la hoja.";
}

function actualizarProgreso() {
  const cantidad = aplicadas.size;

  barraProgreso.style.width =
    `${(cantidad / totalReglas) * 100}%`;

  progreso.setAttribute("aria-valuemax", totalReglas);
  progreso.setAttribute("aria-valuenow", cantidad);

  contador.textContent =
    `${cantidad} de ${totalReglas} reglas aplicadas`;
}

botones.forEach((boton) => {
  boton.setAttribute("aria-pressed", "false");

  boton.addEventListener("click", () => {
    const nombre = boton.dataset.regla;
    const regla = reglas[nombre];

    const activar = !aplicadas.has(nombre);

    if (activar) {
      aplicadas.add(nombre);
    } else {
      aplicadas.delete(nombre);
    }

    hoja.classList.toggle(regla.clase, activar);
    if (nombre === "margenes") {
  guiaMargenes.classList.remove("trazando");

  if (activar && !reducirMovimiento.matches) {
    // Permite volver a reproducir la animación.
    void guiaMargenes.getBoundingClientRect();

    guiaMargenes.classList.add("trazando");
  }
}
    boton.classList.toggle("activa", activar);


// Reinicia el halo detrás del documento.
zonaDocumento.classList.remove("halo-naranja");
void zonaDocumento.offsetWidth;
zonaDocumento.classList.add("halo-naranja");
    boton.setAttribute("aria-pressed", String(activar));

    boton.querySelector(".marca").textContent = activar ? "✓" : "+";

    tituloExplicacion.textContent = regla.titulo;
    detalle.textContent = regla.descripcion;

    clearTimeout(temporizadorResaltado);

    hoja.classList.remove("resaltar");
    void hoja.offsetWidth;
    hoja.classList.add("resaltar");

    temporizadorResaltado = setTimeout(() => {
      hoja.classList.remove("resaltar");
    }, 900);

    actualizarProgreso();

    if (aplicadas.size === totalReglas) {
      mostrarSello();
  botones.forEach((botonRegla) => {
    botonRegla.disabled = true;
  });

  accionesFinales.hidden = false;

  estado.textContent = "¡Terminaste! Ya puedes comparar el antes y el después.";

  tituloExplicacion.textContent = "¡Tu documento se transformó!";

  detalle.textContent =
    "Aplicaste las tres reglas. Pulsa «Observa el cambio» para comparar la presentación inicial y la final.";
} else {
  estado.textContent = activar
    ? `Aplicaste: ${regla.titulo}.`
    : "Retiraste la regla. Tócala de nuevo para comparar.";
}
 }); 
});

document.getElementById("reiniciar").addEventListener("click", iniciar);

botonComparar.addEventListener("click", async () => {
  if (comparacionEnCurso || aplicadas.size !== totalReglas) return;

  comparacionEnCurso = true;
  const turnoActual = ejecucion;

  comparando = !comparando;

  const hojaOriginal = pilaHojas.querySelector(".hoja-original");

  // Mantiene visible la copia durante todo el giro.
  hojaOriginal.style.visibility = "visible";

  // Evita que un resaltado anterior interfiera con la comparación.
  hoja.classList.remove("resaltar");

  pilaHojas.classList.toggle("comparando", comparando);

  hoja.setAttribute("aria-hidden", String(comparando));
  hojaOriginal.setAttribute("aria-hidden", String(!comparando));

  botonComparar.setAttribute("aria-pressed", String(comparando));

  botonComparar.textContent = comparando
    ? "Volver al documento con formato"
    : "Observa el cambio";

  tituloExplicacion.textContent = comparando
    ? "Antes: presentación inicial"
    : "Después: presentación corregida";

  detalle.textContent = comparando
    ? "Observa la fuente, la numeración y la alineación antes de aplicar las tres reglas."
    : "Aquí puedes ver juntas las tres correcciones que realizaste.";

  estado.textContent = comparando
    ? "Estás viendo el documento original."
    : "Estás viendo el documento con las tres reglas aplicadas.";

  await esperar(reducirMovimiento.matches ? 0 : 700);

  // Si se reinició durante el giro, termina esta operación.
  if (turnoActual !== ejecucion) return;

  if (!comparando) {
    hojaOriginal.style.visibility = "";
  }

  comparacionEnCurso = false;
});

botones.forEach((boton) => {
  boton.addEventListener("animationend", (evento) => {
    if (
      evento.target === boton &&
      evento.animationName === "flip-scale-up-ver"
    ) {
      boton.classList.remove("flip-scale-up-ver");
    }
  });
});

function mostrarSello() {
  letrasSello.replaceChildren();

  Array.from("Formato APA aplicado").forEach((letra, indice) => {
    const elemento = document.createElement("span");

    elemento.textContent = letra;
    elemento.style.setProperty(
      "--retraso",
      `${indice * .045}s`
    );

    letrasSello.append(elemento);
  });

  selloAprobado.hidden = false;
}

iniciar();

// ACTIVIDAD INDEPENDIENTE DE CITAS EN BLOQUE.

const ejemplosCitas = [
  {
    texto:
      "La retroalimentación permite reconocer avances y orientar nuevas decisiones durante el aprendizaje",
    fuente: "(López, 2024, p. 12)"
  },
  {
    texto:
      "La participación en un entorno virtual requiere espacios donde las personas puedan expresar dudas, compartir experiencias y revisar sus ideas con apoyo de otros. Cuando estas oportunidades se integran de manera constante, el aprendizaje se convierte en un proceso de colaboración, reflexión y construcción compartida",
    fuente: "(Martínez, 2023, p. 28)"
  },
  {
    texto:
      "Organizar el tiempo de estudio ayuda a distribuir las tareas y mantener una participación constante",
    fuente: "(García, 2024, p. 9)"
  },
  {
    texto:
      "El uso de recursos digitales adquiere sentido cuando responde a una intención educativa clara. No basta con incorporar herramientas novedosas, pues también es necesario acompañar a los estudiantes, ofrecer instrucciones comprensibles y generar oportunidades para aplicar lo aprendido en situaciones relacionadas con su contexto cotidiano",
    fuente: "(Rivera, 2025, p. 35)"
  }
];

const listaCitas = document.getElementById("lista-citas");
const formularioCitas = document.getElementById("ejercicio-citas");
const resultadoCitas = document.getElementById("resultado-citas");
const reintentarCitas = document.getElementById("reintentar-citas");

let citasRevisadas = false;

ejemplosCitas.forEach((ejemplo, indice) => {
  // Solo se cuentan las palabras del texto citado.
  ejemplo.palabras = ejemplo.texto.trim().split(/\s+/).length;
  ejemplo.necesitaBloque = ejemplo.palabras >= 40;

  const tarjeta = document.createElement("article");
  tarjeta.className = "cita-ejercicio";

  tarjeta.innerHTML = `
    <div class="cabecera-cita">
      <h3>Ejemplo ${indice + 1}</h3>
      <span class="conteo-palabras">
        ${ejemplo.palabras} palabras
      </span>
    </div>

    <p class="texto-cita">
      <span class="contenido-cita"></span>
      <span class="fuente-cita"></span>
    </p>

    <label class="opcion-cita">

  <input
    class="interruptor-input"
    type="checkbox"
    role="switch"
  >

  <span class="interruptor-pista" aria-hidden="true">
    <span class="interruptor-perilla"></span>
  </span>

  <span>Aplicar sangría de bloque de 1.27 cm</span>

</label>

    <p class="feedback-cita" hidden></p>
  `;

  tarjeta.querySelector(".contenido-cita").textContent =
    ejemplo.texto;

  tarjeta.querySelector(".fuente-cita").textContent =
    ejemplo.fuente;

  const casilla = tarjeta.querySelector("input");

  casilla.setAttribute(
    "aria-label",
    `Aplicar sangría de bloque al ejemplo ${indice + 1}`
  );

  casilla.addEventListener("change", () => {
    tarjeta.classList.toggle("seleccionada", casilla.checked);
  });

  const pista = tarjeta.querySelector(".interruptor-pista");
const etiqueta = tarjeta.querySelector(".opcion-cita");

let arrastre = null;
let bloquearClic = false;

pista.addEventListener("pointerdown", (evento) => {
  if (casilla.disabled || evento.button !== 0) return;

  casilla.focus({ preventScroll: true });

  arrastre = {
    id: evento.pointerId,
    inicio: evento.clientX,
    base: casilla.checked ? 128 : 0,
    posicion: casilla.checked ? 128 : 0,
    movido: false
  };

  pista.setPointerCapture(evento.pointerId);
});

pista.addEventListener("pointermove", (evento) => {
  if (!arrastre || evento.pointerId !== arrastre.id) return;

  const desplazamiento = evento.clientX - arrastre.inicio;

  if (Math.abs(desplazamiento) > 5) {
    arrastre.movido = true;
    pista.classList.add("arrastrando");
  }

  if (!arrastre.movido) return;

  arrastre.posicion = Math.max(
    0,
    Math.min(128, arrastre.base + desplazamiento)
  );

  pista.style.setProperty(
    "--posicion",
    `${arrastre.posicion}px`
  );
});

pista.addEventListener("pointerup", (evento) => {
  if (!arrastre || evento.pointerId !== arrastre.id) return;

  if (arrastre.movido) {
    casilla.checked = arrastre.posicion >= 64;

    casilla.dispatchEvent(
      new Event("change", { bubbles: true })
    );

    // Evita que el clic generado al soltar vuelva a cambiarlo.
    bloquearClic = true;

    setTimeout(() => {
      bloquearClic = false;
    }, 0);
  }

  pista.classList.remove("arrastrando");
  pista.style.removeProperty("--posicion");

  arrastre = null;
});

pista.addEventListener("pointercancel", () => {
  pista.classList.remove("arrastrando");
  pista.style.removeProperty("--posicion");
  arrastre = null;
});

etiqueta.addEventListener("click", (evento) => {
  if (bloquearClic) {
    evento.preventDefault();
    bloquearClic = false;
  }
});

  listaCitas.append(tarjeta);
});

formularioCitas.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (citasRevisadas) return;

  citasRevisadas = true;

  let aciertos = 0;

  const tarjetas = listaCitas.querySelectorAll(".cita-ejercicio");

  tarjetas.forEach((tarjeta, indice) => {
    const ejemplo = ejemplosCitas[indice];
    const casilla = tarjeta.querySelector("input");
    const feedback = tarjeta.querySelector(".feedback-cita");

    const correcta =
      casilla.checked === ejemplo.necesitaBloque;

    if (correcta) aciertos++;

    tarjeta.classList.add(
      correcta ? "correcta" : "incorrecta"
    );

    feedback.hidden = false;

    const motivo = ejemplo.necesitaBloque
      ? `Tiene ${ejemplo.palabras} palabras: debe presentarse en bloque, sin comillas y con sangría izquierda de 1.27 cm.`
      : `Tiene ${ejemplo.palabras} palabras: se integra en el párrafo entre comillas, sin sangría adicional de bloque.`;

    feedback.textContent =
      `${correcta ? "✓ Correcto." : "Revisa tu elección."} ${motivo}`;

    casilla.disabled = true;
  });

  resultadoCitas.textContent =
    `Obtuviste ${aciertos} de ${ejemplosCitas.length} respuestas correctas.`;

  formularioCitas.querySelector('[type="submit"]').disabled = true;

  reintentarCitas.hidden = false;
});

reintentarCitas.addEventListener("click", () => {
  citasRevisadas = false;

  listaCitas.querySelectorAll(".cita-ejercicio").forEach((tarjeta) => {
    tarjeta.classList.remove(
      "correcta",
      "incorrecta",
      "seleccionada"
    );

    const casilla = tarjeta.querySelector("input");

    casilla.checked = false;
    casilla.disabled = false;

    const feedback = tarjeta.querySelector(".feedback-cita");

    feedback.hidden = true;
    feedback.textContent = "";
  });

  resultadoCitas.textContent = "";
  reintentarCitas.hidden = true;

  formularioCitas.querySelector('[type="submit"]').disabled = false;

  listaCitas.querySelector("input").focus();
});