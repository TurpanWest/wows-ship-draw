import { SHIPS_DATA } from "./ships.js";

const translations = {
  en: {
    title: "Ship Drawer",
    placeholder: "Ship Name",
    addShip: "Add Ship",
    resetDefault: "Reset to Default",
    excludeCV: "Exclude CV",
    excludeSS: "Exclude SS",
    drawShip: "Draw a Ship",
    noShipsMessage: "No eligible ships available for drawing",
    drawResult: "You get: {name} ({type})"
  },
  zh: {
    title: "舰船抽选器",
    placeholder: "舰船名称",
    addShip: "添加舰船",
    resetDefault: "恢复默认",
    excludeCV: "排除 CV",
    excludeSS: "排除 SS",
    drawShip: "抽一艘舰船",
    noShipsMessage: "没有符合条件的舰船可供抽选",
    drawResult: "你抽中了：{name}（{type}）"
  }
};

let currentLanguage = localStorage.getItem("language") || "en";
let ships = [];

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
}

function renderList() {
  const container = document.getElementById("ship-list");
  container.innerHTML = "";
  ships.forEach((ship, idx) => {
    const div = document.createElement("div");
    div.className = "ship-item";
    div.innerHTML =
      "<div class='ship-left'>" +
      "<input type='checkbox' id='ship-" +
      idx +
      "' checked>" +
      "<span>" +
      ship.name +
      "</span>" +
      "<span class='type-label'>" +
      ship.type +
      "</span>" +
      "</div>" +
      "<button class='delete-btn' onclick='removeShip(" +
      idx +
      ")'>❌</button>";
    container.appendChild(div);
  });
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
  if (selected.length === 0) {
    resultDiv.innerText = t.noShipsMessage;
    return;
  }
  const chosen = selected[Math.floor(Math.random() * selected.length)];
  resultDiv.innerText = t.drawResult
    .replace("{name}", chosen.name)
    .replace("{type}", chosen.type);
}

initializeShips();
switchLanguage(currentLanguage);
renderList();

window.switchLanguage = switchLanguage;
window.addShip = addShip;
window.removeShip = removeShip;
window.resetToDefault = resetToDefault;
window.drawShip = drawShip;
