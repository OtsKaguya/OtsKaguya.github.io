const NUMBER_COUNT = 10;

const screens = {
  home: document.querySelector("#game-home-screen"),
  settings: document.querySelector("#settings-screen"),
  memory: document.querySelector("#memory-screen"),
  answer: document.querySelector("#answer-screen"),
  result: document.querySelector("#result-screen"),
};

const settingsForm = document.querySelector("#settings-form");
const answerForm = document.querySelector("#answer-form");
const answerInput = document.querySelector("#answer-input");
const answerError = document.querySelector("#answer-error");
const timerValue = document.querySelector("#timer-value");
const memoryNumbers = document.querySelector("#memory-numbers");
const correctNumbers = document.querySelector("#correct-numbers");
const userNumbers = document.querySelector("#user-numbers");
const scoreValue = document.querySelector("#score-value");
const resultNote = document.querySelector("#result-note");
const restartButton = document.querySelector("#restart-button");
const settingsButton = document.querySelector("#settings-button");
const keypad = document.querySelector(".keypad");
const quickStartButton = document.querySelector("#quick-start-button");
const openSettingsButton = document.querySelector("#open-settings-button");
const openModesButton = document.querySelector("#open-modes-button");

let level = 1;
let duration = 15;
let sequence = [];
let timerId = null;

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInteger(0, index);
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function createSequence(selectedLevel) {
  if (selectedLevel === 1) {
    return Array.from({ length: NUMBER_COUNT }, () => randomInteger(1, 9));
  }

  if (selectedLevel === 3) {
    return Array.from({ length: NUMBER_COUNT }, () => randomInteger(10, 99));
  }

  const oneDigitNumbers = Array.from(
    { length: NUMBER_COUNT / 2 },
    () => randomInteger(1, 9),
  );
  const twoDigitNumbers = Array.from(
    { length: NUMBER_COUNT / 2 },
    () => randomInteger(10, 99),
  );

  return shuffle([...oneDigitNumbers, ...twoDigitNumbers]);
}

function showScreen(screenName) {
  document.body.dataset.screen = screenName;
  Object.entries(screens).forEach(([name, element]) => {
    element.hidden = name !== screenName;
  });
}

function renderNumberList(element, numbers) {
  element.innerHTML = "";

  for (let index = 0; index < NUMBER_COUNT; index += 1) {
    const item = document.createElement("li");
    item.textContent = numbers[index] ?? "—";
    element.append(item);
  }
}

function renderCheckedAnswer(element, userAnswer) {
  element.innerHTML = "";

  for (let index = 0; index < NUMBER_COUNT; index += 1) {
    const item = document.createElement("li");
    const userNumber = userAnswer[index];
    const isCorrect = userNumber === sequence[index];

    item.textContent = userNumber ?? "—";
    item.classList.add(isCorrect ? "number--correct" : "number--mistake");
    element.append(item);
  }
}

function startGame() {
  window.clearInterval(timerId);
  sequence = createSequence(level);
  answerInput.value = "";
  answerError.hidden = true;
  renderNumberList(memoryNumbers, sequence);
  showScreen("memory");

  let secondsLeft = duration;
  timerValue.textContent = secondsLeft;

  timerId = window.setInterval(() => {
    secondsLeft -= 1;
    timerValue.textContent = secondsLeft;

    if (secondsLeft <= 0) {
      window.clearInterval(timerId);
      showScreen("answer");
      answerInput.focus();
    }
  }, 1000);
}

function parseSeparatedInput(text) {
  return text
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number);
}

function parseContinuousInput(text) {
  const digits = text.replace(/\D/g, "");

  if (level === 1) {
    return digits.split("").map(Number);
  }

  if (level === 3) {
    const answer = [];

    for (let index = 0; index < digits.length; index += 2) {
      answer.push(Number(digits.slice(index, index + 2)));
    }

    return answer;
  }

  const answer = [];
  let position = 0;

  sequence.forEach((number) => {
    const numberLength = String(number).length;
    const part = digits.slice(position, position + numberLength);

    if (part) answer.push(Number(part));
    position += numberLength;
  });

  return answer;
}

function parseAnswer(text) {
  const cleanText = text.trim();
  const hasSeparators = /[\s,;]/.test(cleanText);

  return hasSeparators
    ? parseSeparatedInput(cleanText)
    : parseContinuousInput(cleanText);
}

function countCorrectBeforeFirstMistake(userAnswer) {
  let score = 0;

  for (let index = 0; index < NUMBER_COUNT; index += 1) {
    if (userAnswer[index] !== sequence[index]) break;
    score += 1;
  }

  return score;
}

function showResult(userAnswer) {
  const score = countCorrectBeforeFirstMistake(userAnswer);

  scoreValue.textContent = score;
  renderNumberList(correctNumbers, sequence);
  renderCheckedAnswer(userNumbers, userAnswer);

  resultNote.textContent =
    score === NUMBER_COUNT
      ? "Все числа введены правильно."
      : "Все позиции проверены: правильные отмечены зелёным, неправильные и пустые — красным. Итоговый результат по заданию считается до первой ошибки.";

  showScreen("result");
}

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(settingsForm);
  level = Number(formData.get("level"));
  duration = Number(formData.get("duration"));
  startGame();
});

answerInput.addEventListener("input", () => {
  answerInput.value = answerInput.value.replace(/[^0-9\s,;]/g, "");
  answerError.hidden = true;
});

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const digit = button.dataset.digit;
  const action = button.dataset.action;

  if (digit !== undefined) {
    answerInput.value += digit;
  }

  if (action === "separator") {
    const currentValue = answerInput.value;
    const lastCharacter = currentValue.at(-1);

    if (currentValue && !/[\s,;]/.test(lastCharacter)) {
      answerInput.value += " ";
    }
  }

  if (action === "backspace") {
    answerInput.value = answerInput.value.slice(0, -1);
  }

  answerInput.focus();
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const userAnswer = parseAnswer(answerInput.value);

  if (userAnswer.length === 0) {
    answerError.textContent = "Введите хотя бы одно число.";
    answerError.hidden = false;
    answerInput.focus();
    return;
  }

  showResult(userAnswer);
});

restartButton.addEventListener("click", startGame);

settingsButton.addEventListener("click", () => {
  window.clearInterval(timerId);
  showScreen("settings");
});

quickStartButton.addEventListener("click", startGame);
openSettingsButton.addEventListener("click", () => showScreen("settings"));
openModesButton.addEventListener("click", () => showScreen("settings"));