/**
 * TaskCenter · API en Google Apps Script (guarda los datos en tu Google Sheet)
 * Versión 1.0.0 · GUSTAVO DEVELOPER
 *
 * PASOS (la guía completa está en README.md):
 *  1. Crea una hoja de cálculo en tu Drive y ábrela: Extensiones → Apps Script.
 *  2. Pega este archivo entero (borra lo que haya) y cambia la CLAVE de abajo.
 *  3. Implementar → Nueva implementación → tipo "Aplicación web":
 *       Ejecutar como: Yo
 *       Quién tiene acceso: Cualquier usuario
 *     (la clave es lo que protege tus datos; no la compartas)
 *  4. Copia la URL que termina en /exec y pégala en TaskCenter (Ajustes) junto con la clave.
 *
 * Si cambias este código después: Implementar → Administrar implementaciones →
 * editar (lápiz) → Versión: Nueva versión → Implementar. La URL no cambia.
 */

// Inventa una clave larga (mínimo 16 caracteres, letras y números). Debe ser igual en la app.
const CLAVE = 'CAMBIA-ESTA-CLAVE';

// Solo si la app dice que no encuentra la hoja: pega aquí el ID de tu hoja
// (la parte larga de su URL, entre /d/ y /edit).
const SHEET_ID = '';

/** Abrir la URL /exec en el navegador solo muestra que la API está activa. */
function doGet() {
  return json_({ ok: true, app: 'TaskCenter', mensaje: 'API activa' });
}

/** La app envía aquí todas las peticiones: { key, action: 'get' | 'save', data }. */
function doPost(e) {
  try {
    if (!CLAVE || CLAVE === 'CAMBIA-ESTA-CLAVE') {
      return json_({ ok: false, error: 'Falta definir la CLAVE en Code.gs' });
    }
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!igual_(String(req.key || ''), CLAVE)) {
      return json_({ ok: false, error: 'clave' });
    }
    if (req.action === 'get') {
      return json_({ ok: true, data: leer_() });
    }
    if (req.action === 'save') {
      guardar_(String(req.data || ''));
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Comparación de texto sin atajos, para no dar pistas sobre la clave. */
function igual_(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function ss_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActive();
}

function hoja_(nombre) {
  const ss = ss_();
  return ss.getSheetByName(nombre) || ss.insertSheet(nombre);
}

/** Devuelve el estado completo (JSON en texto). */
function leer_() {
  const sh = hoja_('_datos');
  const n = sh.getLastRow();
  if (n < 1) return '';
  return sh.getRange(1, 1, n, 1).getValues().map(function (r) { return r[0]; }).join('');
}

/** Guarda el estado completo y refresca las pestañas legibles. */
function guardar_(json) {
  const S = JSON.parse(json); // si no es JSON válido, falla y no se guarda nada
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const TROZO = 45000; // una celda admite 50.000 caracteres
    const partes = [];
    for (let i = 0; i < json.length; i += TROZO) partes.push([json.slice(i, i + TROZO)]);
    const sh = hoja_('_datos');
    sh.clearContents();
    if (partes.length) sh.getRange(1, 1, partes.length, 1).setNumberFormat('@').setValues(partes);
    espejo_(S);
    try { sh.hideSheet(); } catch (e) { /* si no se puede ocultar, no pasa nada */ }
  } finally {
    lock.releaseLock();
  }
}

/** Copia legible de los datos. Es solo de lectura: lo que edites aquí se sobrescribe. */
function espejo_(S) {
  const vivos = function (a) { return (a || []).filter(function (r) { return !r.x; }); };
  const prio = ['Baja', 'Media', 'Alta'];

  escribir_('Tareas', ['Hecha', 'Prioridad', 'Tarea', 'Fecha límite', 'Nota'],
    vivos(S.tasks).map(function (t) {
      return [t.done ? 'Sí' : 'No', prio[t.p] || 'Media', t.t, t.due || '', t.note || ''];
    }));

  escribir_('Apuntes', ['Título', 'Etiquetas', 'Texto', 'Editado'],
    vivos(S.notes).map(function (n) {
      return [n.t || '', (n.tags || []).join(', '), n.b || '', n.u > 1 ? new Date(n.u).toISOString() : ''];
    }));

  const filas = [];
  vivos(S.orders).forEach(function (o) {
    const tipo = o.kind === 'salida' ? 'Salida de almacén' : 'Pedido de compra';
    const estado = o.st === 'cerrado' ? (o.kind === 'salida' ? 'Entregado' : 'Recibido') : (o.st === 'enviado' ? 'Enviado' : 'Borrador');
    const lineas = o.items && o.items.length ? o.items : [{}];
    lineas.forEach(function (i) {
      filas.push([o.name || '', tipo, estado, o.date || '', i.d || '', i.q || '', i.n || '', i.ok ? 'Sí' : 'No']);
    });
  });
  escribir_('Pedidos', ['Pedido', 'Tipo', 'Estado', 'Fecha', 'Descripción', 'Cantidad', 'Unidad', 'Recibido / entregado'], filas);

  const dias = S.days || {};
  escribir_('Agenda', ['Día / semana', 'Texto'],
    Object.keys(dias).sort().filter(function (k) { return dias[k].t; }).map(function (k) { return [k, dias[k].t]; }));
}

function escribir_(nombre, cabecera, filas) {
  const sh = hoja_(nombre);
  sh.clear();
  const todo = [cabecera].concat(filas);
  // Formato texto para que nada que empiece por "=" se interprete como fórmula.
  sh.getRange(1, 1, todo.length, cabecera.length).setNumberFormat('@').setValues(todo);
  sh.getRange(1, 1, 1, cabecera.length).setFontWeight('bold');
  sh.setFrozenRows(1);
}
