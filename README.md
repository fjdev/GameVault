# Game Vault V3 — Vintage Fantasy RPG

**Game Vault** es una colección de tres juegos de mesa clásicos dentro de una PWA para móvil y escritorio. Se puede publicar gratis en GitHub Pages, sin cuentas ni servidor propio.

## Rediseño de la V3

La portada y el selector de juegos se han reinterpretado como un módulo de RPG vintage de finales de los años setenta y ochenta:

- Portada de mazmorra ilustrada con piedra, antorchas y criatura guardiana.
- Composición de libro de aventuras, con inventario de tres cofres sobre papel envejecido.
- Tipografía de serif editorial, tintas marrón y rojo, textura de impresión antigua.
- Cofres con ilustraciones originales de aspecto grabado; se abren visualmente al seleccionarlos.
- Maquetación adaptable a pantallas de 320 px, móviles estándar y escritorio.
- Todos los recursos son locales, sin depender de fuentes ni CDNs externos.

**Los tableros de Mastermind, Othello y Battleship NO han cambiado de estilo.** Se han preservado sus motores y el funcionamiento de V2:

| Juego | Modo solitario | Modo 2 jugadores |
| --- | --- | --- |
| Mastermind | Easy / Normal / Hard / Expert | Un jugador oculta el código y otro deduce |
| Othello | IA con cuatro niveles y espera variable | Tablero compartido por turnos |
| Battleship | IA con cuatro niveles y espera variable | Flotas privadas, pasando el teléfono |

Battleship conserva sus señales visuales de **agua**, **impacto** y **barco hundido**. Othello y Battleship mantienen pausas de IA aleatorias de 1 a 2,8 segundos.

## Publicar en GitHub Pages

1. Descomprime `game-vault-v3.zip`.
2. Sube **el contenido de la carpeta** a la raíz de tu repositorio en GitHub; no subas solo el ZIP.
3. En tu repositorio, entra en **Settings → Pages → Deploy from a branch**, elige rama `main`, carpeta `/(root)` y guarda.
4. Abre la URL de GitHub Pages en el móvil e instala la PWA mediante **Añadir a pantalla de inicio** (Safari) o **Instalar aplicación** (Android).
5. Si tenías una versión anterior instalada, recarga con conexión para actualizar el Service Worker (`game-vault-v3.0.0`). Si continúa mostrando la antigua, borra los datos del sitio y vuelve a instalar.

En GitHub Pages, las partidas de dos jugadores **siguen siendo locales en el mismo dispositivo**. Para multijugador online sincronizado se necesitaría un servicio adicional.

## Pruebas

Requiere Node.js 18 o superior para ejecutar las pruebas:

```bash
npm test
```

La V3 ha pasado 13 pruebas automatizadas de reglas, opciones de dificultad y turnos. La portada ha sido comprobada mediante capturas de Chromium para escritorio de 1440 px, móvil de 390 px y móvil estrecho de 320 px. **La validación manual en un teléfono real sigue pendiente.**

## Arquitectura

- `index.html`, `vault.css`: menú de Game Vault V3.
- `assets/art`: ilustraciones originales y textura impresa optimizadas para la web.
- `games/mastermind`, `games/othello`, `games/battleship`: tres juegos independientes.
- `sw.js`, `manifest.webmanifest`: caché offline e instalación.
- `tests/`: pruebas automatizadas.

## Arte y derechos

Las imágenes de las portadas antiguas compartidas por el usuario sirven como referencias estéticas, pero **no están incrustadas en el proyecto**. Las ilustraciones de la V3 son recursos originales de prototipo con estética de grabado e impresión antigua, **no pinturas originales hechas a mano**. Para alcanzar plenamente la calidad pictórica de las referencias, sería necesario reemplazar estos recursos por ilustraciones artísticas de mayor calidad; no exige reconstruir los juegos.
