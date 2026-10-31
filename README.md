# TaskCenter

Agenda semanal, tareas, apuntes técnicos y pedidos. Funciona en móvil, tablet y escritorio, se instala como app y guarda los datos en una hoja de Google Sheets.

**Versión 1.2.0 · GUSTAVO DEVELOPER**

## Cómo funciona con varias personas

- Cada persona **crea su usuario** la primera vez que abre la app (nombre, usuario y un **patrón** dibujado uniendo al menos 4 puntos (como el bloqueo de Android); **cualquiera puede registrarse**, no hace falta código). El usuario queda registrado en la pestaña **Usuarios** de la hoja.
- Cada usuario tiene **sus propios datos** (tareas, apuntes, pedidos, agenda). Los demás usuarios no los ven. Se sincronizan entre sus dispositivos entrando con usuario y patrón.
- Si alguien quiere compartir un apunte o un pedido contigo, pulsa **Enviar a Gustavo**. Llega a la pestaña **Recibidos** de la hoja, con fecha, usuario, título, detalle y mensaje. Cada envío se guarda una sola vez aunque se pulse dos veces.
- **Privacidad:** como dueño de la hoja, tú puedes ver los datos de todos (están en una pestaña oculta llamada `_cuentas`). Los patrones **no** se guardan: solo una huella cifrada.

## Novedades de la 1.2.0

- **Administrador:** el usuario `gustavo` (cámbialo en `ADMIN_USUARIO` de `Code.gs`) es el único que ve **Ajustes** (URL, copia de seguridad). **Regístrate tú primero con ese usuario** para que nadie más lo tome. El resto de usuarios ve solo **Salir** en la página principal.
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
4. Abre la URL `/exec` en el navegador: debe mostrar `"version":"1.2.0"`.

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
| **Recibidos** | Lo que te envían: fecha, usuario, tipo, título, detalle y mensaje. Marca la casilla **Gestionado** cuando lo atiendas |
| `_cuentas` (oculta) | Datos reales de la app. No la edites ni la borres |

Las pestañas antiguas `_datos`, `Tareas`, `Apuntes`, `Pedidos` y `Agenda` de la versión anterior ya no se usan. Puedes borrarlas.

## Tareas de administrador

En Apps Script, edita los dos textos al inicio de la función, guarda y pulsa **Ejecutar**:

- **`restablecerContrasena`**: si alguien olvida su patrón, pon su usuario y ejecútala. Su patrón pasa a ser temporal: **arriba izquierda → arriba centro → arriba derecha → centro** (puntos 0‑1‑2‑4). Sus sesiones abiertas se cierran y debe entrar con ese patrón.
- **`eliminarUsuario`**: borra un usuario y todos sus datos. No se puede deshacer.

## Preguntas frecuentes

**"Demasiados intentos".** Tras varios fallos seguidos se bloquea 10 minutos para proteger las cuentas. El registro admite como máximo 20 altas cada 10 minutos, para evitar que un robot llene la hoja. Si algún día quieres limpiar usuarios, usa `eliminarUsuario`.

**"No conecta con la hoja".** Abre la URL `/exec` en el navegador: debe mostrar «API activa» y la versión 1.2.0. Si no, repite el paso 1 (Nueva versión, acceso «Cualquier usuario»).

**"Tu sesión ya no es válida".** Ocurre si restableciste el patrón del usuario o lo eliminaste. Basta con entrar de nuevo.

**¿Y sin conexión?** La app sigue funcionando y guarda en el dispositivo; sincroniza sola al volver internet. Enviar a Gustavo sí necesita conexión.

**Cerrar sesión borra los datos del dispositivo**, pero siguen en la hoja y vuelven al entrar. Si hay cambios sin sincronizar, la app avisa antes de salir.

**Copia de seguridad.** En **Ajustes** puedes copiar tus datos en texto y restaurarlos.
