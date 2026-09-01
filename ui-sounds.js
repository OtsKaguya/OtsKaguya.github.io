(() => {
  const storageKey = "memory-games-sound-enabled";
  const channelName = "memory-games-audio";
  const tabId = `${Date.now()}-${Math.random()}`;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioChannel = typeof BroadcastChannel === "function"
    ? new BroadcastChannel(channelName)
    : null;
  let effectAudioContext = null;
  let soundEnabled = true;
  let backgroundMusic = null;

  try {
    soundEnabled = window.localStorage.getItem(storageKey) !== "false";
  } catch {
    soundEnabled = true;
  }

  function stopBackgroundMusic() {
    if (backgroundMusic) backgroundMusic.pause();
  }

  function playButtonSound(force = false) {
    if ((!soundEnabled && !force) || !AudioContextClass) return;

    if (!effectAudioContext) effectAudioContext = new AudioContextClass();
    if (effectAudioContext.state === "suspended") {
      effectAudioContext.resume().catch(() => {});
    }

    const now = effectAudioContext.currentTime;
    const oscillator = effectAudioContext.createOscillator();
    const gain = effectAudioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(720, now);
    oscillator.frequency.exponentialRampToValueAtTime(960, now + 0.045);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    oscillator.connect(gain);
    gain.connect(effectAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  function startBackgroundMusic() {
    if (!soundEnabled || document.hidden) return;

    if (!backgroundMusic) {
      backgroundMusic = new Audio("assets/audio/whispers-of-the-harp.mp3");
      backgroundMusic.loop = true;
      backgroundMusic.preload = "auto";
      backgroundMusic.volume = 0.02;
    }

    audioChannel?.postMessage({ type: "music-start", source: tabId });
    backgroundMusic.play().catch(() => {
    });
  }

  function updateSoundButtons() {
    document.querySelectorAll("[data-sound-toggle]").forEach((button) => {
      button.classList.toggle("is-muted", !soundEnabled);
      button.setAttribute("aria-pressed", String(soundEnabled));
      button.setAttribute("aria-label", soundEnabled ? "Выключить звук" : "Включить звук");
      button.title = soundEnabled ? "Выключить звук" : "Включить звук";
    });
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      startBackgroundMusic();
      const control = event.target.closest("button, a");
      if (control && !control.matches("[data-sound-toggle]")) playButtonSound();
    },
    true,
  );

  document.addEventListener("click", (event) => {
    const soundButton = event.target.closest("[data-sound-toggle]");
    if (soundButton) {
      soundEnabled = !soundEnabled;
      try {
        window.localStorage.setItem(storageKey, String(soundEnabled));
      } catch {
      }
      updateSoundButtons();
      if (soundEnabled) {
        startBackgroundMusic();
      } else {
        stopBackgroundMusic();
        audioChannel?.postMessage({ type: "sound-off", source: tabId });
      }
      playButtonSound(true);
      return;
    }

    if (event.detail === 0 && event.target.closest("button, a")) {
      playButtonSound();
    }
  });

  audioChannel?.addEventListener("message", (event) => {
    if (event.data?.source === tabId) return;

    if (event.data?.type === "music-start") {
      stopBackgroundMusic();
    }

    if (event.data?.type === "sound-off") {
      soundEnabled = false;
      stopBackgroundMusic();
      updateSoundButtons();
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey) return;
    soundEnabled = event.newValue !== "false";
    if (!soundEnabled) stopBackgroundMusic();
    updateSoundButtons();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopBackgroundMusic();
  });

  window.addEventListener("pagehide", stopBackgroundMusic);

  updateSoundButtons();
})();
