/* =========================================================
   CONFIGURACIÓN DE LA INVITACIÓN
   Todo lo que hay que editar está acá. No hace falta tocar
   el resto del código.
   ========================================================= */
window.INVITACION = {
  nombre: "María Luz",

  // Fecha y hora de inicio (hora de Argentina, UTC-3)
  fecha: "2026-10-24",
  hora: "21:30",          // ← CAMBIAR por la hora real de la fiesta
  horaFin: "05:00",       // para el evento del calendario (día siguiente)

  // Lugar
  lugarNombre: "",        // ej: "Salón Los Aromos" (si queda vacío se muestra "El lugar")
  lugarDireccion: "",     // ej: "Av. Siempre Viva 742, Salta"
  mapsUrl: "https://maps.app.goo.gl/MMp5Ywnx28wY28J49?g_st=iw",

  // WhatsApp para confirmar (solo números, con código de país)
  whatsapp: "5493874824080",
  confirmarAntesDe: "",   // ej: "17 de octubre" (vacío = no se muestra)

  // Mostrar la nota "el azul es de la quinceañera"
  reservarAzul: true,

  // Regalo: alias/CBU opcional (vacío = no se muestra)
  alias: "",

  // ----- SPOTIFY -----
  // 1) Creá una playlist en Spotify, tocá "..." > "Invitar colaboradores"
  //    y pegá acá ese link de invitación. Así los invitados pueden
  //    sumar temas directamente desde su Spotify.
  spotifyPlaylistUrl: "",
  // 2) (opcional) ID de la playlist para mostrarla embebida en la página.
  //    Es la parte después de /playlist/ en el link. Ej: "37i9dQZF1DXcBWIGoYBM5M"
  spotifyPlaylistId: "",

  // ----- MÚSICA DE FONDO -----
  // Si subís un mp3 propio (ej: "assets/musica.mp3") se usa ese.
  // Si queda vacío, suena una selección de adelantos (30s) de estos temas.
  musicaLocal: "",
  musicaFondo: [
    "Tiempo de vals Chayanne",
    "Cupido Tini",
    "Disciplina Lali",
    "Don Miranda!",
    "Provenza Karol G",
    "Como si no importara Emilia Duki",
    "Automático María Becerra",
    "Princesa Tini",
  ],

  // Sugerencias rápidas del buscador de la playlist
  sugerencias: [
    "Tini", "Lali", "Karol G", "Emilia", "María Becerra",
    "Miranda!", "La Konga", "Ulises Bueno", "Bizarrap", "Soda Stereo",
  ],

  // Géneros para votar
  generos: [
    { nombre: "Cumbia", emoji: "🪇" },
    { nombre: "Cuarteto", emoji: "🎺" },
    { nombre: "Reggaetón", emoji: "🔥" },
    { nombre: "RKT", emoji: "🚀" },
    { nombre: "Pop", emoji: "💫" },
    { nombre: "Rock nacional", emoji: "🎸" },
    { nombre: "Electrónica", emoji: "🎧" },
    { nombre: "Lentos", emoji: "💙" },
    { nombre: "Clásicos de los 2000", emoji: "📼" },
  ],
};
