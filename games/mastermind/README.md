# Super Código

Juego móvil de deducción inspirado visualmente en el clásico tablero de clavijas de los años 70, sin utilizar logos ni ilustraciones originales. **PWA sin frameworks, sin cuentas y sin servidor**. Incluye modo individual y modo de dos jugadores por turnos en el mismo dispositivo.

## Abrir / instalar

1. Sube **todos los archivos** y carpetas de este proyecto a la raíz de un repositorio de GitHub (incluyendo `.nojekyll`).
2. En el repositorio, abre **Settings → Pages → Build and deployment → Deploy from a branch**. Selecciona **main / (root)** y guarda.
3. GitHub Pages publicará la app bajo `https://TU_USUARIO.github.io/NOMBRE_REPO/`. La publicación puede tardar unos minutos.
4. En iPhone abre la URL y selecciona **Compartir → Añadir a pantalla de inicio**. En Android usa el menú del navegador → **Instalar aplicación** o **Añadir a pantalla de inicio**. Su aspecto y ubicación dependen del navegador.
5. Tras la primera visita y una vez instalados los recursos, el juego puede funcionar sin conexión a Internet en los navegadores compatibles.

Para probar localmente: ejecuta `python3 -m http.server 8080` dentro de la carpeta y abre `http://localhost:8080`.

## Modos

### Solitario

- Beginner: 4 huecos, 4 colores, sin repetir, 12 intentos.
- Easy: 4 huecos, 6 colores, sin repetir, 12 intentos.
- Medium: 5 huecos, 6 colores, repeticiones, 11 intentos.
- Hard: 5 huecos, 8 colores, repeticiones, 10 intentos.
- Experto: comienza con 5 huecos y 8 colores; tras cada victoria aumenta progresivamente el tamaño, los colores y/o reduce el número de intentos, hasta 7 huecos, 10 colores y 6 intentos.

El código secreto se genera mediante el generador aleatorio criptográfico del navegador. Las pistas no se sortean: siguen exactamente las reglas del juego, distinguiendo aciertos completos (negro) de colores correctos mal colocados (blanco), con soporte para repeticiones.

### Dos jugadores (local)

1. El creador configura el tablero (Super 5×8 o Clásico 4×6), permite o no colores repetidos y construye el código secreto.
2. Pulsa **Ocultar código**. Aparece una pantalla neutral para pasar el móvil.
3. El descifrador introduce su combinación y pulsa **Confirmar intento**.
4. Se oculta el intento y se pasa el móvil al creador.
5. El creador puede pulsar **Mostrar código secreto** para consultarlo. Después marca manualmente sus pistas: pulsar un hueco lo cambia entre *vacío → negro → blanco → vacío*. También existe la opción **Calcular pistas**, que rellena la puntuación exacta si quiere evitar errores de cálculo.
6. Confirma las pistas, pasa el móvil y se repite el ciclo. La partida termina al acertar todos los huecos o agotar intentos.

Las pantallas de transición **ocultan** la combinación a simple vista. Esto es un juego de confianza: como todo funciona en un solo dispositivo, no se puede impedir técnicamente que alguien que se haga pasar por el creador pulse Mostrar código o inspeccione el almacenamiento del navegador. No se pide PIN.

## Publicación y límites

GitHub Pages sirve contenido estático. Permite toda esta lógica de juego y una PWA offline, pero **no proporciona por sí mismo un servidor de partidas en tiempo real**. Se podría añadir multijugador online más adelante conservando GitHub Pages para la interfaz y usando un backend aparte (como Firebase, Supabase o un servicio de salas).

## Datos

La partida actual y los contadores se guardan en el almacenamiento local del navegador y se reanudan al abrir la app. No se envía información a ningún servidor y no se utilizan librerías ni servicios externos.

## Desarrollo

- `index.html`: estructura y recursos PWA.
- `styles.css`: estética de madera/bakelita, clavijas y UI responsive.
- `app.js`: pantallas, flujo de turnos, interacción y persistencia.
- `engine.js`: generación aleatoria y valoración de pistas.
- `sw.js`, `manifest.webmanifest`, `assets/`: soporte instalable/offline.
- `tests/engine.test.mjs`: pruebas de las reglas (`npm test`).

**Nota de marca**: «Super Código» es un título independiente e inspirado en los componentes del juego tradicional; no se han incluido las fotografías ni los distintivos comerciales originales.
