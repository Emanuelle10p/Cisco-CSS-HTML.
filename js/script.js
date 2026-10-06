/* =====================================================================
   MiniAcad · js/script.js
   JavaScript solo para interacción sencilla:
   1. Menú móvil
   2. Acordeones
   3. Avanzar entre lecciones moviendo el foco
   4. Mini quiz (sin guardar puntaje)

   No se usa localStorage, ni registro, ni base de datos.
   ===================================================================== */
(function () {
  'use strict';

  /* Avisa al CSS que JavaScript está activo (ver responsivo.css) */
  document.documentElement.classList.add('js');

  var prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* -------------------------------------------------------------------
     1. MENÚ MÓVIL
     El botón cambia aria-expanded y la clase .abierto del menú.
     La tecla Escape cierra el menú y devuelve el foco al botón.
     ------------------------------------------------------------------- */
  var botonMenu = document.querySelector('.menu-boton');
  var menu = document.getElementById('menu-principal');

  if (botonMenu && menu) {
    botonMenu.addEventListener('click', function () {
      var abierto = botonMenu.getAttribute('aria-expanded') === 'true';
      botonMenu.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('abierto', !abierto);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && menu.classList.contains('abierto')) {
        botonMenu.setAttribute('aria-expanded', 'false');
        menu.classList.remove('abierto');
        botonMenu.focus();
      }
    });
  }


  /* -------------------------------------------------------------------
     2. ACORDEONES
     Cada botón .acordeon-btn controla un panel (aria-controls).
     Se actualiza aria-expanded y el atributo hidden del panel.
     ------------------------------------------------------------------- */
  var botonesAcordeon = document.querySelectorAll('.acordeon-btn');

  botonesAcordeon.forEach(function (boton) {
    boton.addEventListener('click', function () {
      var panel = document.getElementById(boton.getAttribute('aria-controls'));
      if (!panel) { return; }

      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      panel.hidden = abierto;
    });
  });


  /* -------------------------------------------------------------------
     3. AVANZAR ENTRE LECCIONES
     Al usar «Siguiente lección», el foco se mueve al título de la
     lección nueva. Así el lector de pantalla anuncia dónde está.
     ------------------------------------------------------------------- */
  var enlacesLeccion = document.querySelectorAll('a.ir-leccion');

  enlacesLeccion.forEach(function (enlace) {
    enlace.addEventListener('click', function (evento) {
      var id = enlace.getAttribute('href').slice(1);
      var destino = document.getElementById(id);
      if (!destino) { return; }

      evento.preventDefault();
      destino.scrollIntoView({
        behavior: prefiereMenosMovimiento ? 'auto' : 'smooth',
        block: 'start'
      });
      destino.focus({ preventScroll: true });
      history.replaceState(null, '', '#' + id);
    });
  });


  /* -------------------------------------------------------------------
     4. MINI QUIZ
     Cada <fieldset> tiene data-correcta con la letra de la respuesta.
     El resultado se escribe en #resultado (aria-live="polite").
     El puntaje NO se guarda en ningún lugar.
     ------------------------------------------------------------------- */
  var formulario = document.getElementById('form-quiz');
  var salida = document.getElementById('resultado');

  function crearItem(texto, clase) {
    var li = document.createElement('li');
    li.className = 'resultado__item ' + clase;
    li.textContent = texto;
    return li;
  }

  if (formulario && salida) {
    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var grupos = formulario.querySelectorAll('fieldset');
      var aciertos = 0;
      var faltan = 0;
      var lista = document.createElement('ul');
      lista.className = 'resultado__lista';

      grupos.forEach(function (grupo, indice) {
        var numero = 'Pregunta ' + (indice + 1) + ': ';
        var marcada = grupo.querySelector('input:checked');

        if (!marcada) {
          faltan++;
          lista.appendChild(crearItem(numero + 'falta responder.', 'resultado__item--pendiente'));
        } else if (marcada.value === grupo.dataset.correcta) {
          aciertos++;
          lista.appendChild(crearItem(numero + '✔ Correcto. ' + (grupo.dataset.pista || ''), 'resultado__item--ok'));
        } else {
          lista.appendChild(crearItem(numero + '✖ Casi. Inténtalo otra vez. ' + (grupo.dataset.pista || ''), 'resultado__item--mal'));
        }
      });

      var titulo = document.createElement('p');
      titulo.className = 'resultado__titulo';

      if (faltan > 0) {
        titulo.textContent = 'Te faltan respuestas. Responde todas las preguntas y comprueba otra vez.';
      } else if (aciertos === grupos.length) {
        titulo.textContent = '¡Muy bien! Acertaste ' + aciertos + ' de ' + grupos.length + '.';
      } else {
        titulo.textContent = 'Acertaste ' + aciertos + ' de ' + grupos.length + '. ¡Puedes intentarlo otra vez!';
      }

      salida.replaceChildren(titulo, lista);
    });

    /* «Empezar de nuevo» limpia el formulario y el resultado */
    formulario.addEventListener('reset', function () {
      salida.replaceChildren();
    });
  }
})();
