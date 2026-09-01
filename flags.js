const FLAG_LEVELS = {
  1: [
    ["ru", "Россия"], ["us", "США", "Соединённые Штаты", "Соединённые Штаты Америки"],
    ["ca", "Канада"], ["mx", "Мексика"], ["br", "Бразилия"], ["ar", "Аргентина"],
    ["cl", "Чили"], ["gb", "Великобритания", "Соединённое Королевство", "Англия"],
    ["ie", "Ирландия"], ["fr", "Франция"], ["de", "Германия"], ["es", "Испания"],
    ["pt", "Португалия"], ["it", "Италия"], ["nl", "Нидерланды", "Голландия"],
    ["be", "Бельгия"], ["ch", "Швейцария"], ["at", "Австрия"], ["pl", "Польша"],
    ["cz", "Чехия"], ["hu", "Венгрия"], ["ro", "Румыния"],
    ["bg", "Болгария"], ["gr", "Греция"], ["tr", "Турция"], ["ua", "Украина"],
    ["by", "Беларусь", "Белоруссия"], ["se", "Швеция"], ["no", "Норвегия"],
    ["fi", "Финляндия"], ["dk", "Дания"], ["is", "Исландия"], ["jp", "Япония"],
    ["cn", "Китай"], ["in", "Индия"], ["kr", "Южная Корея", "Республика Корея", "Корея"],
    ["th", "Таиланд"], ["vn", "Вьетнам"], ["id", "Индонезия"], ["au", "Австралия"],
    ["nz", "Новая Зеландия"], ["eg", "Египет"], ["za", "Южная Африка", "ЮАР"],
    ["ma", "Марокко"], ["sa", "Саудовская Аравия"],
    ["ae", "ОАЭ", "Объединённые Арабские Эмираты"], ["il", "Израиль"],
    ["kz", "Казахстан"], ["ge", "Грузия"], ["rs", "Сербия"],
  ],
  2: [
    ["pe", "Перу"], ["sk", "Словакия"], ["dz", "Алжир"],
    ["uz", "Узбекистан"], ["kg", "Кыргызстан", "Киргизия"],
    ["tj", "Таджикистан"], ["tm", "Туркменистан"],
    ["am", "Армения"], ["az", "Азербайджан"], ["md", "Молдова", "Молдавия"],
    ["hr", "Хорватия"], ["si", "Словения"],
    ["ba", "Босния и Герцеговина"], ["me", "Черногория"],
    ["mk", "Северная Македония", "Македония"], ["al", "Албания"],
    ["lt", "Литва"], ["lv", "Латвия"], ["ee", "Эстония"], ["lu", "Люксембург"],
    ["mt", "Мальта"], ["cy", "Кипр"], ["qa", "Катар"], ["kw", "Кувейт"],
    ["jo", "Иордания"], ["lb", "Ливан"], ["iq", "Ирак"], ["ir", "Иран"],
    ["pk", "Пакистан"], ["bd", "Бангладеш"], ["lk", "Шри-Ланка", "Шри Ланка"],
    ["np", "Непал"], ["mn", "Монголия"], ["my", "Малайзия"], ["sg", "Сингапур"],
    ["ph", "Филиппины"], ["kh", "Камбоджа"], ["la", "Лаос"], ["mm", "Мьянма", "Бирма"],
    ["af", "Афганистан"], ["et", "Эфиопия"], ["ke", "Кения"], ["tz", "Танзания"],
    ["ng", "Нигерия"], ["gh", "Гана"], ["sn", "Сенегал"], ["cm", "Камерун"],
    ["co", "Колумбия"], ["ve", "Венесуэла"], ["cu", "Куба"],
  ],
};

const screens = {
  home: document.querySelector("#game-home-screen"),
  settings: document.querySelector("#settings-screen"),
  memory: document.querySelector("#memory-screen"),
  answer: document.querySelector("#answer-screen"),
  result: document.querySelector("#result-screen"),
};

const settingsForm = document.querySelector("#settings-form");
const flagCountInput = document.querySelector("#flag-count");
const voiceSetting = document.querySelector("#voice-setting");
const studyProgress = document.querySelector("#study-progress");
const quizProgress = document.querySelector("#quiz-progress");
const studyFlag = document.querySelector("#study-flag");
const quizFlag = document.querySelector("#quiz-flag");
const answerForm = document.querySelector("#answer-form");
const answerInput = document.querySelector("#answer-input");
const flagFeedback = document.querySelector("#flag-feedback");
const checkAnswerButton = document.querySelector("#check-answer-button");
const nextFlagButton = document.querySelector("#next-flag-button");
const scoreValue = document.querySelector("#score-value");
const scoreTotal = document.querySelector("#score-total");
const flagResults = document.querySelector("#flag-results");
const restartButton = document.querySelector("#restart-button");
const settingsButton = document.querySelector("#settings-button");
const quickStartButton = document.querySelector("#quick-start-button");
const openSettingsButton = document.querySelector("#open-settings-button");
const openModesButton = document.querySelector("#open-modes-button");

let level = 1;
let flagCount = 5;
let studySequence = [];
let quizSequence = [];
let studyIndex = 0;
let quizIndex = 0;
let answers = [];
let studyTimerId = null;
let activeAudio = null;

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function shuffleInNewOrder(items) {
  const result = shuffle(items);
  const orderDidNotChange = result.every((item, index) => item.code === items[index].code);

  if (result.length > 1 && orderDidNotChange) {
    result.push(result.shift());
  }

  return result;
}

function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .replaceAll("ё", "е")
    .replaceAll("й", "и")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function showScreen(screenName) {
  document.body.dataset.screen = screenName;
  Object.entries(screens).forEach(([name, element]) => {
    element.hidden = name !== screenName;
  });
}

function renderFlag(element, flag, showName) {
  element.innerHTML = "";
  const image = document.createElement("img");
  image.src = `https://flagcdn.com/w320/${flag.code}.png`;
  image.alt = `Флаг: ${showName ? flag.name : "название скрыто"}`;
  image.width = 320;
  image.height = 213;
  element.append(image);

  if (showName) {
    const name = document.createElement("strong");
    name.textContent = flag.name;
    element.append(name);
  }
}

function stopAudio() {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

function playCountryRecording(name) {
  stopAudio();
  if (!voiceSetting.checked || !window.SMART_LMS_AUDIO) return;

  const config = window.SMART_LMS_AUDIO;
  const path = `${config.countriesFolder}/${encodeURIComponent(name)}.${config.extension}`;
  const audio = new Audio(path);
  activeAudio = audio;
  audio.addEventListener("ended", () => {
    if (activeAudio === audio) activeAudio = null;
  }, { once: true });
  audio.play().catch(() => {
    if (activeAudio === audio) activeAudio = null;
  });
}

function showStudyFlag() {
  const flag = studySequence[studyIndex];
  studyProgress.textContent = `${studyIndex + 1} из ${studySequence.length}`;
  renderFlag(studyFlag, flag, true);
  playCountryRecording(flag.name);
}

function startQuiz() {
  window.clearInterval(studyTimerId);
  stopAudio();
  quizSequence = shuffleInNewOrder(studySequence);
  quizIndex = 0;
  answers = [];
  showScreen("answer");
  showQuizFlag();
}

function showQuizFlag() {
  const flag = quizSequence[quizIndex];
  quizProgress.textContent = `${quizIndex + 1} из ${quizSequence.length}`;
  renderFlag(quizFlag, flag, false);
  answerInput.value = "";
  answerInput.disabled = false;
  flagFeedback.hidden = true;
  checkAnswerButton.hidden = false;
  nextFlagButton.hidden = true;
  answerInput.focus();
}

function startGame() {
  window.clearInterval(studyTimerId);
  stopAudio();
  const source = FLAG_LEVELS[level].map(([code, name, ...aliases]) => ({ code, name, aliases }));
  studySequence = shuffle(source).slice(0, flagCount);
  quizSequence = [];
  studyIndex = 0;
  showScreen("memory");
  showStudyFlag();

  studyTimerId = window.setInterval(() => {
    studyIndex += 1;

    if (studyIndex >= studySequence.length) {
      startQuiz();
      return;
    }

    showStudyFlag();
  }, 1000);
}

function isCorrectName(answer, flag) {
  const validNames = [flag.name, ...flag.aliases].map(normalizeName);
  return validNames.includes(normalizeName(answer));
}

function finishGame() {
  const score = answers.filter((answer) => answer.correct).length;
  scoreValue.textContent = score;
  scoreTotal.textContent = quizSequence.length;
  flagResults.innerHTML = "";

  answers.forEach((answer, index) => {
    const flag = quizSequence[index];
    const row = document.createElement("div");
    row.className = `flag-result ${answer.correct ? "item--correct" : "item--mistake"}`;

    const image = document.createElement("img");
    image.src = `https://flagcdn.com/w80/${flag.code}.png`;
    image.alt = `Флаг ${flag.name}`;
    image.width = 80;
    image.height = 53;

    const text = document.createElement("span");
    const correctName = document.createElement("strong");
    const userName = document.createElement("small");
    correctName.textContent = flag.name;
    userName.textContent = `Твой ответ: ${answer.text || "—"}`;
    text.append(correctName, userName);
    row.append(image, text);
    flagResults.append(row);
  });

  showScreen("result");
}

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  level = Number(new FormData(settingsForm).get("level"));
  flagCount = Number(flagCountInput.value);
  startGame();
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const flag = quizSequence[quizIndex];
  const text = answerInput.value.trim();
  const correct = isCorrectName(text, flag);
  answers.push({ text, correct });

  answerInput.disabled = true;
  checkAnswerButton.hidden = true;
  nextFlagButton.hidden = false;
  flagFeedback.hidden = false;
  flagFeedback.className = `flag-feedback ${correct ? "feedback--correct" : "feedback--mistake"}`;
  flagFeedback.textContent = correct ? "Правильно." : `Неправильно. Правильный ответ: ${flag.name}.`;
});

nextFlagButton.addEventListener("click", () => {
  quizIndex += 1;

  if (quizIndex >= quizSequence.length) {
    finishGame();
    return;
  }

  showQuizFlag();
});

restartButton.addEventListener("click", startGame);
settingsButton.addEventListener("click", () => showScreen("settings"));
quickStartButton.addEventListener("click", startGame);
openSettingsButton.addEventListener("click", () => showScreen("settings"));
openModesButton.addEventListener("click", () => showScreen("settings"));