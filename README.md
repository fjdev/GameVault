# GAME VAULT · Primera versión jugable

Una colección retro de juegos de mesa, alojable en GitHub Pages y diseñada como una PWA para móviles. **No requiere servidor, cuentas ni dependencias externas.** La cámara de cofres utiliza arte original hecho con CSS/SVG y una estética de fantasía oscura setentera/ochentera. Al abrir cada cofre, **cada juego mantiene su propia identidad visual**, sin elementos medievales dentro del tablero.

## Incluye

- **Mastermind / Super Código:** se ha integrado la versión anterior sin modificar sus reglas. Modo solitario con 5 dificultades y modo local de dos personas, pantallas de privacidad y pistas manuales o automáticas.
- **Othello:** tablero verde con marco negro, disco bicolor, movimientos legales y volteo automático en ocho direcciones. Cinco niveles de rival (aleatorio, heurístico y minimax con poda alfa-beta), modo local, pase de turno cuando no hay jugadas y final por recuento de fichas.
- **Battleship:** cuadrículas 10 × 10, flota clásica de cinco barcos (5, 4, 3, 3, 2); colocación manual o aleatoria y rotación; disparos, impactos, agua, hundimientos y victoria automática. Cinco dificultades de la máquina, desde azar hasta búsqueda probabilística, y modo local con pantalla de privacidad entre turnos.
- Cada juego **guarda su progreso en el navegador** mediante `localStorage`; no se transmite información a ningún servidor.

## Instalación en GitHub Pages

1. Sube **el contenido** de esta carpeta a la raíz de tu repositorio en GitHub, incluido `.nojekyll`, `games/`, `assets/` y los archivos de la raíz.
2. En **Settings → Pages**, selecciona **Deploy from a branch → main / (root)**.
3. Accede a `https://TU_USUARIO.github.io/TU_REPOSITORIO/`.
4. En iPhone, usa Safari → Compartir → Añadir a pantalla de inicio. En Android, usa el menú del navegador → Instalar aplicación o Añadir a pantalla de inicio.
5. Después de la primera carga online, los recursos precargados pueden utilizarse sin conexión en navegadores compatibles. Para probar localmente: `python3 -m http.server 8080` y abre `http://localhost:8080`.

## Estructura

- `index.html`, `vault.css`: cámara de cofres, portada de fantasía con animaciones.
- `games/mastermind/`: versión preexistente, aislada visualmente.
- `games/othello/engine.js`: reglas y niveles de IA de Othello.
- `games/battleship/engine.js`: reglas, flotas y niveles de IA de Battleship.
- `manifest.webmanifest`, `sw.js`, `assets/`: PWA, iconos y precarga offline.
- `tests/`: pruebas de motores; ejecuta `npm test` con Node.js instalado.

## Notas

- El juego de Othello que aparece en tu foto muestra el sello **Milton Bradley**, no Pressman. Se utiliza como referencia visual el tablero **verde con carcasa negra** de la fotografía proporcionada.
- Las fotografías adjuntas sirven como referencias visuales, no se han incrustado en los archivos publicados. Ningún arte original de caja, logotipo de fabricante ni personaje de otras franquicias se ha copiado al diseño.
- El multijugador es en un solo móvil y **se basa en la confianza**. No existe sincronización en línea ni bloqueo de seguridad entre personas. En el mismo dispositivo, un usuario con acceso al almacenamiento del navegador puede inspeccionar los datos.
- Esta es una **primera versión jugable**, no una reproducción idéntica de componentes comerciales ni un producto probado en todas las plataformas. Los algoritmos de IA son niveles orientativos, no equivalentes a un rival humano experto.
