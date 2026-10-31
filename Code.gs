/**
 * TaskCenter · API multiusuario en Google Apps Script (todo se guarda en tu Google Sheet)
 * Versión 1.1.0 · GUSTAVO DEVELOPER
 *
 * QUÉ HACE
 *  - Cada persona crea su usuario en la app (hace falta el CÓDIGO DEL EQUIPO que tú les des).
 *  - Cada usuario tiene sus propios datos. Las contraseñas se guardan cifradas (hash), nunca en texto.
 *  - Lo que un usuario decide "Enviar" (apuntes y pedidos) aparece en la pestaña "Recibidos".
 *  - La pestaña "Usuarios" muestra quién se ha registrado y cuándo entró por última vez.
 *
 * PASOS (la guía completa está en README.md)
 *  1. Abre tu hoja de cálculo → Extensiones → Apps Script.
 *  2. Pega este archivo entero (borra lo que haya).
 *  3. Implementar → Administrar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar.
 *     (Si es la primera vez: Implementar → Nueva implementación → Aplicación web,
 *      Ejecutar como: Yo, Quién tiene acceso: Cualquier usuario.)
 *  4. Abre la URL /exec en el navegador: debe decir "API activa" y "version":"1.1.0".
 *
 * NOTA DE PRIVACIDAD: los datos de todos los usuarios viven en tu hoja, así que tú, como dueño
 * de la hoja, puedes verlos. Avisa a tu equipo de ello.
 */

// Solo si la app dice que no encuentra la hoja: pega aquí el ID de tu hoja
// (la parte larga de su URL, entre /d/ y /edit).
const SHEET_ID = '';

const VERSION_API = '1.1.1';
const VUELTAS_HASH = 200;     // vueltas del cifrado de contraseñas
const MAX_FALLOS = 8;         // intentos fallidos seguidos antes de bloquear
const BLOQUEO_SEG = 600;      // duración del bloqueo (10 minutos)
const MAX_DATOS = 1500000;    // caracteres máximos de datos por usuario
const CAB_CUENTAS = ['Usuario', 'Nombre', 'Salt', 'Hash', 'Creado', 'Último acceso', 'Datos (no tocar)'];
const CAB_USUARIOS = ['Usuario', 'Nombre', 'Creado', 'Último acceso', 'Tareas', 'Apuntes', 'Pedidos'];
const CAB_RECIBIDOS = ['Fecha', 'Usuario', 'Nombre', 'Tipo', 'Título', 'Detalle', 'Mensaje', 'Gestionado', 'Id'];

/* ================= Entrada ================= */

/** Abrir la URL /exec en el navegador solo muestra que la API está activa. */
function doGet() {
  return json_({ ok: true, app: 'TaskCenter', mensaje: 'API activa', version: VERSION_API });
}

/** La app envía aquí todas las peticiones: { action, user, token, ... }. */
function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (req.action) {
      case 'register': return registrar_(req);
      case 'login': return entrar_(req);
      case 'get':
      case 'save':
      case 'send': return sesion_(req);
      default: return err_('accion', 'Acción desconocida');
    }
  } catch (ex) {
    const m = String((ex && ex.message) || ex);
    if (/lock/i.test(m)) return err_('ocupado', 'La hoja está ocupada. Inténtalo de nuevo en unos segundos');
    return err_('error', m);
  }
}

/* ================= Cuentas ================= */

function registrar_(req) {
  const usuario = String(req.user || '').trim().toLowerCase();
  const nombre = limpio_(req.name, 40);
  const pass = String(req.pass || '');
  if (!usuarioValido_(usuario)) {
    return err_('usuario', 'El usuario debe tener de 3 a 20 caracteres: letras, números, punto, guion o guion bajo');
  }
  if (!nombre) return err_('nombre', 'Escribe tu nombre');
  if (pass.length < 6 || pass.length > 64) {
    return err_('pass', 'La contraseña debe tener entre 6 y 64 caracteres');
  }
  if (bloqueado_('reg', 20)) {
    return err_('bloqueado', 'Demasiados intentos. Espera 10 minutos e inténtalo de nuevo');
  }
  fallo_('reg'); // registro abierto: se limita a 20 altas cada 10 minutos para evitar abusos

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = cuentas_();
    if (fila_(sh, usuario)) return err_('existe', 'Ese usuario ya existe. Elige otro o entra con él');
    const salt = Utilities.getUuid().replace(/-/g, '');
    const hash = hashPass_(pass, salt);
    const ahora = ahora_();
    const f = Math.max(sh.getLastRow(), 1) + 1;
    sh.getRange(f, 1, 1, 6).setNumberFormat('@').setValues([[usuario, nombre, salt, hash, ahora, ahora]]);
    usuarioVisible_(usuario, nombre, ahora, ahora, null);
    return json_({ ok: true, user: usuario, name: nombre, token: token_(usuario, hash) });
  } finally {
    lock.releaseLock();
  }
}

function entrar_(req) {
  const usuario = String(req.user || '').trim().toLowerCase();
  const pass = String(req.pass || '');
  const MSG = 'Usuario o contraseña incorrectos';
  if (!usuarioValido_(usuario)) return err_('credenciales', MSG);
  if (bloqueado_('u:' + usuario, MAX_FALLOS)) {
    return err_('bloqueado', 'Demasiados intentos. Espera 10 minutos e inténtalo de nuevo');
  }
  const sh = cuentas_();
  const f = fila_(sh, usuario);
  if (!f) {
    fallo_('u:' + usuario);
    return err_('credenciales', MSG);
  }
  const r = sh.getRange(f, 1, 1, 6).getValues()[0];
  if (!igual_(hashPass_(pass, String(r[2])), String(r[3]))) {
    fallo_('u:' + usuario);
    return err_('credenciales', MSG);
  }
  limpiar_('u:' + usuario);
  const ahora = ahora_();
  sh.getRange(f, 6).setNumberFormat('@').setValue(ahora);
  usuarioVisible_(usuario, String(r[1]), String(r[4]), ahora, null);
  return json_({ ok: true, user: usuario, name: String(r[1]), token: token_(usuario, String(r[3])) });
}

/** Comprueba la sesión (usuario + token) y ejecuta get / save / send. */
function sesion_(req) {
  const usuario = String(req.user || '').trim().toLowerCase();
  if (!usuarioValido_(usuario)) return err_('auth', 'Sesión no válida');
  const sh = cuentas_();
  const f = fila_(sh, usuario);
  if (!f) return err_('auth', 'Sesión no válida');
  const r = sh.getRange(f, 1, 1, 6).getValues()[0];
  if (!igual_(String(req.token || ''), token_(usuario, String(r[3])))) {
    return err_('auth', 'Sesión no válida');
  }
  const nombre = String(r[1]);
  if (req.action === 'get') return json_({ ok: true, data: leerDatos_(sh, f) });
  if (req.action === 'save') return guardarDatos_(usuario, String(req.data || ''));
  return enviar_(usuario, nombre, req);
}

/* ================= Datos de cada usuario ================= */

/** Los datos de un usuario van en su fila de _cuentas, troceados en celdas desde la columna G. */
function leerDatos_(sh, f) {
  const nc = sh.getLastColumn();
  if (nc < 7) return '';
  const vals = sh.getRange(f, 7, 1, nc - 6).getValues()[0];
  return vals.map(function (v) { return v === '' ? '' : String(v); }).join('');
}

function guardarDatos_(usuario, json) {
  if (json.length > MAX_DATOS) return err_('grande', 'Tus datos son demasiado grandes para guardarlos');
  let S;
  try { S = JSON.parse(json); } catch (e) { return err_('datos', 'Los datos no son un JSON válido'); }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = cuentas_();
    const f = fila_(sh, usuario);
    if (!f) return err_('auth', 'Sesión no válida');
    const TROZO = 45000; // una celda admite 50.000 caracteres
    const partes = [];
    for (let i = 0; i < json.length; i += TROZO) partes.push(json.slice(i, i + TROZO));
    if (!partes.length) partes.push('');
    const necesarias = 6 + partes.length;
    if (sh.getMaxColumns() < necesarias) sh.insertColumnsAfter(sh.getMaxColumns(), necesarias - sh.getMaxColumns());
    sh.getRange(f, 7, 1, sh.getMaxColumns() - 6).clearContent();
    sh.getRange(f, 7, 1, partes.length).setNumberFormat('@').setValues([partes]);
    const ahora = ahora_();
    sh.getRange(f, 6).setNumberFormat('@').setValue(ahora);
    const cuenta = function (a) {
      return (a || []).filter(function (r) { return !r.x && !r.demo; }).length;
    };
    const r = sh.getRange(f, 1, 1, 6).getValues()[0];
    usuarioVisible_(usuario, String(r[1]), String(r[4]), ahora, [cuenta(S.tasks), cuenta(S.notes), cuenta(S.orders)]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

/* ================= Envíos al administrador ================= */

function enviar_(usuario, nombre, req) {
  const tipo = req.kind === 'Pedido' ? 'Pedido' : 'Apunte';
  const titulo = limpio_(req.title, 200);
  const detalle = limpio_(req.detail, 45000);
  const mensaje = limpio_(req.msg, 1000);
  const sid = limpio_(req.sid, 40);
  if (!sid) return err_('datos', 'Falta el identificador del envío');
  if (!titulo && !detalle) return err_('datos', 'No hay nada que enviar');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = hojaVisible_('Recibidos', CAB_RECIBIDOS);
    const n = sh.getLastRow();
    if (n >= 2) { // si ya llegó este envío (reintento), no se duplica
      const desde = Math.max(2, n - 499);
      const ids = sh.getRange(desde, 9, n - desde + 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === sid) return json_({ ok: true, duplicado: true });
      }
    }
    const f = Math.max(n, 1) + 1;
    // Formato texto: nada de lo que escriba un usuario se interpreta como fórmula.
    sh.getRange(f, 1, 1, 9).setNumberFormat('@').setValues([[ahora_(), usuario, nombre, tipo, titulo, detalle, mensaje, '', sid]]);
    sh.getRange(f, 6, 1, 2).setWrap(true);
    sh.getRange(f, 8).setNumberFormat('General').insertCheckboxes();
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

/* ================= Hojas ================= */

function ss_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActive();
}

/** Hoja oculta con cuentas (contraseñas cifradas) y datos de cada usuario. */
function cuentas_() {
  const ss = ss_();
  let sh = ss.getSheetByName('_cuentas');
  if (!sh) {
    sh = ss.insertSheet('_cuentas');
    sh.getRange(1, 1, 1, CAB_CUENTAS.length).setNumberFormat('@').setValues([CAB_CUENTAS]);
    sh.getRange(1, 1, 1, CAB_CUENTAS.length).setFontWeight('bold');
    try { sh.hideSheet(); } catch (e) { /* si no se puede ocultar, no pasa nada */ }
  }
  return sh;
}

/** Hoja visible para ti (Usuarios, Recibidos). */
function hojaVisible_(nombre, cabecera) {
  const ss = ss_();
  let sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.getRange(1, 1, 1, cabecera.length).setNumberFormat('@').setValues([cabecera]);
    sh.getRange(1, 1, 1, cabecera.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Fila (empezando en 2) del usuario en la columna A; 0 si no existe. */
function fila_(sh, usuario) {
  const n = sh.getLastRow();
  if (n < 2) return 0;
  const col = sh.getRange(2, 1, n - 1, 1).getValues();
  for (let i = 0; i < col.length; i++) {
    if (String(col[i][0]).toLowerCase() === usuario) return i + 2;
  }
  return 0;
}

/** Actualiza (o crea) la fila del usuario en la pestaña "Usuarios". conteos: [tareas, apuntes, pedidos] o null. */
function usuarioVisible_(usuario, nombre, creado, ultimo, conteos) {
  const sh = hojaVisible_('Usuarios', CAB_USUARIOS);
  let f = fila_(sh, usuario);
  if (!f) {
    f = Math.max(sh.getLastRow(), 1) + 1;
    sh.getRange(f, 1, 1, 4).setNumberFormat('@').setValues([[usuario, nombre, creado, ultimo]]);
    sh.getRange(f, 5, 1, 3).setValues([[0, 0, 0]]);
  } else {
    sh.getRange(f, 4).setNumberFormat('@').setValue(ultimo);
  }
  if (conteos) sh.getRange(f, 5, 1, 3).setValues([conteos]);
}

/* ================= Utilidades ================= */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function err_(codigo, mensaje) {
  return json_({ ok: false, error: codigo, msg: mensaje });
}

function usuarioValido_(u) {
  return /^[a-z0-9._-]{3,20}$/.test(u);
}

/** Quita caracteres de control (deja saltos de línea y tabuladores) y recorta. */
function limpio_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function ahora_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
}

/** Comparación de texto sin atajos, para no dar pistas. */
function igual_(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function hex_(bytes) {
  return bytes.map(function (b) { return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'); }).join('');
}

function sha_(texto) {
  return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto));
}

function hashPass_(pass, salt) {
  let h = salt + ':' + pass;
  for (let i = 0; i < VUELTAS_HASH; i++) h = sha_(h + ':' + salt);
  return h;
}

/** El token de sesión se deriva del hash: si cambia la contraseña, las sesiones antiguas dejan de valer. */
function token_(usuario, hash) {
  return sha_(hash + ':' + usuario + ':taskcenter');
}

/* Límite de intentos fallidos (se guarda en la caché del script, no en la hoja). */
function bloqueado_(clave, max) {
  const v = CacheService.getScriptCache().get('f:' + clave);
  return !!v && Number(v) >= max;
}
function fallo_(clave) {
  const c = CacheService.getScriptCache();
  c.put('f:' + clave, String(Number(c.get('f:' + clave) || 0) + 1), BLOQUEO_SEG);
}
function limpiar_(clave) {
  CacheService.getScriptCache().remove('f:' + clave);
}

/* ================= Para ti, el administrador =================
 * Estas funciones no las usa la app. Las ejecutas tú desde el editor de Apps Script:
 * escribe los datos, elige la función en la barra superior y pulsa "Ejecutar".
 * El resultado sale en el "Registro de ejecución".
 */

/** Pone una contraseña nueva a un usuario que ha olvidado la suya. */
function restablecerContrasena() {
  const USUARIO = 'escribe-el-usuario';
  const NUEVA = 'escribe-una-contraseña-nueva'; // 6 o más caracteres

  const usuario = USUARIO.trim().toLowerCase();
  if (NUEVA.length < 6) throw new Error('La contraseña nueva debe tener al menos 6 caracteres');
  const sh = cuentas_();
  const f = fila_(sh, usuario);
  if (!f) throw new Error('No existe el usuario "' + usuario + '"');
  const salt = Utilities.getUuid().replace(/-/g, '');
  sh.getRange(f, 3, 1, 2).setNumberFormat('@').setValues([[salt, hashPass_(NUEVA, salt)]]);
  limpiar_('u:' + usuario);
  Logger.log('Listo: "' + usuario + '" ya puede entrar con la contraseña nueva. Sus sesiones antiguas se cerrarán.');
}

/** Borra un usuario y todos sus datos. No se puede deshacer. */
function eliminarUsuario() {
  const USUARIO = 'escribe-el-usuario';

  const usuario = USUARIO.trim().toLowerCase();
  const sh = cuentas_();
  const f = fila_(sh, usuario);
  if (!f) throw new Error('No existe el usuario "' + usuario + '"');
  sh.deleteRow(f);
  const vis = ss_().getSheetByName('Usuarios');
  if (vis) {
    const g = fila_(vis, usuario);
    if (g) vis.deleteRow(g);
  }
  Logger.log('Usuario "' + usuario + '" eliminado.');
}
