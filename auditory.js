const WORD_COUNT = 10;

const WORDS = [
  "дерево", "стол", "кошка", "ручка", "машина", "дом", "окно", "книга",
  "мяч", "солнце", "река", "чашка", "яблоко", "цветок", "собака", "школа",
  "облако", "ложка", "птица", "дорога", "лампа", "дверь", "часы", "море",
  "груша", "стул", "тетрадь", "рыба", "трава", "поезд", "шапка", "карандаш",
  "снег", "тарелка", "кровать", "велосипед", "звезда", "лес", "телефон", "рюкзак",
  "хлеб", "мышка", "лиса", "корабль", "банан", "зеркало", "чайник", "куртка",
  "самолёт", "колокол", "бабочка", "свеча", "арбуз", "щётка", "диван", "гора",
];

const screens = {
  home: document.querySelector("#game-home-screen"),
  settings: document.querySelector("#settings-screen"),
  memory: document.querySelector("#memory-screen"),
  answer: document.querySelector("#answer-screen"),
  result: document.querySelector("#result-screen"),
};

const settingsForm = document.querySelector("#settings-form");
const voiceSetting = document.querySelector("#voice-setting");
const timerValue = document.querySelector("#timer-value");
const memoryWords = document.querySelector("#memory-words");
const answerForm = document.querySelector("#answer-form");
const answerInputs = Array.from(document.querySelectorAll(".word-answer-input"));
const answerError = document.querySelector("#answer-error");
const correctWords = document.querySelector("#correct-words");
const userWords = document.querySelector("#user-words");
const scoreValue = document.querySelector("#score-value");
const restartButton = document.querySelector("#restart-button");
const settingsButton = document.querySelector("#settings-button");
const quickStartButton = document.querySelector("#quick-start-button");
const openSettingsButton = document.querySelector("#open-settings-button");
const openModesButton = document.querySelector("#open-modes-button");

let duration = 30;
let sequence = [];
let timerId = null;
let activeAudio = null;
let audioPlaybackId = 0;

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function normalizeWord(word) {
  return word.trim().toLowerCase().replaceAll("ё", "е");
}

function showScreen(screenName) {
  document.body.dataset.screen = screenName;
  Object.entries(screens).forEach(([name, element]) => {
    element.hidden = name !== screenName;
  });
}

function renderWords(element, words, checkAgainst = null) {
  element.innerHTML = "";

  for (let index = 0; index < WORD_COUNT; index += 1) {
    const item = document.createElement("li");
    const word = words[index];
    item.textContent = word ?? "—";

    if (checkAgainst) {
      const isCorrect = normalizeWord(word ?? "") === normalizeWord(checkAgainst[index]);
      item.classList.add(isCorrect ? "item--correct" : "item--mistake");
    }

    element.append(item);
  }
}

function stopAudio() {
  audioPlaybackId += 1;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
}

function getWordAudioPath(word) {
  const config = window.SMART_LMS_AUDIO;
  return `${config.wordsFolder}/${encodeURIComponent(word)}.${config.extension}`;
}

function playWordRecordings(words) {
  if (!voiceSetting.checked || !window.SMART_LMS_AUDIO) return;

  stopAudio();
  const playbackId = audioPlaybackId;
  let wordIndex = 0;

  function playNext() {
    if (playbackId !== audioPlaybackId || wordIndex >= words.length) return;

    const audio = new Audio(getWordAudioPath(words[wordIndex]));
    let finished = false;
    activeAudio = audio;

    function finishCurrent() {
      if (finished) return;
      finished = true;
      if (activeAudio === audio) activeAudio = null;
      wordIndex += 1;
      playNext();
    }

    audio.addEventListener("ended", finishCurrent, { once: true });
    audio.addEventListener("error", finishCurrent, { once: true });
    audio.play().catch(finishCurrent);
  }

  playNext();
}

function startGame() {
  window.clearInterval(timerId);
  stopAudio();
  sequence = shuffle(WORDS).slice(0, WORD_COUNT);
  answerInputs.forEach((input) => {
    input.value = "";
  });
  answerError.hidden = true;
  renderWords(memoryWords, sequence);
  showScreen("memory");
  playWordRecordings(sequence);

  let secondsLeft = duration;
  timerValue.textContent = secondsLeft;

  timerId = window.setInterval(() => {
    secondsLeft -= 1;
    timerValue.textContent = secondsLeft;

    if (secondsLeft <= 0) {
      window.clearInterval(timerId);
      stopAudio();
      showScreen("answer");
      answerInputs[0].focus();
    }
  }, 1000);
}

function countCorrectBeforeFirstMistake(userAnswer) {
  let score = 0;

  for (let index = 0; index < WORD_COUNT; index += 1) {
    if (normalizeWord(userAnswer[index] ?? "") !== normalizeWord(sequence[index])) break;
    score += 1;
  }

  return score;
}

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  duration = Number(new FormData(settingsForm).get("duration"));
  startGame();
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userAnswer = answerInputs.map((input) => input.value.trim());

  if (userAnswer.every((word) => word === "")) {
    answerError.textContent = "Введите хотя бы одно слово.";
    answerError.hidden = false;
    return;
  }

  scoreValue.textContent = countCorrectBeforeFirstMistake(userAnswer);
  renderWords(correctWords, sequence);
  renderWords(userWords, userAnswer, sequence);
  showScreen("result");
});

answerInputs.forEach((input) => {
  input.addEventListener("input", () => {
    answerError.hidden = true;
  });
});

restartButton.addEventListener("click", startGame);
settingsButton.addEventListener("click", () => showScreen("settings"));
quickStartButton.addEventListener("click", startGame);
openSettingsButton.addEventListener("click", () => showScreen("settings"));
openModesButton.addEventListener("click", () => showScreen("settings"));