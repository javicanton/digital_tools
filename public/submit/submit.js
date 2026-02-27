(function () {
  'use strict';

  var REPO = 'javicanton/digital_tools';
  var MAX_BODY_LENGTH = 1800;

  var FIELD_LABELS = {
    nombre: 'Nombre de la herramienta',
    url_oficial: 'URL oficial',
    categoria_principal: 'Categoría principal',
    etiquetas: 'Etiquetas',
    descripcion_corta: 'Descripción corta',
    funcionalidades_clave: 'Funcionalidades clave',
    utilidad_en_investigacion: 'Utilidad en investigación',
    fases_investigacion: 'Fases de investigación',
    tipos_datos: 'Tipos de datos',
    precio_modelo: 'Precio / modelo',
    coste_estimado: 'Coste estimado',
    requisitos_sistema: 'Requisitos de sistema',
    integraciones: 'Integraciones',
    importacion: 'Importación (formatos)',
    exportacion: 'Exportación (formatos)',
    trabajo_colaborativo: 'Trabajo colaborativo',
    documentacion_tutoriales: 'Documentación / tutoriales',
    idioma_interfaz: 'Idioma de la interfaz',
    transparencia_datos: 'Transparencia de datos',
    protocolos_etica: 'Protocolos de ética',
    uso_IA: 'Uso de IA',
    curva_aprendizaje: 'Curva de aprendizaje',
    alternativas: 'Alternativas',
    notas_limitaciones: 'Notas y limitaciones',
    ultima_actualizacion_aprox: 'Última actualización (aprox.)'
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function listToPipe(value) {
    if (!value || typeof value !== 'string') return '';
    return value.split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean).join('|');
  }

  function na(value) {
    if (value === undefined || value === null) return 'NA';
    var s = String(value).trim();
    if (s === '' || s.toLowerCase() === 'na' || s.toLowerCase() === 'n/a') return 'NA';
    return s;
  }

  function getFormData() {
    var data = {};
    var form = byId('form');
    var els = form.querySelectorAll('[name]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.name;
      if (!name) continue;
      if (el.type === 'checkbox') {
        data[name] = el.checked ? el.value : '';
      } else if (el.multiple && el.tagName === 'SELECT') {
        var selected = [];
        for (var j = 0; j < el.options.length; j++) {
          if (el.options[j].selected) selected.push(el.options[j].value);
        }
        data[name] = selected.join('|');
      } else {
        data[name] = el.value;
      }
    }
    return data;
  }

  function buildBody(data) {
    var parts = [];
    var keys = Object.keys(FIELD_LABELS);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var label = FIELD_LABELS[key];
      var value = data[key];
      if (key === 'etiquetas' || key === 'funcionalidades_clave' || key === 'integraciones' || key === 'importacion' || key === 'exportacion' || key === 'alternativas') {
        value = listToPipe(value) || na(value);
      } else if (key === 'coste_estimado') {
        value = na(value);
      } else {
        value = value !== undefined && value !== null ? String(value).trim() : '';
        value = value || 'NA';
      }
      parts.push('### ' + label + '\n\n' + value);
    }
    return parts.join('\n\n');
  }

  function validate(data) {
    var errors = [];
    var url = (data.url_oficial || '').trim();
    if (url && url.indexOf('https://') !== 0) {
      errors.push({ field: 'url_oficial', msg: 'La URL debe comenzar por https://' });
    }
    var desc = (data.descripcion_corta || '').trim();
    if (desc.length > 280) {
      errors.push({ field: 'descripcion_corta', msg: 'Máximo 280 caracteres.' });
    }
    return errors;
  }

  function showErrors(errors) {
    var form = byId('form');
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('error'); });
    form.querySelectorAll('.error-msg').forEach(function (e) { e.textContent = ''; });
    errors.forEach(function (e) {
      var field = form.querySelector('[name="' + e.field + '"]');
      if (field) {
        var wrap = field.closest('.field');
        if (wrap) wrap.classList.add('error');
        var errEl = byId('err_' + e.field) || wrap.querySelector('.error-msg');
        if (errEl) errEl.textContent = e.msg;
      }
    });
  }

  function updateDescCount() {
    var el = byId('descripcion_corta');
    var count = byId('desc_count');
    if (!el || !count) return;
    var n = (el.value || '').length;
    count.textContent = n + ' / 280';
    count.classList.toggle('over', n > 280);
  }

  function showResult(success, message, body, title) {
    var result = byId('result');
    var msg = byId('result_msg');
    var actions = byId('result_actions');
    var preview = byId('body_preview');
    result.classList.add('show');
    result.classList.toggle('success', success);
    msg.textContent = message;
    preview.textContent = body || '';
    preview.style.display = body ? 'block' : 'none';
    actions.innerHTML = '';

    if (success && body) {
      var encodedBody = encodeURIComponent(body);
      var issueTitle = 'Nueva herramienta: ' + (title || '');
      var url = 'https://github.com/' + REPO + '/issues/new?labels=tool-submission&title=' + encodeURIComponent(issueTitle);
      if (encodedBody.length <= MAX_BODY_LENGTH) {
        url += '&body=' + encodedBody;
        var openBtn = document.createElement('a');
        openBtn.href = url;
        openBtn.target = '_blank';
        openBtn.rel = 'noopener noreferrer';
        openBtn.textContent = 'Abrir issue en GitHub (con datos rellenados)';
        openBtn.style.display = 'inline-block';
        openBtn.style.marginRight = '0.75rem';
        openBtn.style.marginTop = '0.5rem';
        openBtn.style.color = 'var(--link)';
        actions.appendChild(openBtn);
      } else {
        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copiar cuerpo del issue';
        copyBtn.addEventListener('click', function () {
          navigator.clipboard.writeText(body).then(function () {
            copyBtn.textContent = 'Copiado';
          });
        });
        actions.appendChild(copyBtn);
        var openLink = document.createElement('a');
        openLink.href = url;
        openLink.target = '_blank';
        openLink.rel = 'noopener noreferrer';
        openLink.textContent = 'Abrir issue en GitHub (pega el contenido copiado en el cuerpo)';
        openLink.style.display = 'inline-block';
        openLink.style.marginLeft = '0.75rem';
        openLink.style.marginTop = '0.5rem';
        openLink.style.color = 'var(--link)';
        actions.appendChild(openLink);
        msg.textContent = 'El cuerpo del issue es largo. Copia el texto de abajo y pégalo en el cuerpo del issue al abrir el enlace.';
      }
    }
  }

  byId('descripcion_corta').addEventListener('input', updateDescCount);
  updateDescCount();

  byId('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var data = getFormData();
    var errors = validate(data);
    if (errors.length) {
      showErrors(errors);
      byId('result').classList.remove('show');
      return;
    }
    showErrors([]);
    var body = buildBody(data);
    var title = (data.nombre || '').trim() || 'Nueva herramienta';
    showResult(true, 'Se ha generado el cuerpo del issue. Usa el enlace para abrirlo en GitHub.', body, title);
    byId('result').scrollIntoView({ behavior: 'smooth' });
  });
})();
