(function () {
  "use strict";

  // AJUSTES
  const CONFIG = {
    velocidad: 0.55,
    cantidad: 128,
    cadaCuantosNaranja: 2,
    tamanoPuntos: 0.15,

    fondo: "#f4efe6",
    puntos: "#296aff",
    lineas: "#296aff",
    naranja: "#ff8500",

    distanciaConexion: 1.45
  };

  // PREPARACIÓN
  if (!window.THREE) {
    console.error("Primero debes cargar three.min.js.");
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
    antialias: true,
    preserveDrawingBuffer: true
  });

  renderizador.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  contenedor.appendChild(renderizador.domElement);

  function agregarAtributo(geometria, nombre, datos) {
    const atributo = new THREE.BufferAttribute(datos, 3);

    if (geometria.setAttribute) {
      geometria.setAttribute(nombre, atributo);
    } else {
      geometria.addAttribute(nombre, atributo);
    }
  }

  // NODOS REPARTIDOS POR TODA LA PANTALLA
  const cantidad = CONFIG.cantidad;
  const posiciones = new Float32Array(cantidad * 3);
  const coloresPuntos = new Float32Array(cantidad * 3);
  const datosPuntos = [];

 const enlacesPermitidos = [];

function repartirPuntos() {
  datosPuntos.length = 0;
  enlacesPermitidos.length = 0;

  const aspecto =
    Math.max(1, contenedor.clientWidth) /
    Math.max(1, contenedor.clientHeight);

  // Zonas con tamaños y posiciones diferentes.
  // Entre ellas quedan espacios vacíos.
  const zonas = [
    { x: 0.16, y: 0.22, rx: 0.12, ry: 0.15 },
    { x: 0.73, y: 0.16, rx: 0.15, ry: 0.10 },
    { x: 0.86, y: 0.66, rx: 0.09, ry: 0.18 },
    { x: 0.25, y: 0.80, rx: 0.17, ry: 0.11 },
    { x: 0.57, y: 0.71, rx: 0.09, ry: 0.12 }
  ];

  for (let i = 0; i < cantidad; i++) {
    // Algunos puntos quedan sueltos.
    const suelto = i % 7 === 0;

    // Reparte los grupos sin asociarlos a un color.
    const grupo = suelto ? -1 : (i * 3) % zonas.length;

    let u;
    let v;

    if (suelto) {
      // Conserva libre una zona amplia del centro.
      do {
        u = 0.06 + Math.random() * 0.88;
        v = 0.06 + Math.random() * 0.88;
      } while (
        Math.pow((u - 0.47) / 0.20, 2) +
        Math.pow((v - 0.40) / 0.19, 2) < 1
      );
    } else {
      const zona = zonas[grupo];
      const angulo = Math.random() * Math.PI * 2;
      const radio = Math.sqrt(Math.random());

      u = zona.x + Math.cos(angulo) * radio * zona.rx;
      v = zona.y + Math.sin(angulo) * radio * zona.ry;
    }

    datosPuntos.push({
      u,
      v,
      grupo,
      inicioZ: (Math.random() - 0.5) * 0.3,

      // Cada nodo lleva su propio movimiento.
      fase: Math.random() * Math.PI * 2,
      ritmo: 0.35 + Math.random() * 1.2,

      // Hay nodos que nunca tendrán conexiones.
      puedeConectar: !suelto && Math.random() > 0.25,

      // Cada nodo admite entre una y tres líneas.
      maxEnlaces: 1 + Math.floor(Math.random() * 3)
    });
  }

  const candidatos = [];
  const conexiones = new Uint8Array(cantidad);

  for (let i = 0; i < cantidad; i++) {
    const a = datosPuntos[i];

    if (!a.puedeConectar) continue;

    for (let j = i + 1; j < cantidad; j++) {
      const b = datosPuntos[j];

      if (!b.puedeConectar) continue;
      if (a.grupo !== b.grupo) continue;

      const dx = (a.u - b.u) * aspecto;
      const dy = a.v - b.v;
      const distancia = dx * dx + dy * dy;

      // Solo considera algunos vecinos cercanos.
      if (
        distancia < 0.15 * 0.15 &&
        Math.random() < 0.65
      ) {
        candidatos.push({ i, j, distancia });
      }
    }
  }

  // Prefiere conexiones cortas.
  candidatos.sort((a, b) => a.distancia - b.distancia);

  for (const enlace of candidatos) {
    const { i, j } = enlace;

    if (conexiones[i] >= datosPuntos[i].maxEnlaces) {
      continue;
    }

    if (conexiones[j] >= datosPuntos[j].maxEnlaces) {
      continue;
    }

    enlacesPermitidos.push({
      i,
      j,
      intensidad: 0.20 + Math.random() * 0.60
    });

    conexiones[i]++;
    conexiones[j]++;
  }
}

  repartirPuntos();

  const geometriaPuntos = new THREE.BufferGeometry();

  agregarAtributo(
    geometriaPuntos,
    "position",
    posiciones
  );

  // Textura redonda para cada nodo.
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

  const azulNodos = new THREE.Color(CONFIG.puntos);
  const naranjaNodos = new THREE.Color(CONFIG.naranja);

  for (let i = 0; i < cantidad; i++) {
    const color =
      i % CONFIG.cadaCuantosNaranja === 0
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

  // CONEXIONES
  const maxConexiones =
    cantidad * (cantidad - 1) / 2;

  const posicionesLineas = new Float32Array(
    maxConexiones * 6
  );

  const coloresLineas = new Float32Array(
    posicionesLineas.length
  );

  const geometriaLineas = new THREE.BufferGeometry();

  agregarAtributo(
    geometriaLineas,
    "position",
    posicionesLineas
  );

  agregarAtributo(
    geometriaLineas,
    "color",
    coloresLineas
  );

  geometriaLineas.setDrawRange(0, 0);

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

  // AJUSTE A LA PANTALLA
  let anchoVisible = 1;
  let altoVisible = 1;

  function ajustarPantalla() {
    const ancho = Math.max(1, contenedor.clientWidth);
    const alto = Math.max(1, contenedor.clientHeight);

    camara.aspect = ancho / alto;
    camara.position.z = 10;
    camara.updateProjectionMatrix();

    altoVisible =
      2 * camara.position.z * Math.tan(Math.PI / 8);

    anchoVisible = altoVisible * camara.aspect;

    renderizador.setSize(ancho, alto);
  }

  window.addEventListener("resize", ajustarPantalla);
  ajustarPantalla();

  // MOVIMIENTO CONTINUO, SIN FORMAR UN CÍRCULO
  let anterior = performance.now();
  let movimiento = 0;

  function reiniciar() {
    anterior = performance.now();
    movimiento = 0;
  }

  function animar(ahora) {
    requestAnimationFrame(animar);

    const delta = Math.min(
      Math.max((ahora - anterior) / 1000, 0),
      0.05
    );

    anterior = ahora;
    movimiento += delta * CONFIG.velocidad;

    for (let i = 0; i < cantidad; i++) {
      const punto = datosPuntos[i];
      const indice = i * 3;
      const tiempoPunto = movimiento * punto.ritmo;

      posiciones[indice] =
        (punto.u - 0.5) * anchoVisible * 0.94 +
        Math.sin(tiempoPunto + punto.fase) *
          anchoVisible *
          0.012;

      posiciones[indice + 1] =
        (0.5 - punto.v) * altoVisible * 0.94 +
        Math.cos(tiempoPunto * 0.8 + punto.fase) *
          altoVisible *
          0.018;

      posiciones[indice + 2] = punto.inicioZ;
    }

    geometriaPuntos.attributes.position.needsUpdate = true;

    // Conectar los nodos cercanos.
// Dibuja únicamente las conexiones seleccionadas.
// Los puntos sueltos permanecen sin líneas.
let cursor = 0;

for (const enlace of enlacesPermitidos) {
  const { i, j, intensidad } = enlace;

  const a = i * 3;
  const b = j * 3;

  const naranjaI =
    i % CONFIG.cadaCuantosNaranja === 0;

  const naranjaJ =
    j % CONFIG.cadaCuantosNaranja === 0;

  const colorBase =
    naranjaI && naranjaJ
      ? colorNaranja
      : colorAzul;

  colorConexion
    .copy(colorBeige)
    .lerp(colorBase, intensidad);

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

geometriaLineas.setDrawRange(0, cursor / 3);
    geometriaLineas.attributes.position.needsUpdate = true;
    geometriaLineas.attributes.color.needsUpdate = true;

    // Dibuja la animación en cada cuadro.
    renderizador.render(escena, camara);
  }

  requestAnimationFrame(animar);

  // GUARDAR FOTO PNG
  let guardando = false;

  const botonFoto = document.createElement("button");

  botonFoto.type = "button";
  botonFoto.textContent = "Guardar foto";
  botonFoto.title = "Descargar PNG — también con la tecla P";

  botonFoto.style.cssText = [
    "position:fixed",
    "right:18px",
    "top:18px",
    "z-index:99999",
    "padding:12px 18px",
    "border:0",
    "border-radius:12px",
    "background:#296aff",
    "color:white",
    "font:600 15px Arial,sans-serif",
    "cursor:pointer",
    "box-shadow:0 4px 16px rgba(0,0,0,.15)"
  ].join(";");

  document.body.appendChild(botonFoto);

  function guardarFoto() {
    if (guardando) return;

    guardando = true;
    botonFoto.disabled = true;
    botonFoto.textContent = "Guardando…";

    renderizador.render(escena, camara);

    // Solo captura el canvas: el botón no sale en la foto.
    renderizador.domElement.toBlob(function (blob) {
      try {
        if (!blob) {
          throw new Error("No se pudo generar la foto.");
        }

        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = "Constelacion_CNCI.png";

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 60000);
      } catch (error) {
        console.error(error);

        alert(
          "No se pudo guardar la foto. Intenta otra vez."
        );
      } finally {
        guardando = false;
        botonFoto.disabled = false;
        botonFoto.textContent = "Guardar foto";
      }
    }, "image/png");
  }

  botonFoto.addEventListener("click", guardarFoto);

  // ATAJOS:
  // P = guardar foto
  // R = repartir nuevamente los nodos
  // F = pantalla completa
  document.addEventListener("keydown", function (evento) {
    if (
      evento.target instanceof Element &&
      evento.target.closest(
        "input, textarea, select, [contenteditable]"
      )
    ) {
      return;
    }

    if (
      evento.ctrlKey ||
      evento.metaKey ||
      evento.altKey ||
      evento.repeat
    ) {
      return;
    }

    const tecla = evento.key.toLowerCase();

    if (tecla === "p") {
      guardarFoto();
    }

    if (tecla === "r") {
      repartirPuntos();
      reiniciar();
    }

    if (tecla === "f") {
      const solicitud = document.fullscreenElement
        ? document.exitFullscreen?.()
        : document.documentElement.requestFullscreen?.();

      if (solicitud) {
        solicitud.catch(console.warn);
      }
    }
  });

  window.controlAnimacion = {
    canvas: renderizador.domElement,
    tomarFoto: guardarFoto
  };
})();