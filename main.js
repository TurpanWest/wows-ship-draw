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
  },
};

const HISTORY_MAX = 5;

let currentLanguage = localStorage.getItem("language") || "en";
let ships = [];
let drawHistory = [];

function initializeShips() {
  const savedShips = localStorage.getItem("shipListV2");
  if (savedShips) {
    ships = JSON.parse(savedShips);
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
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  updateUIText();
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  document.getElementById("lang-zh").classList.toggle("active", lang === "zh");
  const savedShips = localStorage.getItem("shipListV2");
  if (!savedShips) {
    ships = SHIPS_DATA[currentLanguage].slice();
    renderList();
  }
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
  updateRosterCount();
  // Reset result to standby on language change
  const r = document.getElementById("result");
  if (!r.dataset.drawn) {
    r.textContent = t.standby;
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
    return document.getElementById("ship-" + idx)?.checked;
  });
  const resultDiv = document.getElementById("result");
  const t = translations[currentLanguage];

  // Re-trigger stamp animation
  resultDiv.classList.remove("result-stamp");
  void resultDiv.offsetWidth;
  resultDiv.classList.add("result-stamp");

  if (selected.length === 0) {
    resultDiv.textContent = t.noShipsMessage;
    resultDiv.dataset.drawn = "1";
    return;
  }
  const chosen = selected[Math.floor(Math.random() * selected.length)];
  resultDiv.textContent = t.drawResult
    .replace("{name}", chosen.name)
    .replace("{type}", chosen.type);
  resultDiv.dataset.drawn = "1";
  pushHistory(chosen);
}

initializeShips();
loadHistory();
switchLanguage(currentLanguage);
renderList();
renderHistory();

window.switchLanguage = switchLanguage;
window.addShip = addShip;
window.removeShip = removeShip;
window.resetToDefault = resetToDefault;
window.drawShip = drawShip;
