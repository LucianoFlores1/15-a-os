# Mis XV · María Luz 💙

Invitación web para los 15 de María Luz, **sábado 24 de octubre**.
Temática: *"La noche en que brilla la Luz"*: un cielo azul noche que se va iluminando a medida que bajás.

Es un sitio estático (HTML + CSS + JS, sin dependencias), pensado primero para celulares.

## Qué tiene
- **Sobre con sello lacrado**: al tocarlo se abre la carta y arranca la música.
- **Música de fondo** con reproductor flotante (vinilo): adelantos de temas en español (Chayanne, Tini, Lali, Miranda!, Karol G, Emilia, María Becerra…).
- **Cielo interactivo**: estrellas con parallax, estrellas fugaces y estela de brillos al deslizar el dedo.
- **Frase que se ilumina palabra por palabra** con el scroll.
- **Cuenta regresiva**, mini calendario y botón para **agendar en Google Calendar**.
- **Ubicación** con botón "Cómo llegar" (Google Maps).
- **Dress code** Elegante sport (sin ropa deportiva ni gorras), con animaciones.
- **"El DJ sos vos"**: buscador de canciones con portada y adelanto de 30s, termómetro de la pista, votación de géneros y links a Spotify. Lo que elige cada invitado viaja en su mensaje de confirmación.
- **Confirmación por WhatsApp** al +54 9 387 482-4080 con mensaje armado (nombre, cantidad, alimentación, mensaje, temas).
- Confeti, vibración (Android) y mensajitos de feedback en cada interacción.

## Cómo personalizar
Todo se edita en **`js/config.js`**: hora, nombre del salón, dirección, fecha límite para confirmar, alias para regalos, playlist colaborativa de Spotify, música de fondo, etc.

### Playlist colaborativa de Spotify (recomendado)
1. Creá una playlist en Spotify → `···` → **Invitar colaboradores** → copiá el link.
2. Pegalo en `spotifyPlaylistUrl`.
3. (Opcional) Poné el ID de la playlist en `spotifyPlaylistId` para mostrarla embebida.

### Música propia
Subí un mp3 a `assets/musica.mp3` y poné `musicaLocal: "assets/musica.mp3"`.

## Publicar gratis (GitHub Pages)
Settings → Pages → *Deploy from a branch* → elegí la rama y la carpeta `/ (root)`.
