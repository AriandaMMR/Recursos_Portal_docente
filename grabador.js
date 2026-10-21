(function () {
  "use strict";

  // ==========================================
  // AJUSTES DEL VIDEO
  // ==========================================

  const VIDEO = {
    ancho: 1920,
    alto: 1080,
    fps: 30,
    segundos: 60,
    calidad: 12000000,
    nombre: "constelacion"
  };

  // ==========================================
  // ELEMENTOS
  // ==========================================

  const boton = document.querySelector("#btnGrabar");
  const estado = document.querySelector("#estadoGrabacion");
  const enlace = document.querySelector("#descargarVideo");

  let ocupada = false;
  let urlAnterior = null;

  // Espera a que la animación vuelva a dibujarse.
  function esperarDibujo() {
    return new Promise(function (resolver) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolver);
      });
    });
  }

  boton.addEventListener("click", async function () {
    if (ocupada) return;

    const animacion = window.controlAnimacion;

    if (!animacion) {
      estado.textContent =
        "Falta conectar la animación con el grabador.";
      return;
    }

    if (
      !window.MediaRecorder ||
      !animacion.canvas.captureStream
    ) {
      estado.textContent =
        "Este navegador no permite esta grabación.";
      return;
    }

    // Intenta usar MP4; si no está disponible, usa WebM.
    const formatos = [
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];

    const formato = formatos.find(function (tipo) {
      return MediaRecorder.isTypeSupported(tipo);
    });

    if (!formato) {
      estado.textContent =
        "No se encontró un formato de grabación compatible.";
      return;
    }

    ocupada = true;
    boton.disabled = true;
    estado.textContent = "Preparando video…";
    enlace.hidden = true;

    let flujo = null;
    let grabador = null;
    let temporizador = null;
    let contador = null;
    let errorGrabacion = null;

    function limpiar() {
      clearTimeout(temporizador);
      clearInterval(contador);

      if (flujo) {
        flujo.getTracks().forEach(function (pista) {
          pista.stop();
        });
      }

      animacion.terminarGrabacion();

      boton.disabled = false;
      ocupada = false;
    }

    try {
      animacion.prepararGrabacion(
        VIDEO.ancho,
        VIDEO.alto
      );

      await esperarDibujo();

      flujo = animacion.canvas.captureStream(VIDEO.fps);

      grabador = new MediaRecorder(flujo, {
        mimeType: formato,
        videoBitsPerSecond: VIDEO.calidad
      });

      const partes = [];

      grabador.ondataavailable = function (evento) {
        if (evento.data.size > 0) {
          partes.push(evento.data);
        }
      };

      grabador.onerror = function (evento) {
        errorGrabacion =
          evento.error || new Error("Falló la grabación.");

        if (grabador.state !== "inactive") {
          grabador.stop();
        }
      };

      grabador.onstart = function () {
        const comienzo = performance.now();

        estado.textContent =
          `Grabando… ${VIDEO.segundos} segundos`;

        contador = setInterval(function () {
          const transcurrido =
            (performance.now() - comienzo) / 1000;

          const restantes = Math.max(
            0,
            Math.ceil(VIDEO.segundos - transcurrido)
          );

          estado.textContent =
            `Grabando… ${restantes} segundos`;
        }, 200);

        temporizador = setTimeout(function () {
          estado.textContent = "Preparando descarga…";

          if (grabador.state !== "inactive") {
            grabador.stop();
          }
        }, VIDEO.segundos * 1000);
      };

      grabador.onstop = function () {
        limpiar();

        if (errorGrabacion || partes.length === 0) {
          console.error(errorGrabacion);
          estado.textContent =
            "No se pudo completar el video. Intenta de nuevo.";
          return;
        }

        const tipoReal =
          grabador.mimeType || partes[0].type || formato;

        const archivo = new Blob(partes, {
          type: tipoReal
        });

        const extension = tipoReal.includes("mp4")
          ? "mp4"
          : "webm";

        if (urlAnterior) {
          URL.revokeObjectURL(urlAnterior);
        }

        urlAnterior = URL.createObjectURL(archivo);

        enlace.href = urlAnterior;
        enlace.download =
          `${VIDEO.nombre}-${Date.now()}.${extension}`;

        enlace.hidden = false;
        enlace.click();

        estado.textContent =
          `Video listo · 1920 × 1080 · ${extension.toUpperCase()}`;
      };

      grabador.start();

    } catch (error) {
      console.error(error);
      limpiar();

      estado.textContent =
        "No se pudo grabar. Revisa la consola del navegador.";
    }
  });

})();