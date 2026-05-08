import { SHIPS_DATA } from "./ships.js";

const translations = {
  en: {
    title: "Ship Drawer",
    placeholder: "Ship Name",
    addShip: "Add",
    resetDefault: "Reset",
    excludeCV: "Exclude CV",
    excludeSS: "Exclude SS",
    drawShip: "Draw a Ship",
    noShipsMessage: "No eligible ships available for drawing",
    drawResult: "{name}\nCLASS · {type}",
    standby: "— STANDBY —",
    filtersLabel: "FILTERS",
    rosterLabel: "FLEET",
    addLabel: "ADD TO FLEET",
    historyLabel: "HISTORY",
    countSuffix: "SHIPS",
    modeLabel: "MODE",
    goalAny: "ALL",
    goalWin: "WIN",
    goalEasy: "OP",
    goalFun: "FUN",
    goalTrash: "TRASH",
  },
  zh: {
    title: "舰船抽选器",
    placeholder: "舰船名称",
    addShip: "添加",
    resetDefault: "重置",
    excludeCV: "不玩 CV",
    excludeSS: "不玩 SS",
    drawShip: "开抽",
    noShipsMessage: "没有符合条件的舰船可供抽选",
    drawResult: "{name}\n舰种 · {type}",
    standby: "— 待命 —",
    filtersLabel: "筛选",
    rosterLabel: "舰队",
    addLabel: "添加舰船",
    historyLabel: "历史",
    countSuffix: "艘",
    modeLabel: "模式",
    goalAny: "全部",
    goalWin: "想赢",
    goalEasy: "轮椅",
    goalFun: "开心",
    goalTrash: "烂船",
  },
};

const GOAL_TAGS = ["winning", "easy", "fun", "trash"];

const HISTORY_MAX = 5;

// Build EN<->ZH name maps from the parallel SHIPS_DATA arrays.
// Custom (user-added) ships won't appear in either map and are left as-is.
const NAME_MAPS = (() => {
  const en2zh = Object.create(null);
  const zh2en = Object.create(null);
  const en = SHIPS_DATA.en;
  const zh = SHIPS_DATA.zh;
  const len = Math.min(en.length, zh.length);
  for (let i = 0; i < len; i++) {
    en2zh[en[i].name] = zh[i].name;
    zh2en[zh[i].name] = en[i].name;
  }
  return { en2zh, zh2en };
})();

function translateName(name, toLang) {
  if (toLang === "zh") return NAME_MAPS.en2zh[name] || name;
  if (toLang === "en") return NAME_MAPS.zh2en[name] || name;
  return name;
}

let currentLanguage = localStorage.getItem("language") || "en";
let currentTheme = localStorage.getItem("theme") === "dark" ? "dark" : "light";

function applyTheme(theme) {
  currentTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem("theme", currentTheme);
  const icon = document.getElementById("theme-icon");
  if (icon) icon.textContent = currentTheme === "dark" ? "☀" : "☾";
}

function toggleTheme() {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}
let currentGoal = localStorage.getItem("goalV1");
if (!GOAL_TAGS.includes(currentGoal)) currentGoal = null;
let ships = [];
let drawHistory = [];
let lastDrawn = null;

function initializeShips() {
  const savedShips = localStorage.getItem("shipListV2");
  if (savedShips) {
    ships = JSON.parse(savedShips);
    // Backfill tags for rosters saved before tags existed.
    // Custom user-added ships won't be found and remain tagless.
    const tagByName = Object.create(null);
    SHIPS_DATA[currentLanguage].forEach((s) => {
      if (s.tags) tagByName[s.name] = s.tags;
    });
    ships.forEach((s) => {
      if (!s.tags && tagByName[s.name]) s.tags = tagByName[s.name];
    });
  } else {
    ships = SHIPS_DATA[currentLanguage].slice();
  }
}

function saveState() {
  localStorage.setItem("shipListV2", JSON.stringify(ships));
}

function loadHistory() {
  const saved = localStorage.getItem("drawHistoryV1");
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) drawHistory = parsed.slice(0, HISTORY_MAX);
  } catch {
    drawHistory = [];
  }
}

function saveHistory() {
  localStorage.setItem("drawHistoryV1", JSON.stringify(drawHistory));
}

function pushHistory(ship) {
  drawHistory.unshift({ name: ship.name, type: ship.type });
  if (drawHistory.length > HISTORY_MAX) drawHistory.length = HISTORY_MAX;
  saveHistory();
  renderHistory();
}

function renderHistory() {
  const section = document.getElementById("history");
  const list = document.getElementById("history-list");
  const count = document.getElementById("history-count");
  if (!drawHistory.length) {
    section.hidden = true;
    list.innerHTML = "";
    return;
  }
  section.hidden = false;
  count.textContent = drawHistory.length + " / " + HISTORY_MAX;
  list.innerHTML = "";
  drawHistory.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.innerHTML =
      "<span class='history__index'>" +
      String(idx + 1).padStart(2, "0") +
      "</span>" +
      "<span class='history__name'>" + escapeHTML(entry.name) + "</span>" +
      "<span class='type-label' data-type='" + escapeHTML(entry.type) + "'>" +
      escapeHTML(entry.type) +
      "</span>";
    list.appendChild(li);
  });
}

function switchLanguage(lang) {
  const previousLang = currentLanguage;
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

  if (lang !== previousLang) {
    ships = ships.map((s) => ({ name: translateName(s.name, lang), type: s.type, tags: s.tags }));
    drawHistory = drawHistory.map((h) => ({ name: translateName(h.name, lang), type: h.type }));
    if (lastDrawn) lastDrawn.name = translateName(lastDrawn.name, lang);
    saveState();
    saveHistory();
    renderList();
    renderHistory();
  }

  updateUIText();
  renderResult();
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  document.getElementById("lang-zh").classList.toggle("active", lang === "zh");
}

function renderResult() {
  const resultDiv = document.getElementById("result");
  const t = translations[currentLanguage];
  if (!lastDrawn) {
    resultDiv.textContent = t.standby;
    delete resultDiv.dataset.drawn;
    return;
  }
  resultDiv.textContent = t.drawResult
    .replace("{name}", lastDrawn.name)
    .replace("{type}", lastDrawn.type);
  resultDiv.dataset.drawn = "1";
}

function updateUIText() {
  const t = translations[currentLanguage];
  document.getElementById("title").textContent = t.title;
  document.getElementById("newShipName").placeholder = t.placeholder;
  document.getElementById("add-btn").textContent = t.addShip;
  document.getElementById("reset-btn").textContent = t.resetDefault;
  document.getElementById("exclude-cv-text").textContent = t.excludeCV;
  document.getElementById("exclude-ss-text").textContent = t.excludeSS;
  document.getElementById("draw-btn").textContent = t.drawShip;
  document.getElementById("filters-label").textContent = t.filtersLabel;
  document.getElementById("roster-label").textContent = t.rosterLabel;
  document.getElementById("add-label").textContent = t.addLabel;
  document.getElementById("history-label").textContent = t.historyLabel;
  document.getElementById("mode-label").textContent = t.modeLabel;
  document.getElementById("goal-any").textContent = t.goalAny;
  document.getElementById("goal-winning").textContent = t.goalWin;
  document.getElementById("goal-easy").textContent = t.goalEasy;
  document.getElementById("goal-fun").textContent = t.goalFun;
  document.getElementById("goal-trash").textContent = t.goalTrash;
  updateRosterCount();
}

function setGoal(goal) {
  currentGoal = GOAL_TAGS.includes(goal) ? goal : null;
  if (currentGoal) localStorage.setItem("goalV1", currentGoal);
  else localStorage.removeItem("goalV1");
  updateGoalButtons();
}

function updateGoalButtons() {
  const ids = { any: null, winning: "winning", easy: "easy", fun: "fun", trash: "trash" };
  for (const key in ids) {
    const el = document.getElementById("goal-" + key);
    if (el) el.classList.toggle("active", currentGoal === ids[key]);
  }
}

function updateRosterCount() {
  const t = translations[currentLanguage];
  const el = document.getElementById("roster-count");
  if (el) el.textContent = ships.length + " " + t.countSuffix;
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

function renderList() {
  const container = document.getElementById("ship-list");
  container.innerHTML = "";
  ships.forEach((ship, idx) => {
    const div = document.createElement("div");
    div.className = "ship-item";
    div.style.animationDelay = Math.min(idx * 12, 240) + "ms";
    div.innerHTML =
      "<div class='ship-left'>" +
      "<input type='checkbox' id='ship-" + idx + "' checked>" +
      "<span>" + escapeHTML(ship.name) + "</span>" +
      "<span class='type-label' data-type='" + escapeHTML(ship.type) + "'>" +
      escapeHTML(ship.type) +
      "</span>" +
      "</div>" +
      "<button class='delete-btn' onclick='removeShip(" + idx + ")' aria-label='Remove'>✕</button>";
    container.appendChild(div);
  });
  updateRosterCount();
}

function addShip() {
  const name = document.getElementById("newShipName").value.trim();
  const type = document.getElementById("newShipType").value;
  if (name && !ships.some((s) => s.name === name)) {
    ships.push({ name: name, type: type });
    saveState();
    renderList();
  }
  document.getElementById("newShipName").value = "";
}

function removeShip(index) {
  ships.splice(index, 1);
  saveState();
  renderList();
}

function resetToDefault() {
  ships = SHIPS_DATA[currentLanguage].slice();
  saveState();
  renderList();
}

function drawShip() {
  const excludeCV = document.getElementById("excludeCV").checked;
  const excludeSS = document.getElementById("excludeSS").checked;
  const selected = ships.filter((ship, idx) => {
    if (excludeCV && ship.type === "CV") return false;
    if (excludeSS && ship.type === "SS") return false;
    if (currentGoal && !(ship.tags && ship.tags.includes(currentGoal))) return false;
    return document.getElementById("ship-" + idx)?.checked;
  });
  const resultDiv = document.getElementById("result");
  const t = translations[currentLanguage];

  // Re-trigger stamp animation
  resultDiv.classList.remove("result-stamp");
  void resultDiv.offsetWidth;
  resultDiv.classList.add("result-stamp");

  if (selected.length === 0) {
    lastDrawn = null;
    resultDiv.textContent = t.noShipsMessage;
    resultDiv.dataset.drawn = "1";
    return;
  }
  const chosen = selected[Math.floor(Math.random() * selected.length)];
  lastDrawn = { name: chosen.name, type: chosen.type };
  renderResult();
  pushHistory(chosen);
}

initializeShips();
loadHistory();
applyTheme(currentTheme);
switchLanguage(currentLanguage);
updateGoalButtons();
renderList();
renderHistory();

window.switchLanguage = switchLanguage;
window.addShip = addShip;
window.removeShip = removeShip;
window.resetToDefault = resetToDefault;
window.drawShip = drawShip;
window.setGoal = setGoal;
window.toggleTheme = toggleTheme;
