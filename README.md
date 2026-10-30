# TaskCenter

Agenda semanal, tareas, apuntes técnicos y pedidos. Funciona en móvil, tablet y escritorio, se instala como app y guarda los datos en tu propia hoja de Google Sheets.

**Versión 1.0.0 · GUSTAVO DEVELOPER**

## Qué contiene

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | La app completa (una sola página, sin instalar nada) |
| `manifest.webmanifest` | Datos para instalarla como app (nombre, colores, iconos) |
| `sw.js` | Permite usarla sin conexión |
| `favicon.svg` y carpeta `icons/` | Icono de la app |
| `Code.gs` | Script de Google que guarda tus datos en la hoja. **No se sube a GitHub**, se pega en Apps Script |
| `.nojekyll` | Evita que GitHub Pages procese los archivos |

## Puesta en marcha (unos 10 minutos)

### 1. Preparar tu hoja de Google

1. En Google Drive crea una hoja de cálculo nueva y llámala `TaskCenter`.
2. Ábrela y entra en **Extensiones → Apps Script**.
3. Borra el código que aparece y pega todo el contenido de `Code.gs`.
4. En la línea `const CLAVE = 'CAMBIA-ESTA-CLAVE';` escribe una clave tuya, larga y difícil de adivinar (por ejemplo, 20 letras y números). Guárdala: la necesitarás en la app.
5. Pulsa **Implementar → Nueva implementación**, toca el engranaje y elige **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Pulsa **Implementar** y acepta los permisos de Google (si aparece un aviso de "app no verificada", elige *Avanzado → Ir a TaskCenter*, es tu propio script).
7. Copia la **URL de la aplicación web**. Termina en `/exec`.

> La clave es lo que protege tus datos, porque la URL no pide iniciar sesión. No la compartas ni la subas a GitHub.

### 2. Subir la app a GitHub

1. Crea un repositorio nuevo en GitHub, por ejemplo `taskcenter`. Puede ser público: la app no contiene tus datos ni tu clave.
2. Sube estos archivos a la raíz del repositorio: `index.html`, `manifest.webmanifest`, `sw.js`, `favicon.svg`, `.nojekyll` y la carpeta `icons`. (`Code.gs` y este `README.md` pueden subirse o no.)
3. En el repositorio entra en **Settings → Pages**.
4. En **Build and deployment** elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Pulsa **Save**.
5. Espera un par de minutos. Tu app quedará en `https://TU-USUARIO.github.io/taskcenter/`.

### 3. Conectar la app con tu hoja

1. Abre la dirección de GitHub Pages en tu móvil, tablet u ordenador.
2. Pulsa **Datos** (abajo a la izquierda, o en la barra inferior) para abrir **Ajustes**.
3. La **URL `/exec`** ya viene puesta. Escribe solo la **clave** y pulsa **Guardar y conectar**. (Si algún día cambia la URL, edita `DEFAULT_URL` en `index.html`.)
4. Cuando el estado diga **Al día**, ya está sincronizando.
5. Para conectar otro dispositivo sin escribir nada, pulsa **Copiar enlace para otro dispositivo**, envíatelo y ábrelo allí. El enlace lleva tu clave, así que no lo compartas con nadie más.

En tu hoja de Google aparecerán las pestañas **Tareas**, **Apuntes**, **Pedidos** y **Agenda** con una copia legible de tus datos. Son de solo lectura: lo que escribas en ellas se sobrescribe. La pestaña oculta `_datos` es la que usa la app.

### 4. Instalar como app

- **Android (Chrome):** pulsa **Instalar app** dentro de TaskCenter, o el menú ⋮ → *Instalar aplicación*.
- **Windows, Mac o Linux (Chrome o Edge):** pulsa **Instalar app** o el icono de instalar en la barra de direcciones.
- **iPhone y iPad (Safari):** botón Compartir → *Añadir a pantalla de inicio*.

## Actualizar la app

1. Cambia el archivo que quieras en GitHub.
2. Si cambias algo de la app, sube también el número de versión en `index.html`: busca `var VERSION='1.0.0'` y cámbialo (por ejemplo, a `1.0.1`). Ese número se muestra en el pie de página y hace que el móvil descargue la versión nueva.
3. Si cambias `Code.gs`, pégalo en Apps Script y ve a **Implementar → Administrar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar**. La URL no cambia.

## Preguntas frecuentes

**Dice "Clave incorrecta".** La clave de la app debe ser idéntica a la de `Code.gs` (distingue mayúsculas). Si la cambias en `Code.gs`, despliega una nueva versión.

**Dice "No se pudo llegar a la hoja".** Comprueba que la URL termina en `/exec` y que el acceso es **Cualquier usuario**.

**¿Y si no tengo conexión?** La app sigue funcionando y guarda en el dispositivo. Al volver la conexión, sincroniza sola.

**¿Qué pasa si edito desde dos dispositivos a la vez?** Cada elemento se guarda con su fecha de edición y gana el cambio más reciente. Lo eliminado también se sincroniza.

**Copia de seguridad.** En **Ajustes → Copia de seguridad** puedes copiar todos tus datos en texto y restaurarlos más tarde.
