(function () {
  "use strict";

  // ==========================================
  // AJUSTES DE ESTA ANIMACIÓN
  // ==========================================

const CONFIG = {
  duracion: 3,
  velocidad: 0.55,
  cantidad: 128,

  cadaCuantosFlotante: 4,

opacidadLineas: 0.30,
tamanoPuntos: 0.10,

  fondo: "#f4efe6",
  puntos: "#296aff",
  lineas: "#296aff",
  naranja: "#ff8500",

  radio: 2.35,
  grosor: 0.55,
  distanciaConexion: 0.82,
  opacidadLineas: 1,
  tamanoPuntos: 0.10,
};

  // ==========================================
  // PREPARACIÓN
  // ==========================================

  if (!window.THREE) {
    console.error(
      "No se cargó three.min.js. Revisa su nombre y ubicación."
    );
    return;
  }

  const contenedor = document.querySelector("#fondo");

  if (!contenedor) {
    console.error("No se encontró el elemento #fondo.");
    return;
  }

  const escena = new THREE.Scene();
  escena.background = new THREE.Color(CONFIG.fondo);

  const camara = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    100
  );

  const renderizador = new THREE.WebGLRenderer({
    antialias: true
  });

  renderizador.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  contenedor.appendChild(renderizador.domElement);

  // Permite trabajar con distintas versiones de Three.js.
  function agregarAtributo(geometria, nombre, datos) {
    const atributo = new THREE.BufferAttribute(datos, 3);

    if (geometria.setAttribute) {
      geometria.setAttribute(nombre, atributo);
    } else {
      geometria.addAttribute(nombre, atributo);
    }
  }

  // ==========================================
  // PUNTOS
  // ==========================================

  const cantidad = CONFIG.cantidad;
  const posiciones = new Float32Array(cantidad * 3);
  const datosPuntos = [];

  for (let i = 0; i < cantidad; i++) {
    datosPuntos.push({
      inicioX: (Math.random() - 0.5) * 14,
      inicioY: (Math.random() - 0.5) * 8,
      inicioZ: (Math.random() - 0.5) * 2,

      angulo:
        (i / cantidad) * Math.PI * 2 +
        (Math.random() - 0.5) * 0.08,

      radio:
        CONFIG.radio +
        (Math.random() - 0.5) * CONFIG.grosor,

      profundidad: (Math.random() - 0.5) * 0.35,
      fase: Math.random() * Math.PI * 2
    });
  }

  const geometriaPuntos = new THREE.BufferGeometry();

  agregarAtributo(
    geometriaPuntos,
    "position",
    posiciones
  );

  // Textura circular para que los puntos se vean redondos.
  const lienzoPunto = document.createElement("canvas");
  lienzoPunto.width = 64;
  lienzoPunto.height = 64;

  const contextoPunto = lienzoPunto.getContext("2d");

 contextoPunto.clearRect(0, 0, 64, 64);

contextoPunto.fillStyle = "#ffffff";
contextoPunto.beginPath();
contextoPunto.arc(32, 32, 29, 0, Math.PI * 2);
contextoPunto.fill();

  const texturaPunto = new THREE.Texture(lienzoPunto);
  texturaPunto.needsUpdate = true;
  const coloresPuntos = new Float32Array(cantidad * 3);

const azulNodos = new THREE.Color(CONFIG.puntos);
const naranjaNodos = new THREE.Color(CONFIG.naranja);

for (let i = 0; i < cantidad; i++) {
  const color = i % CONFIG.cadaCuantosFlotante === 0
    ? naranjaNodos
    : azulNodos;

  coloresPuntos[i * 3] = color.r;
  coloresPuntos[i * 3 + 1] = color.g;
  coloresPuntos[i * 3 + 2] = color.b;
}

agregarAtributo(
  geometriaPuntos,
  "color",
  coloresPuntos
);

const materialPuntos = new THREE.PointsMaterial({
  color: "#ffffff",
  vertexColors: true,
  size: CONFIG.tamanoPuntos,
  map: texturaPunto,
  transparent: true,
  opacity: 1,
  alphaTest: 0.5,
  depthWrite: false,
  sizeAttenuation: true
});

  const puntos = new THREE.Points(
    geometriaPuntos,
    materialPuntos
  );

  puntos.frustumCulled = false;
  escena.add(puntos);

  // ==========================================
  // CONEXIONES
  // ==========================================

  const maxConexiones = cantidad * (cantidad - 1) / 2;

  const posicionesLineas = new Float32Array(
    maxConexiones * 6
  );

  const geometriaLineas = new THREE.BufferGeometry();

  agregarAtributo(
    geometriaLineas,
    "position",
    posicionesLineas
  );

  geometriaLineas.setDrawRange(0, 0);

  const coloresLineas = new Float32Array(
  posicionesLineas.length
);

agregarAtributo(
  geometriaLineas,
  "color",
  coloresLineas
);

const colorBeige = new THREE.Color(CONFIG.fondo);
const colorAzul = new THREE.Color(CONFIG.lineas);
const colorNaranja = new THREE.Color(CONFIG.naranja);
const colorConexion = new THREE.Color();

 const materialLineas = new THREE.LineBasicMaterial({
  color: "#ffffff",
  vertexColors: true,
  transparent: false,
  opacity: 1,
  depthWrite: false
});

  const lineas = new THREE.LineSegments(
    geometriaLineas,
    materialLineas
  );

  lineas.frustumCulled = false;
  escena.add(lineas);

  // ==========================================
  // AJUSTE A LA PANTALLA
  // ==========================================

  let grabandoVideo = false;

function ajustarPantalla() {
  if (grabandoVideo) return; 

  
    const ancho = Math.max(1, contenedor.clientWidth);
    const alto = Math.max(1, contenedor.clientHeight);
    const aspecto = ancho / alto;

    camara.aspect = aspecto;

    // Mantiene el círculo completo dentro de la pantalla.
    const espacio =
      CONFIG.radio + CONFIG.grosor / 2 + 0.45;

    camara.position.z =
      espacio /
      Math.tan(Math.PI / 8) /
      Math.min(1, aspecto) + 0.5;

    camara.updateProjectionMatrix();

    renderizador.setSize(ancho, alto);
  }

  window.addEventListener("resize", ajustarPantalla);
  ajustarPantalla();

  // ==========================================
  // TIEMPO Y REINICIO
  // ==========================================

  let inicio = performance.now();
  let anterior = inicio;
  let movimiento = 0;

  function reiniciar() {
    inicio = performance.now();
    anterior = inicio;
    movimiento = 0;
  }

  // ==========================================
  // ANIMACIÓN
  // ==========================================

  function animar(ahora) {
    requestAnimationFrame(animar);

    const delta = Math.min(
      Math.max((ahora - anterior) / 1000, 0),
      0.05
    );

    anterior = ahora;
    movimiento += delta * CONFIG.velocidad;

    const tiempo = (ahora - inicio) / 1000;

    const progreso = Math.min(
      tiempo / Math.max(CONFIG.duracion, 0.001),
      1
    );

    // Suaviza la llegada de los puntos al círculo.
    const mezcla =
      progreso * progreso * (3 - 2 * progreso);

      // Movimiento adicional a partir del segundo 8.
const tiempoExtra = Math.max(0, tiempo - 8);

// Entrada gradual del movimiento.
const entrada = Math.min(tiempoExtra / 1.5, 1);
const suavizado = entrada * entrada * (3 - 2 * entrada);

// Un reajuste cada 4 segundos.
// Cada reajuste dura 1.2 segundos y gira unos 40 grados.
const ciclo = Math.floor(tiempoExtra / 4);
const faseCiclo = tiempoExtra - ciclo * 4;

const avanceReajuste = Math.min(faseCiclo / 1.2, 1);
const reajusteSuave =
  avanceReajuste *
  avanceReajuste *
  (3 - 2 * avanceReajuste);

const giroReajuste =
  (ciclo + reajusteSuave) * 0.70;

// Giro continuo lento con arranque gradual.
const giroLento =
  0.10 *
  (
    tiempoExtra -
    0.6 * (1 - Math.exp(-tiempoExtra / 0.6))
  );

const giroAdicional = giroLento + giroReajuste;

// Respiración: abre y cierra el aro cada 6 segundos.
const respiracion =
  Math.sin(tiempoExtra * Math.PI * 2 / 6) *
  0.16 *
  suavizado;

    for (let i = 0; i < cantidad; i++) {
      const punto = datosPuntos[i];
      const indice = i * 3;

      // Posición dispersa con movimiento.
           // Posición inicial con movimiento suave.
      const libreX =
        punto.inicioX +
        Math.sin(movimiento + punto.fase) * 0.20;

      const libreY =
        punto.inicioY +
        Math.cos(movimiento + punto.fase) * 0.20;

      const libreZ = punto.inicioZ;

            // Uno de cada cinco puntos se queda flotando por fuera.
      if (i % CONFIG.cadaCuantosFlotante === 0) {
        const distancia = Math.sqrt(
          libreX * libreX + libreY * libreY
        );

        // Mantiene libres el círculo y el espacio del logo.
        const distanciaMinima =
          CONFIG.radio + CONFIG.grosor / 2 + 0.65;

        const anguloFlotante = Math.atan2(libreY, libreX);
        const radioFlotante = Math.max(
          distancia,
          distanciaMinima
        );

        posiciones[indice] =
          Math.cos(anguloFlotante) * radioFlotante;

        posiciones[indice + 1] =
          Math.sin(anguloFlotante) * radioFlotante;

        posiciones[indice + 2] = libreZ;

        // Este punto no participa en la formación del círculo.
        continue;
      }

      // Convierte la posición inicial en ángulo y distancia.
      const anguloInicial = Math.atan2(libreY, libreX);
      const radioInicial = Math.sqrt(
        libreX * libreX + libreY * libreY
      );

      // El círculo gira lentamente después de formarse.
      const anguloFinal =
  punto.angulo +
  movimiento * 0.06 +
  giroAdicional;
      // Busca el recorrido angular más corto.
      const diferencia = Math.atan2(
        Math.sin(anguloFinal - anguloInicial),
        Math.cos(anguloFinal - anguloInicial)
      );

      // Añade media vuelta durante la agrupación:
      // los puntos recorren una espiral y llegan al aro.
      const giroEspiral = Math.PI * (1 - mezcla);

      const angulo =
        anguloInicial +
        diferencia * mezcla +
        giroEspiral * mezcla;

        const radioFinal =
  punto.radio +
  Math.sin(movimiento + punto.fase) * 0.02 +
  respiracion;

      const radio =
        radioInicial * (1 - mezcla) +
        radioFinal * mezcla;

      posiciones[indice] = Math.cos(angulo) * radio;
      posiciones[indice + 1] = Math.sin(angulo) * radio;

      posiciones[indice + 2] =
        libreZ * (1 - mezcla) +
        punto.profundidad * mezcla;
    }


    geometriaPuntos.attributes.position.needsUpdate = true;

    // Actualiza las conexiones según la cercanía.
    let cursor = 0;

    const distanciaMaxima =
      CONFIG.distanciaConexion * CONFIG.distanciaConexion;

   for (let i = 0; i < cantidad; i++) {
  for (let j = i + 1; j < cantidad; j++) {
    const flotanteI =
      i % CONFIG.cadaCuantosFlotante === 0;

    const flotanteJ =
      j % CONFIG.cadaCuantosFlotante === 0;

    // Mantiene separadas las redes exteriores y el círculo.
    if (flotanteI !== flotanteJ) continue;

    const a = i * 3;

              const b = j * 3;

        const dx = posiciones[a] - posiciones[b];
        const dy = posiciones[a + 1] - posiciones[b + 1];
        const dz = posiciones[a + 2] - posiciones[b + 2];

        const limiteConexion = flotanteI
          ? 1.8 * 1.8
          : distanciaMaxima;

        if (dx * dx + dy * dy + dz * dz < limiteConexion) {
                      // Cada conexión conserva su propia intensidad.
          const variante = (i * 17 + j * 31) % 5;

          const intensidad = [
            0.18,
            0.35,
            0.55,
            0.80,
            1
          ][variante];

          const colorBase = flotanteI
            ? colorNaranja
            : colorAzul;

          // Mezcla con el beige para simular distinta transparencia.
          colorConexion
            .copy(colorBeige)
            .lerp(colorBase, intensidad);

          // Ambos extremos reciben el mismo color.
          for (let extremo = 0; extremo < 2; extremo++) {
            const indiceColor = cursor + extremo * 3;

            coloresLineas[indiceColor] = colorConexion.r;
            coloresLineas[indiceColor + 1] = colorConexion.g;
            coloresLineas[indiceColor + 2] = colorConexion.b;
          }

          posicionesLineas[cursor++] = posiciones[a];
          posicionesLineas[cursor++] = posiciones[a + 1];
          posicionesLineas[cursor++] = posiciones[a + 2];

          posicionesLineas[cursor++] = posiciones[b];
          posicionesLineas[cursor++] = posiciones[b + 1];
          posicionesLineas[cursor++] = posiciones[b + 2];
        }
      }
    }

    geometriaLineas.setDrawRange(0, cursor / 3);
    geometriaLineas.attributes.position.needsUpdate = true;
    geometriaLineas.attributes.color.needsUpdate = true;

    renderizador.render(escena, camara);
  }

  requestAnimationFrame(animar);

  // ==========================================
  // CONTROLES PARA GRABAR
  // ==========================================

  document.addEventListener("keydown", function (evento) {
    if (grabandoVideo) return;
    const tecla = evento.key.toLowerCase();

    if (tecla === "r") {
      reiniciar();
    }

    if (tecla === "f") {
      if (!document.fullscreenElement) {
        const solicitud =
          document.documentElement.requestFullscreen?.();

        if (solicitud) {
          solicitud.catch(console.warn);
        }
      } else {
        const salida = document.exitFullscreen?.();

        if (salida) {
          salida.catch(console.warn);
        }
      }
    }
  });

  // Oculta el cursor cuando dejas de moverlo.
  let temporizadorCursor;

  function mostrarCursor() {
    document.body.classList.remove("ocultar-cursor");
    clearTimeout(temporizadorCursor);

    temporizadorCursor = setTimeout(function () {
      document.body.classList.add("ocultar-cursor");
    }, 1500);
  }

  document.addEventListener("mousemove", mostrarCursor);
  mostrarCursor();

    // Conexión reutilizable para grabador.js.
  window.controlAnimacion = {
    canvas: renderizador.domElement,

    prepararGrabacion(ancho, alto) {
      grabandoVideo = true;

      // Resolución real del video, independiente de la pantalla.
      renderizador.setPixelRatio(1);
      renderizador.setSize(ancho, alto, false);

      camara.aspect = ancho / alto;

      const espacio =
        CONFIG.radio + CONFIG.grosor / 2 + 0.45;

      camara.position.z =
        espacio /
        Math.tan(Math.PI / 8) /
        Math.min(1, camara.aspect) + 0.5;

      camara.updateProjectionMatrix();

      reiniciar();
    },

    terminarGrabacion() {
      grabandoVideo = false;

      renderizador.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
      );

      ajustarPantalla();
    }
  };
})();