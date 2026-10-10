/* =========================================================
   XV · María Luz — interacciones
   ========================================================= */
(() => {
  "use strict";

  const C = window.INVITACION;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buzz = (ms = 12) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
  };

  // Fecha del evento en hora argentina (UTC-3)
  const eventStart = new Date(`${C.fecha}T${C.hora || "21:00"}:00-03:00`);
  const eventEnd = (() => {
    const d = new Date(`${C.fecha}T${C.horaFin || "05:00"}:00-03:00`);
    if (d <= eventStart) d.setDate(d.getDate() + 1);
    return d;
  })();
  const year = C.fecha.slice(0, 4);

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg, ms = 2600) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), ms);
  }

  /* ---------------- Confeti / chispas ---------------- */
  const FX_COLORS = ["#ffffff", "#d6e5ff", "#9cc2ff", "#5b8cff", "#2350d8", "#eef3fc"];
  function burst(x, y, { count = 26, chars = ["✦", "●", "■", "✧"], spread = 1, size = [8, 18], gravity = 1 } = {}) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "fx";
      el.textContent = chars[(Math.random() * chars.length) | 0];
      const s = size[0] + Math.random() * (size[1] - size[0]);
      el.style.cssText = `left:${x}px;top:${y}px;font-size:${s}px;color:${FX_COLORS[(Math.random() * FX_COLORS.length) | 0]};text-shadow:0 0 8px rgba(156,194,255,.8)`;
      document.body.appendChild(el);
      const a = Math.random() * Math.PI * 2;
      const v = (60 + Math.random() * 160) * spread;
      const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 80 * spread;
      el.animate(
        [
          { transform: "translate(-50%,-50%) scale(.4) rotate(0deg)", opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: .55 },
          { transform: `translate(calc(-50% + ${dx * 1.2}px), calc(-50% + ${dy + 160 * gravity}px)) scale(.6) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ],
        { duration: 1300 + Math.random() * 900, easing: "cubic-bezier(.2,.8,.3,1)" }
      ).onfinish = () => el.remove();
    }
  }
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  /* =========================================================
     CIELO: estrellas, estrellas fugaces y estela al tocar
     ========================================================= */
  const sky = (() => {
    const cv = $("#sky");
    const ctx = cv.getContext("2d");
    let W, H, dpr, stars = [], shooting = [], trail = [];
    let light = 0, scrollY = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / 3200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 1.6,
        r: Math.random() * 1.3 + .2,
        depth: Math.random() * .6 + .15,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * .02 + .005,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      // estrellas (se encienden más a medida que se baja = "se ilumina la Luz")
      for (const s of stars) {
        s.tw += s.sp;
        const y = ((s.y - scrollY * s.depth * .35) % (H * 1.6) + H * 1.6) % (H * 1.6);
        if (y > H + 4) continue;
        const a = (.35 + .65 * Math.abs(Math.sin(s.tw))) * (.55 + light * .45);
        ctx.beginPath();
        ctx.fillStyle = `rgba(226,236,255,${a})`;
        ctx.arc(s.x, y, s.r * (1 + light * .4), 0, Math.PI * 2);
        ctx.fill();
      }
      // estrellas fugaces
      if (!reduceMotion && Math.random() < .004 + light * .006) {
        shooting.push({ x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .4, vx: -(6 + Math.random() * 5), vy: 2.5 + Math.random() * 2, life: 1 });
      }
      shooting = shooting.filter((s) => s.life > 0);
      for (const s of shooting) {
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
        g.addColorStop(0, `rgba(255,255,255,${s.life})`);
        g.addColorStop(1, "rgba(156,194,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= .018;
      }
      // estela de brillos (dedo / mouse)
      trail = trail.filter((p) => p.life > 0);
      for (const p of trail) {
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.h},100%,88%,${p.life})`;
        ctx.shadowColor = "rgba(156,194,255,.9)"; ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        p.x += p.vx; p.y += p.vy; p.vy += .03; p.life -= .022;
      }
      requestAnimationFrame(frame);
    }

    function sparkle(x, y, n = 3) {
      if (reduceMotion) return;
      for (let i = 0; i < n; i++) {
        trail.push({ x, y, vx: (Math.random() - .5) * 1.4, vy: (Math.random() - .5) * 1.4 - .4, r: Math.random() * 2.4 + 1, life: 1, h: 210 + Math.random() * 30 });
      }
    }

    resize();
    addEventListener("resize", resize);
    let last = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 16) return;
      last = now;
      sparkle(e.clientX, e.clientY, e.pointerType === "touch" ? 3 : 2);
    }, { passive: true });
    addEventListener("pointerdown", (e) => sparkle(e.clientX, e.clientY, 10), { passive: true });
    requestAnimationFrame(frame);

    return {
      set light(v) { light = v; },
      set scroll(v) { scrollY = v; },
    };
  })();

  /* =========================================================
     MÚSICA DE FONDO (mp3 propio o adelantos de iTunes)
     ========================================================= */
  function jsonp(url, timeout = 9000) {
    return new Promise((resolve, reject) => {
      const cb = "__xv" + Math.random().toString(36).slice(2);
      const s = document.createElement("script");
      const t = setTimeout(() => { done(); reject(new Error("timeout")); }, timeout);
      function done() { clearTimeout(t); delete window[cb]; s.remove(); }
      window[cb] = (data) => { done(); resolve(data); };
      s.onerror = () => { done(); reject(new Error("network")); };
      s.src = `${url}&callback=${cb}`;
      document.head.appendChild(s);
    });
  }
  async function itunes(term, limit = 12) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&country=AR&limit=${limit}`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status);
      return (await r.json()).results || [];
    } catch (_) {
      return ((await jsonp(url)).results) || [];
    }
  }
  const art = (u, size = 200) => (u || "").replace(/\d+x\d+bb/, `${size}x${size}bb`);

  const music = (() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 0;
    let tracks = [], idx = 0, wanted = false, userPaused = false, ducked = false;
    const player = $("#player");
    const titleEl = $("#playerTitle"), artistEl = $("#playerArtist");
    let compactTimer;

    function fadeTo(target, ms = 1200) {
      const from = audio.volume, start = performance.now();
      return new Promise((res) => {
        (function step(now) {
          const k = Math.min(1, (now - start) / ms);
          audio.volume = Math.max(0, Math.min(1, from + (target - from) * k));
          k < 1 ? requestAnimationFrame(step) : res();
        })(start);
      });
    }

    function showInfo() {
      player.classList.remove("compact");
      clearTimeout(compactTimer);
      compactTimer = setTimeout(() => player.classList.add("compact"), 5000);
    }

    function load(i) {
      if (!tracks.length) return;
      idx = (i + tracks.length) % tracks.length;
      const t = tracks[idx];
      audio.src = t.src;
      titleEl.textContent = t.title;
      artistEl.textContent = t.artist;
      showInfo();
    }

    async function play() {
      if (!tracks.length) { wanted = true; return; }
      if (!audio.src) load(idx);
      try {
        await audio.play();
        player.classList.add("playing");
        fadeTo(.75);
      } catch (_) {
        player.classList.remove("playing");
        artistEl.textContent = "Tocá el disco para escuchar";
        player.classList.remove("compact");
      }
    }
    async function pause() {
      await fadeTo(0, 400);
      audio.pause();
      player.classList.remove("playing");
    }

    audio.addEventListener("timeupdate", () => {
      if (tracks.length > 1 && audio.duration && audio.duration - audio.currentTime < 1.6 && audio.volume > .2 && !audio._fading) {
        audio._fading = true;
        fadeTo(0, 1400).then(() => { audio._fading = false; });
      }
    });
    audio.addEventListener("ended", () => { load(idx + 1); if (!userPaused && !ducked) play(); });
    audio.addEventListener("error", () => { if (tracks.length > 1) { tracks.splice(idx, 1); load(idx); if (wanted) play(); } });

    $("#playerToggle").addEventListener("click", () => {
      buzz();
      if (audio.paused) { userPaused = false; wanted = true; play(); }
      else { userPaused = true; pause(); }
    });
    $("#playerNext").addEventListener("click", () => {
      buzz();
      userPaused = false;
      load(idx + 1);
      audio.volume = 0;
      play();
    });

    async function init() {
      if (C.musicaLocal) {
        tracks = [{ src: C.musicaLocal, title: "Música de la noche", artist: `XV · ${C.nombre}` }];
      } else {
        const results = await Promise.allSettled(C.musicaFondo.map((t) => itunes(t, 1)));
        tracks = results
          .map((r) => (r.status === "fulfilled" ? r.value[0] : null))
          .filter((t) => t && t.previewUrl)
          .map((t) => ({ src: t.previewUrl, title: t.trackName, artist: t.artistName }));
      }
      if (!tracks.length) { player.remove(); return; }
      load(0);
      if (wanted && !userPaused) play();
    }

    return {
      init,
      start() { wanted = true; player.classList.remove("off"); showInfo(); play(); },
      show() { player.classList.remove("off"); showInfo(); },
      duck() { if (!audio.paused) { ducked = true; pause(); } },
      unduck() { if (ducked) { ducked = false; if (!userPaused) play(); } },
    };
  })();

  /* =========================================================
     SOBRE DE BIENVENIDA
     ========================================================= */
  function enterSite(withMusic) {
    const screen = $("#envelopeScreen");
    const env = $("#openEnvelope");
    env.classList.add("open");
    buzz([10, 40, 20]);
    if (withMusic) music.start(); else music.show();
    const [x, y] = centerOf(env);
    setTimeout(() => burst(x, y, { count: 40, spread: 1.4 }), 350);
    setTimeout(() => {
      screen.classList.add("gone");
      document.body.classList.remove("is-locked");
      startHero();
    }, reduceMotion ? 100 : 1500);
    setTimeout(() => screen.remove(), 2600);
  }
  $("#openEnvelope").addEventListener("click", () => enterSite(true), { once: true });
  $("#enterSilent").addEventListener("click", () => enterSite(false), { once: true });

  /* =========================================================
     HERO
     ========================================================= */
  const heroName = $("#heroName");
  heroName.innerHTML = [...C.nombre].map((ch, i) =>
    ch === " " ? " " : `<span class="ch" style="transition-delay:${0.35 + i * 0.07}s">${ch}</span>`
  ).join("");
  function startHero() {
    heroName.classList.add("in");
    $$(".hero .reveal").forEach((el, i) => setTimeout(() => el.classList.add("in"), 100 + i * 180));
    setTimeout(() => { const [x, y] = centerOf(heroName); burst(x, y, { count: 18, spread: .8, size: [6, 12] }); }, 1300);
  }
  $("#heroYear").textContent = year;
  $("#footYear").textContent = year;

  /* =========================================================
     APARICIONES AL HACER SCROLL
     ========================================================= */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }
  }, { threshold: .18, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

  /* =========================================================
     FRASE QUE SE ILUMINA PALABRA POR PALABRA
     ========================================================= */
  const scrubSection = $("#frase");
  const scrubText = $("#scrubText");
  const words = scrubText.textContent.trim().split(/\s+/);
  scrubText.innerHTML = words.map((w) =>
    `<span class="w${/^Luz/.test(w) ? " luz" : ""}">${w}</span>`
  ).join(" ");
  const wordEls = $$(".w", scrubText);
  const scrubSign = $(".scrub-sign");
  let litCount = -1;

  function updateScrub() {
    const r = scrubSection.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
    const n = Math.round(p * (wordEls.length + 3));
    if (n === litCount) return;
    litCount = n;
    wordEls.forEach((w, i) => w.classList.toggle("lit", i < n));
    const done = n >= wordEls.length;
    if (done && !scrubSign.classList.contains("lit")) {
      const luz = wordEls[wordEls.length - 1];
      const [x, y] = centerOf(luz);
      burst(x, y, { count: 30, spread: 1.1 });
      buzz(20);
    }
    scrubSign.classList.toggle("lit", done);
  }

  /* =========================================================
     SCROLL GLOBAL: barra de progreso + "luz" del fondo
     ========================================================= */
  const progressBar = $(".progress span");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      progressBar.style.transform = `scaleX(${p})`;
      document.documentElement.style.setProperty("--light", p.toFixed(3));
      sky.light = p;
      sky.scroll = scrollY;
      updateScrub();
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* =========================================================
     CUENTA REGRESIVA
     ========================================================= */
  const cdEls = Object.fromEntries($$(".cd-num").map((el) => [el.dataset.unit, el]));
  function tick() {
    const diff = eventStart - Date.now();
    if (diff <= 0) {
      const over = Date.now() > eventEnd;
      $("#countdown").style.display = "none";
      $("#countdownNote").textContent = over ? "¡Gracias por hacer de esta noche algo inolvidable! 💙" : "¡Llegó la noche! Te espero ✨";
      return;
    }
    const s = Math.floor(diff / 1000);
    const vals = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    for (const k in vals) {
      const v = String(vals[k]).padStart(2, "0");
      const el = cdEls[k];
      if (el.textContent !== v) {
        el.textContent = v;
        el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
      }
    }
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();

  /* =========================================================
     CUÁNDO Y DÓNDE
     ========================================================= */
  $("#dateTimeText").textContent = C.hora ? `A partir de las ${C.hora} hs` : "¡Te espero!";

  (function miniCalendar() {
    const [y, m, d] = C.fecha.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const days = new Date(y, m, 0).getDate();
    const offset = (first.getDay() + 6) % 7; // semana empieza el lunes
    const monthName = first.toLocaleDateString("es-AR", { month: "long" });
    let html = `<div class="month">${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${y}</div>`;
    html += ["L", "M", "M", "J", "V", "S", "D"].map((x) => `<div class="dow">${x}</div>`).join("");
    html += "<div></div>".repeat(offset);
    for (let i = 1; i <= days; i++) html += `<div class="d${i === d ? " target" : ""}">${i}</div>`;
    $("#miniCal").innerHTML = html;
  })();

  const gcalFmt = (dt) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const location_ = [C.lugarNombre, C.lugarDireccion].filter(Boolean).join(", ") || C.mapsUrl;
  $("#calendarBtn").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(`XV de ${C.nombre} ✨`)}` +
    `&dates=${gcalFmt(eventStart)}/${gcalFmt(eventEnd)}` +
    `&details=${encodeURIComponent(`¡Te espero para festejar mis 15! Dress code: Elegante sport.\nUbicación: ${C.mapsUrl}`)}` +
    `&location=${encodeURIComponent(location_)}`;
  $("#mapsBtn").href = C.mapsUrl;
  if (C.lugarNombre) $("#placeName").textContent = C.lugarNombre;
  if (C.lugarDireccion) $("#placeText").textContent = C.lugarDireccion;
  if (!C.reservarAzul) $("#blueNote").remove();

  // Brillo que sigue al dedo en las tarjetas + leve inclinación 3D
  $$(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      if (e.pointerType === "mouse") card.style.transform = `perspective(800px) rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* =========================================================
     PLAYLIST: buscador + elegidos + géneros
     ========================================================= */
  const picks = store.get("xv-ml-picks", []);
  const vibesOn = new Set(store.get("xv-ml-vibes", []));
  const resultsEl = $("#results");
  const preview = new Audio();
  let previewBtn = null;

  const spotifySearch = (t) => `https://open.spotify.com/search/${encodeURIComponent(`${t.title} ${t.artist}`)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  if (C.spotifyPlaylistUrl) {
    const b = $("#spotifyPlaylistBtn");
    b.href = C.spotifyPlaylistUrl;
    b.hidden = false;
  }
  if (C.spotifyPlaylistId) {
    const box = $("#spotifyEmbed");
    box.innerHTML = `<iframe src="https://open.spotify.com/embed/playlist/${encodeURIComponent(C.spotifyPlaylistId)}?utm_source=generator&theme=0" height="380" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Playlist de la fiesta"></iframe>`;
    box.hidden = false;
  }

  function stopPreview() {
    preview.pause();
    if (previewBtn) { previewBtn.closest(".track").classList.remove("playing"); previewBtn.querySelector(".play-ico").innerHTML = ICON_PLAY; }
    previewBtn = null;
    music.unduck();
  }
  preview.addEventListener("ended", stopPreview);
  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';

  async function search(term) {
    term = term.trim();
    if (!term) return;
    stopPreview();
    resultsEl.innerHTML = `<p class="msg">Buscando “${esc(term)}”… 🎧</p>`;
    try {
      const list = (await itunes(term, 10)).filter((t) => t.trackName);
      if (!list.length) { resultsEl.innerHTML = `<p class="msg">No encontramos nada 😅 Probá con otro nombre.</p>`; return; }
      resultsEl.innerHTML = "";
      list.forEach((t, i) => {
        const track = { id: t.trackId, title: t.trackName, artist: t.artistName, art: art(t.artworkUrl100, 120), preview: t.previewUrl || "" };
        const el = document.createElement("div");
        el.className = "track";
        el.style.animationDelay = `${i * 45}ms`;
        const added = picks.some((p) => p.id === track.id);
        el.innerHTML = `
          <button class="track-art" type="button" aria-label="Escuchar adelanto de ${esc(track.title)}">
            <img src="${esc(track.art)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
            ${track.preview ? `<span class="play-ico">${ICON_PLAY}</span>` : ""}
          </button>
          <div class="track-meta"><div class="track-name">${esc(track.title)}</div><div class="track-artist">${esc(track.artist)}</div></div>
          <button class="add-btn${added ? " added" : ""}" type="button" aria-label="Sumar a la playlist">${added ? "✓" : "+"}</button>`;
        const artBtn = $(".track-art", el);
        artBtn.addEventListener("click", () => {
          if (!track.preview) return;
          if (previewBtn === artBtn) { stopPreview(); return; }
          stopPreview();
          music.duck();
          preview.src = track.preview;
          preview.play().catch(() => {});
          previewBtn = artBtn;
          el.classList.add("playing");
          $(".play-ico", artBtn).innerHTML = ICON_PAUSE;
        });
        $(".add-btn", el).addEventListener("click", (e) => togglePick(track, e.currentTarget));
        resultsEl.appendChild(el);
      });
    } catch (_) {
      resultsEl.innerHTML = `<p class="msg">No pudimos conectarnos 😕 Revisá tu conexión e intentá de nuevo.</p>`;
    }
  }

  const CHEERS = ["¡Temazo! 🔥", "¡Esa no puede faltar! 💃", "¡Al DJ ya le llegó! 🎧", "¡Qué buen gusto! ✨", "¡A la pista! 🪩", "¡Eso! Que suene fuerte 🔊"];
  function togglePick(track, btn) {
    const i = picks.findIndex((p) => p.id === track.id);
    if (i >= 0) {
      picks.splice(i, 1);
      btn.classList.remove("added"); btn.textContent = "+";
      toast("Lo sacamos de tu lista");
    } else {
      if (picks.length >= 15) { toast("¡Máximo 15 temas! Dejale lugar a los demás 😉"); return; }
      picks.push(track);
      btn.classList.add("added"); btn.textContent = "✓";
      const [x, y] = centerOf(btn);
      burst(x, y, { count: 22, chars: ["♪", "♫", "✦", "♬"], size: [12, 22] });
      buzz(18);
      toast(CHEERS[(Math.random() * CHEERS.length) | 0]);
    }
    store.set("xv-ml-picks", picks);
    renderPicks(true);
  }

  function renderPicks(bump) {
    const box = $("#picksBox");
    box.hidden = !picks.length;
    $("#picksCount").textContent = picks.length;
    if (bump) { const c = $("#picksCount"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    $("#picksList").innerHTML = picks.map((t, i) => `
      <li>
        <img src="${esc(t.art)}" alt="" onerror="this.style.visibility='hidden'">
        <div class="pm"><b>${esc(t.title)}</b><span>${esc(t.artist)}</span></div>
        <a class="icon-btn sp" href="${spotifySearch(t)}" target="_blank" rel="noopener" aria-label="Abrir en Spotify">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.4-1.8-9-1a.6.6 0 1 1-.3-1.2c3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.3.9zm1.2-2.7a.8.8 0 0 1-1 .3c-2.7-1.7-6.9-2.2-10.2-1.2a.8.8 0 1 1-.4-1.5c3.7-1.1 8.3-.6 11.4 1.4.3.2.4.7.2 1zm.1-2.8C14.6 9 9.2 8.8 6.1 9.7a.9.9 0 1 1-.5-1.8c3.6-1.1 9.5-.9 13.2 1.3a.9.9 0 0 1-.9 1.7z"/></svg>
        </a>
        <button class="icon-btn" type="button" data-rm="${i}" aria-label="Quitar ${esc(t.title)}">✕</button>
      </li>`).join("");
    updateHeat();
    updateRsvpSongs();
  }
  $("#picksList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-rm]");
    if (!b) return;
    const t = picks[+b.dataset.rm];
    picks.splice(+b.dataset.rm, 1);
    store.set("xv-ml-picks", picks);
    const addBtn = $$(".track").find((el) => $(".track-name", el)?.textContent === t.title);
    if (addBtn) { const a = $(".add-btn", addBtn); a.classList.remove("added"); a.textContent = "+"; }
    renderPicks(true);
  });

  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#searchInput").blur();
    search($("#searchInput").value);
  });
  $("#suggestChips").innerHTML = C.sugerencias.map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join("");
  $("#suggestChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    buzz();
    $("#searchInput").value = c.textContent;
    search(c.textContent);
  });

  // Géneros
  $("#vibes").innerHTML = C.generos.map((g) =>
    `<button class="vibe${vibesOn.has(g.nombre) ? " on" : ""}" type="button" data-v="${esc(g.nombre)}" aria-pressed="${vibesOn.has(g.nombre)}">${g.emoji} ${esc(g.nombre)}</button>`
  ).join("");
  $("#vibes").addEventListener("click", (e) => {
    const b = e.target.closest(".vibe");
    if (!b) return;
    const v = b.dataset.v;
    const on = !vibesOn.has(v);
    on ? vibesOn.add(v) : vibesOn.delete(v);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
    if (on) {
      const [x, y] = centerOf(b);
      const emoji = C.generos.find((g) => g.nombre === v)?.emoji || "✦";
      burst(x, y, { count: 12, chars: [emoji], size: [14, 24], spread: .7 });
      buzz();
    }
    store.set("xv-ml-vibes", [...vibesOn]);
    updateHeat();
    updateRsvpSongs();
  });

  function updateHeat() {
    const score = picks.length + vibesOn.size * .5;
    $("#heatFill").style.width = `${Math.min(100, 4 + score * 13)}%`;
    const msg =
      score === 0 ? "Todavía está fría… ¡poné un tema!" :
      score < 2 ? "¡Arrancó la previa! 🎶" :
      score < 4 ? "Se está armando la pista 💃" :
      score < 6 ? "¡Esto es un fiestón! 🔥" :
      "¡DJ, subile el volumen! 🪩";
    $("#heatMsg").textContent = msg;
  }

  /* =========================================================
     REGALO
     ========================================================= */
  const gift = $("#giftBox");
  function openGift() {
    gift.classList.toggle("open");
    if (gift.classList.contains("open")) {
      const [x, y] = centerOf(gift);
      burst(x, y - 20, { count: 26, chars: ["💙", "✦", "🤍"], size: [12, 22] });
      buzz([10, 30, 10]);
    }
  }
  gift.addEventListener("click", openGift);
  gift.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGift(); } });
  if (C.alias) {
    $("#aliasBox").hidden = false;
    $("#aliasText").textContent = C.alias;
    $("#aliasCopy").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(C.alias); toast("¡Alias copiado! 💙"); }
      catch (_) { toast(C.alias); }
    });
  }

  /* =========================================================
     CONFIRMACIÓN POR WHATSAPP
     ========================================================= */
  if (C.confirmarAntesDe) $("#deadlineText").textContent = `Por favor, confirmá antes del ${C.confirmarAntesDe}.`;

  let guests = 1;
  const countEl = $("#guestCount");
  function setGuests(n) {
    guests = Math.max(1, Math.min(10, n));
    countEl.textContent = guests;
    countEl.classList.remove("bump"); void countEl.offsetWidth; countEl.classList.add("bump");
    buzz(8);
  }
  $("#minus").addEventListener("click", () => setGuests(guests - 1));
  $("#plus").addEventListener("click", () => setGuests(guests + 1));

  const attending = () => $('input[name="attend"]:checked').value === "si";
  $$('input[name="attend"]').forEach((r) => r.addEventListener("change", () => {
    const yes = attending();
    $("#guestsRow").classList.toggle("collapsed", !yes);
    $("#dietField").classList.toggle("collapsed", !yes);
    $("#rsvpBtnText").textContent = yes ? "Confirmar por WhatsApp" : "Avisar por WhatsApp";
    buzz();
  }));

  function updateRsvpSongs() {
    const el = $("#rsvpSongs");
    const parts = [];
    if (picks.length) parts.push(`🎵 ${picks.length} ${picks.length === 1 ? "tema elegido" : "temas elegidos"}`);
    if (vibesOn.size) parts.push(`💃 ${[...vibesOn].join(", ")}`);
    el.hidden = !parts.length;
    el.textContent = parts.length ? `${parts.join(" · ")} — se envían junto con tu confirmación.` : "";
  }

  // Recordar el nombre si ya lo escribió antes
  const nameInput = $("#guestName");
  nameInput.value = store.get("xv-ml-name", "");
  nameInput.addEventListener("input", () => nameInput.closest(".field").classList.remove("error"));

  $("#rsvpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (name.length < 2) {
      const f = nameInput.closest(".field");
      f.classList.remove("error"); void f.offsetWidth; f.classList.add("error");
      $("#formError").textContent = "Contanos tu nombre para poder confirmar 💙";
      nameInput.focus();
      buzz([20, 40, 20]);
      return;
    }
    $("#formError").textContent = "";
    store.set("xv-ml-name", name);

    const diet = $("#diet").value.trim();
    const note = $("#message").value.trim();
    const yes = attending();
    const L = [];
    if (yes) {
      L.push(`¡Hola! 💙 Confirmo mi asistencia a los XV de ${C.nombre} ✨`, "");
      L.push(`👤 *${name}*`);
      L.push(`👥 Somos ${guests} ${guests === 1 ? "persona" : "personas"}`);
      if (diet) L.push(`🍽️ Alimentación: ${diet}`);
    } else {
      L.push(`¡Hola! 💙 Soy *${name}*.`, `Lamentablemente no voy a poder ir a los XV de ${C.nombre} 😔 ¡Le deseo una noche hermosa!`);
    }
    if (note) L.push("", `💌 Mensaje para ${C.nombre}:`, `"${note}"`);
    if (picks.length) {
      L.push("", "🎵 Temas que no pueden faltar:");
      picks.forEach((t) => L.push(`• ${t.title} – ${t.artist}`));
    }
    if (vibesOn.size) L.push("", `💃 Géneros: ${[...vibesOn].join(", ")}`);

    const url = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(L.join("\n"))}`;
    const btn = e.submitter || $(".btn-wa");
    const [x, y] = centerOf(btn);
    burst(x, y, { count: 50, spread: 1.6 });
    buzz([15, 50, 15, 50, 30]);
    toast(yes ? "¡Gracias! Te llevamos a WhatsApp… 💙" : "Gracias por avisar 💙");
    setTimeout(() => { window.location.href = url; }, 900);
  });

  /* =========================================================
     CIERRE: pedí un deseo
     ========================================================= */
  const WISHES = [
    "Que esta noche brille tanto como vos, María Luz ✨",
    "Que los sueños de tus 15 se cumplan uno por uno 💙",
    "Que nunca te falte música, amigos y ganas de bailar 🪩",
    "Que tu luz siga iluminando a todos los que te quieren 🌙",
    "Que esta sea la primera de muchas noches inolvidables 💫",
    "Que cada año te encuentre igual de feliz que hoy 🤍",
  ];
  let wishIdx = Math.floor(Math.random() * WISHES.length);
  $("#wishBtn").addEventListener("click", (e) => {
    const out = $("#wishOut");
    wishIdx = (wishIdx + 1) % WISHES.length;
    out.style.opacity = 0;
    setTimeout(() => { out.textContent = WISHES[wishIdx]; out.style.opacity = 1; }, 250);
    const [x, y] = centerOf(e.currentTarget);
    burst(x, y, { count: 36, spread: 1.3, chars: ["✦", "★", "✧", "💫"] });
    buzz(25);
  });

  /* ---------------- Inicio ---------------- */
  renderPicks(false);
  updateRsvpSongs();
  music.init();
})();
