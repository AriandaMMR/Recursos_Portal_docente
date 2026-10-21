const hoja = document.getElementById("hoja");
const guiaMargenes = document.getElementById("guia-margenes");
const botones = document.querySelectorAll(".regla");
const estado = document.getElementById("estado");
const cursor = document.getElementById("cursor");

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

pilaHojas.classList.remove("comparando");
pilaHojas.querySelector(".hoja-original")?.remove();

hoja.removeAttribute("aria-hidden");

botonComparar.textContent = "Observa el cambio";
botonComparar.setAttribute("aria-pressed", "false");

  clearTimeout(temporizadorResaltado);
  aplicadas.clear();

  hoja.className = "hoja";
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

  tituloExplicacion.textContent = "Un documento, seis transformaciones";

  detalle.textContent =
    "Primero verás un texto sin formato. Después podrás tocar cada regla para aplicarla.";

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

hojaOriginal.className = "hoja hoja-original";
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

  barraProgreso.style.width = `${(cantidad / 6) * 100}%`;
  progreso.setAttribute("aria-valuenow", cantidad);
  contador.textContent = `${cantidad} de 6 reglas aplicadas`;
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

    if (aplicadas.size === 6) {
  botones.forEach((botonRegla) => {
    botonRegla.disabled = true;
  });

  accionesFinales.hidden = false;

  estado.textContent = "¡Terminaste! Ya puedes comparar el antes y el después.";

  tituloExplicacion.textContent = "¡Tu documento se transformó!";

  detalle.textContent =
    "Aplicaste las seis reglas. Pulsa «Observa el cambio» para descubrir cómo se veía el documento al principio.";
} else {
  estado.textContent = activar
    ? `Aplicaste: ${regla.titulo}.`
    : "Retiraste la regla. Tócala de nuevo para comparar.";
}
 }); 
});

document.getElementById("reiniciar").addEventListener("click", iniciar);

botonComparar.addEventListener("click", async () => {
  if (comparacionEnCurso || aplicadas.size !== 6) return;

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
    ? "Antes: documento sin formato"
    : "Después: documento con formato";

  detalle.textContent = comparando
    ? "Observa los márgenes, las líneas, la sangría, la fuente, la numeración y la alineación antes de aplicar las reglas."
    : "Aquí puedes ver juntas las seis correcciones que realizaste.";

  estado.textContent = comparando
    ? "Estás viendo el documento original."
    : "Estás viendo el documento con las seis reglas aplicadas.";

  await esperar(reducirMovimiento.matches ? 0 : 700);

  // Si se reinició durante el giro, termina esta operación.
  if (turnoActual !== ejecucion) return;

  if (!comparando) {
    hojaOriginal.style.visibility = "";
  }

  comparacionEnCurso = false;
});

iniciar();