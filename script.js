// Chemins vers tes vidéos et audios
const VIDEO_PATHS = [
  "assets/video/gradient01.mp4",
  "assets/video/gradient02.mp4",
  "assets/video/gradient03.mp4",
  "assets/video/gradient04.mp4",
  "assets/video/gradient05.mp4",
  "assets/video/gradient06.mp4",
  "assets/video/gradient07.mp4",
  "assets/video/gradient08.mp4"
];

const AUDIO_PATHS = [
  "assets/audio/gradientadata01.m4a",
  "assets/audio/gradientadata02.m4a",
  "assets/audio/gradientadata03.m4a",
  "assets/audio/gradientadata04.m4a",
  "assets/audio/gradientadata05.m4a",
  "assets/audio/gradientadata06.m4a",
  "assets/audio/gradientadata07.m4a",
  "assets/audio/gradientadata08.m4a"
];

// Clés DOM
const videoEl = document.getElementById("gradient-video");
const fallbackEl = document.getElementById("gradient-fallback");
const audioEl = document.getElementById("audio-pad");
const playButton = document.getElementById("play-button");
const infoToggle = document.getElementById("info-toggle");
const statementEl = document.getElementById("statement");
const sleepMessageEl = document.getElementById("sleep-message");

// Sélection quotidienne (via localStorage)
const STORAGE_KEY = "mirageCentersDailySelection";

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function loadDailySelection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayKey();

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today && typeof parsed.index === "number") {
        return parsed.index;
      }
    }

    const index = Math.floor(Math.random() * VIDEO_PATHS.length);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, index }));
    return index;
  } catch (e) {
    console.warn("Daily selection storage failed:", e);
    return Math.floor(Math.random() * VIDEO_PATHS.length);
  }
}

// Sleep mode : uniquement entre 2h et 6h du matin (heure locale du navigateur)
function isSleepTime(now = new Date()) {
  const hour = now.getHours(); // 0–23, heure locale[web:302]
  return (hour >= 2 && hour < 6);
}

function setSleepMode(active) {
  if (active) {
    // Sleep : bouton désactivé, panneau sleep visible, aucun média chargé
    playButton.disabled = true;
    playButton.textContent = "Sleep mode";
    sleepMessageEl.classList.remove("hidden");
    statementEl.classList.add("hidden");
    videoEl.removeAttribute("src");
    audioEl.removeAttribute("src");
  } else {
    // Online
    playButton.disabled = false;
    playButton.textContent = "Play";
    sleepMessageEl.classList.add("hidden");
    statementEl.classList.remove("hidden");
  }
}

// --- Initialisation ---

let selectedIndex = null;

document.addEventListener("DOMContentLoaded", () => {
  const sleep = isSleepTime(new Date());
  setSleepMode(sleep);

  selectedIndex = loadDailySelection();

  // Bouton Info : cacher / montrer le cartel
  infoToggle.addEventListener("click", () => {
    const isHidden = statementEl.classList.contains("hidden");
    if (isHidden) {
      statementEl.classList.remove("hidden");
      infoToggle.setAttribute("aria-expanded", "true");
    } else {
      statementEl.classList.add("hidden");
      infoToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Bouton Play : lancer vidéo + audio (si pas en sleep)
  playButton.addEventListener("click", async () => {
    // Sécurité : ne rien faire si sleep est actif au moment du clic
    if (isSleepTime(new Date())) {
      setSleepMode(true);
      return;
    }

    if (selectedIndex == null) {
      selectedIndex = loadDailySelection();
    }

    const videoSrc = VIDEO_PATHS[selectedIndex];
    const audioSrc = AUDIO_PATHS[selectedIndex];

    // Assigner les sources au moment du Play
    videoEl.src = videoSrc;
    videoEl.load();

    audioEl.src = audioSrc;
    audioEl.load();

    // Masquer le fallback dès que la vidéo joue
    videoEl.addEventListener("playing", () => {
      if (fallbackEl) {
        fallbackEl.style.display = "none";
      }
    }, { once: true });

    try {
      await videoEl.play();
      await audioEl.play();
      playButton.textContent = "Playing";
    } catch (err) {
      console.error("Playback failed:", err);
      playButton.textContent = "Play";
    }
  });
});
