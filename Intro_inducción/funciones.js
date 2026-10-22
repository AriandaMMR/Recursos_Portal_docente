"use strict";

const canvas = document.getElementById("escena");
const ctx = canvas.getContext("2d");

const ANCHO = 1920;
const ALTO = 1080;

const primeraLinea = "Tips para iniciar tu";
const segundaLinea = "Curso de Inducción";

let comienzo = performance.now();
let fuenteLista = false;

/*
  Cada círculo tiene una posición inicial.

  limiteX y limiteY indican cuánto puede alejarse.
  vx y vy indican su velocidad en píxeles por segundo.
*/
const circulos = [
  {
    x: 335, y: 210, radio: 88, color: "#ff8133",
    limiteX: 28, limiteY: 22, vx: 12, vy: 9
  },
  {
    x: 1180, y: -25, radio: 88, color: "#ff8133",
    limiteX: 24, limiteY: 20, vx: -10, vy: 8
  },
  {
    x: 110, y: 1110, radio: 88, color: "#ff8133",
    limiteX: 25, limiteY: 20, vx: 9, vy: -8
  },
  {
    x: 1670, y: 1095, radio: 88, color: "#ff8133",
    limiteX: 30, limiteY: 24, vx: -12, vy: 10
  },
  {
    x: 95, y: 890, radio: 88, color: "#ffffff",
    limiteX: 25, limiteY: 26, vx: 11, vy: -9
  },
  {
    x: 1195, y: 190, radio: 88, color: "#ffffff",
    limiteX: 28, limiteY: 22, vx: -9, vy: 11
  }
];

/*
  Convierte un desplazamiento en un recorrido de ida y vuelta.
  Al llegar al límite, la dirección se invierte.
*/
function rebotar(desplazamiento, limite) {
  const periodo = limite * 4;

  const posicion =
    ((desplazamiento + limite) % periodo + periodo) % periodo;

  return posicion <= limite * 2
    ? posicion - limite
    : limite * 3 - posicion;
}

function dibujarFondo(tiempo) {
  ctx.fillStyle = "#dce7ff";
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // Las zonas de color se desplazan suavemente.
  const x = ANCHO * (.35 + Math.sin(tiempo * .3) * .2);
  const y = ALTO * (.4 + Math.cos(tiempo * .25) * .2);

  const azul = ctx.createRadialGradient(
    x, y, 0,
    x, y, 1200
  );

  azul.addColorStop(0, "rgba(41,106,255,.19)");
  azul.addColorStop(1, "rgba(41,106,255,0)");

  ctx.fillStyle = azul;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  const claro = ctx.createRadialGradient(
    ANCHO - x, ALTO - y, 0,
    ANCHO - x, ALTO - y, 850
  );

  claro.addColorStop(0, "rgba(255,255,255,.48)");
  claro.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = claro;
  ctx.fillRect(0, 0, ANCHO, ALTO);
}

function dibujarCapsula(x, y, ancho, alto, tiempo, fase) {
  const radio = ancho / 2;

  // Dibuja una cápsula con extremos redondeados.
  ctx.beginPath();
  ctx.moveTo(x + radio, y);

  ctx.arc(
    x + radio,
    y + radio,
    radio,
    -Math.PI / 2,
    0
  );

  ctx.lineTo(x + ancho, y + alto - radio);

  ctx.arc(
    x + radio,
    y + alto - radio,
    radio,
    0,
    Math.PI
  );

  ctx.lineTo(x, y + radio);

  ctx.arc(
    x + radio,
    y + radio,
    radio,
    Math.PI,
    Math.PI * 1.5
  );

  ctx.closePath();

  const mezcla = (Math.sin(tiempo * .65 + fase) + 1) / 2;

  const degradado = ctx.createLinearGradient(
    x,
    y - alto * mezcla,
    x,
    y + alto * (2 - mezcla)
  );

  degradado.addColorStop(0, "#24b9f5");
  degradado.addColorStop(.5, "#296aff");
  degradado.addColorStop(1, "#24b9f5");

  ctx.fillStyle = degradado;
  ctx.fill();
}

function dibujarFiguras(tiempo) {
  dibujarCapsula(30, -90, 180, 460, tiempo, 0);
  dibujarCapsula(880, -210, 180, 480, tiempo, 2);
  dibujarCapsula(245, 825, 180, 470, tiempo, 4);
  dibujarCapsula(1780, 945, 180, 450, tiempo, 1);

  circulos.forEach((circulo) => {
    const x = circulo.x + rebotar(
      tiempo * circulo.vx,
      circulo.limiteX
    );

    const y = circulo.y + rebotar(
      tiempo * circulo.vy,
      circulo.limiteY
    );

    ctx.beginPath();
    ctx.arc(x, y, circulo.radio, 0, Math.PI * 2);

    ctx.fillStyle = circulo.color;
    ctx.fill();
  });
}

function dibujarTexto(tiempo) {
  const inicioUno = .7;
  const velocidadUno = .085;

  const inicioDos =
    inicioUno + primeraLinea.length * velocidadUno + .4;

  const velocidadDos = .1;

  const cantidadUno = Math.max(
    0,
    Math.min(
      primeraLinea.length,
      Math.floor((tiempo - inicioUno) / velocidadUno)
    )
  );

  const cantidadDos = Math.max(
    0,
    Math.min(
      segundaLinea.length,
      Math.floor((tiempo - inicioDos) / velocidadDos)
    )
  );

  const textoUno = primeraLinea.slice(0, cantidadUno);
  const textoDos = segundaLinea.slice(0, cantidadDos);

  const x = 120;
  const yUno = 520;
  const yDos = 630;
  const tamano = 86;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.font = `400 ${tamano}px Montserrat, Arial, sans-serif`;
  ctx.fillStyle = "#101010";
  ctx.fillText(textoUno, x, yUno);

  const anchoUno = ctx.measureText(textoUno).width;

  ctx.font = `700 ${tamano}px Montserrat, Arial, sans-serif`;
  ctx.fillStyle = "#ff8133";
  ctx.fillText(textoDos, x, yDos);

  const anchoDos = ctx.measureText(textoDos).width;

  // El cursor continúa parpadeando después de terminar.
  const cursorVisible = Math.floor(tiempo / .45) % 2 === 0;

  if (cursorVisible) {
    const segundaActiva = tiempo >= inicioDos;

    const cursorX = x + (
      segundaActiva ? anchoDos : anchoUno
    ) + 8;

    const cursorY = segundaActiva ? yDos : yUno;

    ctx.fillStyle = segundaActiva ? "#ff8133" : "#101010";
    ctx.fillRect(cursorX, cursorY - 72, 4, 85);
  }
}

function dibujar(tiempo) {
  dibujarFondo(tiempo);
  dibujarFiguras(tiempo);

  if (fuenteLista) {
    dibujarTexto(tiempo);
  }
}

function animar(ahora) {
  const tiempo = (ahora - comienzo) / 1000;

  dibujar(tiempo);
  requestAnimationFrame(animar);
}

/*
  Conexión con el grabador existente.
  Conserva los nombres que ese archivo necesita.
*/
window.controlAnimacion = {
  canvas,

  prepararGrabacion(ancho, alto) {
    canvas.width = ancho;
    canvas.height = alto;

    comienzo = performance.now();
    dibujar(0);
  },

  terminarGrabacion() {
    // La vista previa continúa después de descargar el video.
  }
};

async function preparar() {
  await document.fonts.load("400 86px Montserrat");
  await document.fonts.load("700 86px Montserrat");
  await document.fonts.ready;

  fuenteLista = true;
  comienzo = performance.now();

  document.getElementById("btnGrabar").disabled = false;

  document.getElementById("estadoGrabacion").textContent =
    "Listo · Full HD · 10 segundos";
}

requestAnimationFrame(animar);

preparar().catch((error) => {
  console.error(error);

  document.getElementById("estadoGrabacion").textContent =
    "No se pudo preparar la fuente. Revisa su ruta.";
});