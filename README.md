# TaskCenter

Agenda semanal, tareas, apuntes técnicos y pedidos. Funciona en móvil, tablet y escritorio, se instala como app y guarda los datos en una hoja de Google Sheets.

**Versión 1.6.0 · GUSTAVO DEVELOPER**

## Cómo funciona con varias personas

- Cada persona **crea su usuario** la primera vez que abre la app (nombre, usuario y un **patrón** dibujado uniendo al menos 4 puntos (como el bloqueo de Android); **cualquiera puede registrarse**, no hace falta código). El usuario queda registrado en la pestaña **Usuarios** de la hoja.
- Cada usuario tiene **sus propios datos** (tareas, apuntes, pedidos, agenda). Los demás usuarios no los ven. Se sincronizan entre sus dispositivos entrando con usuario y patrón.
- Si alguien quiere compartir un apunte o un pedido contigo, pulsa **Enviar a Gustavo**. Llega a la pestaña **Recibidos** de la hoja, con fecha, usuario, título, detalle y mensaje. Cada envío se guarda una sola vez aunque se pulse dos veces.
- **Privacidad:** como dueño de la hoja, tú puedes ver los datos de todos (están en una pestaña oculta llamada `_cuentas`). Los patrones **no** se guardan: solo una huella cifrada.

## Novedades de la 1.6.0

- **Pedidos más simples:** al entrar a *Pedidos* siempre empiezas eligiendo el tipo (EPP, Materiales de proyecto, Pedido de compra). Los pedidos enviados quedan abajo como **Historial**, con su estado, esperando respuesta. Al **enviar** un pedido vuelves a esta pantalla inicial. Se quitaron los botones de filtro (Todos/Borrador/Enviado/Gestionado) y **Copiar lista / Copiar para Sheets**.
- **Botón «Actualizar»** en la pantalla principal (junto a *Salir*): fuerza la descarga de la última versión de la app. No borra tus datos ni tu sesión, y envía antes lo que tengas pendiente. Necesita internet.
- **Cientos de miles de etiquetas:** la app ya no descarga toda la pestaña *Etiquetas* (con 500 000 filas sería imposible). Al abrir solo baja una vista previa de 300 y, al escribir `/` y unas letras, **busca directamente en la hoja** y muestra las primeras 60 coincidencias, con aviso si hay más (escribe más letras o usa los botones de tipo para afinar). Las que más usas quedan guardadas en el dispositivo y salen primero, incluso sin internet. Sin conexión solo se ven las guardadas.
  - Límite de Google Sheets: 10 millones de celdas por archivo; con 2 columnas caben sobradamente 500 000 filas.

## Novedades de la 1.5.0

- **Etiquetas en todas partes:** escribe `/` en apuntes, notas de la semana y del día, tareas, pedidos y mensajes. Se listan **todas** las etiquetas de la hoja (ya no hay tope de 40), con botones por tipo.
- **Cargos según la tabla Personal:**
  - Se reconocen sin importar mayúsculas, minúsculas ni tildes (`ADMINISTRADOR`, `Almacén`, `Administración`…). Las columnas de *Personal* se identifican por su título, en cualquier orden.
  - **Administrador = quien en Personal tiene cargo de administrador**, identificado por su fotocheck. Solo él ve **Ajustes**. Ya no depende del nombre de usuario.
  - **Sin excepciones:** nadie crea cuenta con un fotocheck que no esté en Personal, tampoco el administrador.
- **A quién va cada pedido:** *Pedido de compra* → Administrador o Supervisor. *Materiales de proyecto* → Encargado, Administrador o Supervisor. *EPP* → Almacén o Administrador. Los apuntes pueden ir a los cuatro cargos. El servidor también lo comprueba.
- **Sin internet:** la app abre y se usa sin conexión. Si envías algo sin señal, queda como **Por enviar**, se guarda en el dispositivo y sale solo al volver la conexión (una sola vez). Si cierras sesión con envíos pendientes, la app te avisa.
- **Salir** sigue en la pantalla principal para todos.

## Novedades de la 1.4.1

- **Categoría fija:** al elegir el tipo en *Nuevo pedido* ya no se vuelve a cambiar dentro del pedido; solo se muestra.
- **Etiquetas clasificadas por tipo.** La pestaña **Etiquetas** tiene dos columnas: **A = Etiqueta** y **B = Tipo**. Usa el tipo que quieras; lo recomendado es **Mic Code**, **Bandeja** y **Equipo**. Al escribir `/` en un apunte aparecen botones por cada tipo (Todas · Bandeja · Equipo · Mic Code): tocas uno y solo ves ese grupo, y sigues filtrando con las letras. También puedes escribir el tipo (`/bandeja`) para listar ese grupo. Cada opción muestra su tipo al lado. Las etiquetas sin tipo salen solo en «Todas».
  - Si ya subiste las bandejas a la columna A, escribe `Bandeja` en la columna B de esas filas (en Sheets: rellena la primera y arrastra hacia abajo).

## Novedades de la 1.4.0

- **Etiquetas dentro del texto.** En un apunte, escribe `/` y las letras que recuerdes de cualquier parte de la etiqueta (por ejemplo `/bw41=09`): la lista se filtra mientras escribes, sin distinguir mayúsculas. Al elegirla (Enter o un toque) el código completo, como `#HKF.BW41=090.YQF01-UH01.WH01`, se escribe **en la misma línea** donde estabas. Si no existe, ofrece crearla. Las etiquetas salen de la pestaña **Etiquetas** (columna A, una por fila); puedes escribirlas con o sin `#`. Las filas de ejemplo que trae son solo muestras: reemplázalas por las tuyas.
- **Funciones según fotocheck.** El cargo de cada persona sale de la pestaña **Personal** y ahora se muestra junto a la fecha en la pantalla principal; lo que puede enviar depende de ese cargo.
- **Pedidos automáticos.** Ya no se elige estado, fecha ni nombre:
  - **Nombre:** las iniciales del nombre (Ana Pérez → `AP`) y un correlativo propio: `AP-001`, `AP-002`…
  - **Fecha:** siempre la de hoy (solo lectura).
  - **Estado:** Borrador → **Enviado** al enviarlo → **Gestionado** cuando el destinatario lo marca.
- **Quien recibe no edita.** En *Recibidos* solo se lee y se marca **Gestionado**. El emisor se entera: al sincronizar, su pedido o apunte pasa a Gestionado y la app le avisa. Si el destinatario lo desmarca, vuelve a Enviado.

## Novedades de la 1.3.0

- **Administrador:** (desde la 1.5.0) el administrador es quien tiene cargo de administrador en *Personal*. El resto de usuarios ve solo **Salir** en la página principal.
- **Pedidos por categoría:** *Nuevo pedido* pregunta el tipo.
  - **EPP:** se elige de la lista de la pestaña **EPPs** de tu hoja.
  - **Materiales de proyecto:** Mic Code opcional.
  - **Pedido de compra:** el enlace del producto (https://…) es obligatorio en cada línea.
  - La lista agrupa por categoría y muestra el estado: Borrador, Enviado, Recibido o Entregado.
  - Al terminar: **Enviar a Gustavo** (llega a *Recibidos* con categoría, líneas, Mic Code y enlaces, y el pedido pasa a *Enviado*) o **Guardar como nota del día** (se añade a la agenda del día del pedido).
- **Etiquetas con «/»:** en un apunte, escribir `/` y las primeras letras muestra las etiquetas de la pestaña **Etiquetas** de tu hoja. Enter o un toque la pone; si ya la tiene, la quita; si no existe, ofrece crearla.
- **Tus listas en la hoja:** al primer uso se crean las pestañas **EPPs** y **Etiquetas** con ejemplos. Edita la columna A (un elemento por fila). Los usuarios ven los cambios al sincronizar (como mucho en un par de minutos, o al reabrir la app).
- Cada pantalla de Apuntes y Pedidos tiene una ayuda desplegable «¿Para qué sirve?».
- Arreglo: al editar un apunte, el primer clic en el menú ya no se pierde.

## Personal, fotocheck y envíos entre usuarios (1.3.0)

**Lista de personal.** En tu hoja se crea la pestaña **Personal** con las columnas `Fotocheck | Nombre | Cargo`. Rellénala con todo el personal: **solo pueden crear usuario quienes estén en esa lista**, y el nombre y el cargo salen de ella. Si la dejas vacía, nadie podrá registrarse (salvo tú, el administrador). Puedes añadir o corregir filas cuando quieras.

**Fotocheck.** Al crear su usuario, cada persona escribe su fotocheck **sin el primer 0** (la pantalla se lo avisa). La app compara ignorando los ceros del principio, así que `01234`, `1234` y el número `1234` de Sheets valen lo mismo. Un fotocheck solo puede tener una cuenta.
- **Cuentas ya creadas:** al entrar se les pide agregar su fotocheck (no se puede cerrar ese aviso; sin él no pueden enviar). Si no está en la lista, lo rechaza.
- Tú (`ADMIN_USUARIO`) no estás obligado a figurar en la lista, pero conviene que pongas tu fotocheck.

**Enviar entre usuarios.** Apuntes y pedidos tienen el botón **Enviar…**: se elige el cargo (**Encargado, Almacén, Supervisor, Administrador**) y luego la persona. Los **pedidos de EPP** solo pueden ir a **Almacén o Administrador**. El cargo se reconoce por palabras en la columna Cargo: *encargad…*, *almac…*, *supervis…*, *administrad…* (por ejemplo «Encargado de almacén» cuenta como Encargado y como Almacén). Quien no tenga una de esas palabras (un «Operario») no aparece como destinatario. Tú siempre apareces como Administrador.

**Recibidos.** Cada usuario tiene la pestaña **Recibidos** con un aviso de mensajes nuevos, el detalle, un botón **Gestionado** y la opción de guardarlo en sus apuntes. Todo queda registrado en la pestaña **Mensajes** de tu hoja (De, Para, Tipo, Título, Detalle, Mensaje, Gestionado), donde también puedes marcar la casilla Gestionado. La pestaña `Recibidos` de versiones anteriores ya no se usa.

**Cambios de cargo.** Si cambias el cargo de alguien en **Personal**, se aplica solo en un minuto aproximadamente.

> Nota de seguridad: el fotocheck no es un secreto. Quien conozca el de un compañero podría registrarse antes que él. Si pasa, elimina esa cuenta con `eliminarUsuario` (libera el fotocheck) y que el compañero se registre.

## Qué contiene

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | La app completa |
| `manifest.webmanifest`, `sw.js`, `favicon.svg`, `icons/` | Instalación como app, uso sin conexión e iconos |
| `.nojekyll` | Evita que GitHub Pages procese los archivos |
| `Code.gs` | Script de Google. **No se sube a GitHub**: se pega en Apps Script |

## Puesta en marcha

### 1. Actualizar el script de Google (obligatorio)

1. Abre tu hoja `TaskCenter` → **Extensiones → Apps Script**.
2. Borra todo el código y pega el contenido de este `Code.gs`.
3. Guarda y entra en **Implementar → Administrar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar**. Acceso: **Cualquier usuario**. La URL no cambia.
4. Abre la URL `/exec` en el navegador: debe mostrar `"version":"1.6.0"`.

> Ya no hay "clave" en la app: ahora cada persona entra con su usuario y patrón.

### 2. Subir la nueva versión de la app a GitHub

Reemplaza `index.html` (y `sw.js` si cambió) en tu repositorio. Los móviles descargarán la versión nueva solos. La URL de tu script ya viene puesta en `index.html`.

### 3. Crear usuarios

1. Abre la app. Verás la pantalla **Crea tu usuario**.
2. Cada persona (**tú también**) escribe nombre, usuario y dibuja su patrón dos veces (para confirmarlo).
3. Para entrar desde otro dispositivo: **Ya tengo usuario**.

Si en tu dispositivo había datos de la versión anterior, la app te pregunta si son tuyos y los importa a tu usuario.

### 4. Instalar como app

- **Android (Chrome):** botón **Instalar app** en Ajustes, o menú ⋮ → *Instalar aplicación*.
- **Windows, Mac, Linux (Chrome o Edge):** icono de instalar en la barra de direcciones.
- **iPhone y iPad (Safari):** Compartir → *Añadir a pantalla de inicio*.

## Qué verás en la hoja

| Pestaña | Contenido |
| --- | --- |
| **Usuarios** | Lista de usuarios, nombre, fecha de alta, último acceso y cuántas tareas, apuntes y pedidos tiene cada uno |
| **EPPs** y **Etiquetas** | Tus listas: una por fila en la columna A |
| **Personal** | Tu lista: Fotocheck, Nombre, Cargo |
| **Mensajes** | Todo lo que se envían los usuarios entre sí |
| *(Recibidos, antigua)* | Ya no se usa; puedes borrarla |
| `_cuentas` (oculta) | Datos reales de la app. No la edites ni la borres |

Las pestañas antiguas `_datos`, `Tareas`, `Apuntes`, `Pedidos` y `Agenda` de la versión anterior ya no se usan. Puedes borrarlas.

## Tareas de administrador

En Apps Script, edita los dos textos al inicio de la función, guarda y pulsa **Ejecutar**:

- **`restablecerContrasena`**: si alguien olvida su patrón, pon su usuario y ejecútala. Su patrón pasa a ser temporal: **arriba izquierda → arriba centro → arriba derecha → centro** (puntos 0‑1‑2‑4). Sus sesiones abiertas se cierran y debe entrar con ese patrón.
- **`eliminarUsuario`**: borra un usuario y todos sus datos. No se puede deshacer.

## Preguntas frecuentes

**"Demasiados intentos".** Tras varios fallos seguidos se bloquea 10 minutos para proteger las cuentas. El registro admite como máximo 20 altas cada 10 minutos, para evitar que un robot llene la hoja. Si algún día quieres limpiar usuarios, usa `eliminarUsuario`.

**"No conecta con la hoja".** Abre la URL `/exec` en el navegador: debe mostrar «API activa» y la versión 1.6.0. Si no, repite el paso 1 (Nueva versión, acceso «Cualquier usuario»).

**"Tu sesión ya no es válida".** Ocurre si restableciste el patrón del usuario o lo eliminaste. Basta con entrar de nuevo.

**¿Y sin conexión?** La app sigue funcionando y guarda en el dispositivo; sincroniza sola al volver internet. Enviar a Gustavo sí necesita conexión.

**Cerrar sesión borra los datos del dispositivo**, pero siguen en la hoja y vuelven al entrar. Si hay cambios sin sincronizar, la app avisa antes de salir.

**Copia de seguridad.** En **Ajustes** puedes copiar tus datos en texto y restaurarlos.
