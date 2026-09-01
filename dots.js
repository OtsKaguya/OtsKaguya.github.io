const LEVELS = {
  1: { size: 3, dotCount: 3, colors: ["red", "blue", "green"] },
  2: { size: 4, dotCount: 4, colors: ["red", "blue", "green", "yellow"] },
  3: { size: 5, dotCount: 5, colors: ["red", "blue", "green", "yellow"] },
};

const COLOR_NAMES = {
  red: "Красный",
  blue: "Синий",
  green: "Зелёный",
  yellow: "Жёлтый",
};

const screens = {
  home: document.querySelector("#game-home-screen"),
  settings: document.querySelector("#settings-screen"),
  memory: document.querySelector("#memory-screen"),
  answer: document.querySelector("#answer-screen"),
  result: document.querySelector("#result-screen"),
};

const settingsForm = document.querySelector("#settings-form");
const memoryBoard = document.querySelector("#memory-board");
const answerBoard = document.querySelector("#answer-board");
const correctBoard = document.querySelector("#correct-board");
const userBoard = document.querySelector("#user-board");
const colorPalette = document.querySelector("#color-palette");
const checkButton = document.querySelector("#check-button");
const resultTitle = document.querySelector("#result-title");
const restartButton = document.querySelector("#restart-button");
const settingsButton = document.querySelector("#settings-button");
const quickStartButton = document.querySelector("#quick-start-button");
const openSettingsButton = document.querySelector("#open-settings-button");
const openModesButton = document.querySelector("#open-modes-button");
const dotsTimerValue = document.querySelector("#dots-timer-value");

let level = 1;
let duration = 0.5;
let correctCells = [];
let userCells = [];
let selectedColor = "red";
let showTimerId = null;

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showScreen(screenName) {
  document.body.dataset.screen = screenName;
  Object.entries(screens).forEach(([name, element]) => {
    element.hidden = name !== screenName;
  });
}

function createCard(config) {
  const cells = Array(config.size * config.size).fill(null);
  const freeIndexes = Array.from({ length: cells.length }, (_, index) => index);

  for (let dot = 0; dot < config.dotCount; dot += 1) {
    const randomFreeIndex = randomInteger(0, freeIndexes.length - 1);
    const cellIndex = freeIndexes.splice(randomFreeIndex, 1)[0];
    const color = config.colors[randomInteger(0, config.colors.length - 1)];
    cells[cellIndex] = color;
  }

  return cells;
}

function createDot(color) {
  const dot = document.createElement("span");
  dot.className = `dot dot--${color}`;
  dot.setAttribute("aria-label", COLOR_NAMES[color]);
  return dot;
}

function renderBoard(element, cells, options = {}) {
  const { interactive = false, compareWith = null } = options;
  const size = LEVELS[level].size;
  element.innerHTML = "";
  element.style.setProperty("--board-size", size);

  cells.forEach((color, index) => {
    const cell = document.createElement(interactive ? "button" : "div");
    cell.className = "dot-cell";

    if (color) cell.append(createDot(color));

    if (compareWith && color !== compareWith[index]) {
      cell.classList.add("dot-cell--mistake");
    }

    if (interactive) {
      cell.type = "button";
      cell.setAttribute("aria-label", `Клетка ${index + 1}`);
      cell.addEventListener("click", () => {
        userCells[index] = selectedColor;
        renderBoard(answerBoard, userCells, { interactive: true });
      });
    }

    element.append(cell);
  });
}

function renderPalette() {
  const config = LEVELS[level];
  colorPalette.innerHTML = "";

  config.colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = selectedColor === color ? "is-selected" : "";
    button.append(createDot(color), document.createTextNode(COLOR_NAMES[color]));
    button.addEventListener("click", () => {
      selectedColor = color;
      renderPalette();
    });
    colorPalette.append(button);
  });

  const eraseButton = document.createElement("button");
  eraseButton.type = "button";
  eraseButton.className = selectedColor === null ? "is-selected" : "";
  eraseButton.textContent = "Очистить клетку";
  eraseButton.addEventListener("click", () => {
    selectedColor = null;
    renderPalette();
  });
  colorPalette.append(eraseButton);
}

function startGame() {
  window.clearTimeout(showTimerId);
  const config = LEVELS[level];
  selectedColor = config.colors[0];
  correctCells = createCard(config);
  userCells = Array(config.size * config.size).fill(null);
  dotsTimerValue.textContent = String(duration).replace(".", ",");
  renderBoard(memoryBoard, correctCells);
  showScreen("memory");

  showTimerId = window.setTimeout(() => {
    renderPalette();
    renderBoard(answerBoard, userCells, { interactive: true });
    showScreen("answer");
  }, duration * 1000);
}

function checkAnswer() {
  const isCorrect = correctCells.every((color, index) => color === userCells[index]);
  resultTitle.textContent = isCorrect
    ? "Задание выполнено правильно."
    : "Задание выполнено неправильно.";
  renderBoard(correctBoard, correctCells);
  renderBoard(userBoard, userCells, { compareWith: correctCells });
  showScreen("result");
}

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(settingsForm);
  level = Number(formData.get("level"));
  duration = Number(formData.get("duration"));
  startGame();
});

checkButton.addEventListener("click", checkAnswer);
restartButton.addEventListener("click", startGame);
settingsButton.addEventListener("click", () => showScreen("settings"));
quickStartButton.addEventListener("click", startGame);
openSettingsButton.addEventListener("click", () => showScreen("settings"));
openModesButton.addEventListener("click", () => showScreen("settings"));