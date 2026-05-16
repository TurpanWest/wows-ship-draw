import { SHIPS_DATA, NATIONS, TIERS } from "./ships.js";

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
    tierLabel: "TIER",
    nationLabel: "NATION",
    nationAll: "ALL",
    nationNone: "NONE",
    nationUnknown: "Unknown",
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
    tierShort: { 8: "VIII", 9: "IX", 10: "X", 11: "XI" },
    nations: {
      "美国": "USA",
      "苏联": "USSR",
      "德国": "Germany",
      "日本": "Japan",
      "英国": "UK",
      "法国": "France",
      "意大利": "Italy",
      "泛亚": "Pan-Asia",
      "泛美": "Pan-America",
      "英联邦": "Commonwealth",
      "泛欧": "Europe",
      "荷兰": "Netherlands",
      "西班牙": "Spain",
    },
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
    tierLabel: "等级",
    nationLabel: "国家",
    nationAll: "全选",
    nationNone: "清空",
    nationUnknown: "未知",
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
    tierShort: { 8: "VIII", 9: "IX", 10: "X", 11: "XI" },
    nations: {
      "美国": "美国",
      "苏联": "苏联",
      "德国": "德国",
      "日本": "日本",
      "英国": "英国",
      "法国": "法国",
      "意大利": "意大利",
      "泛亚": "泛亚",
      "泛美": "泛美",
      "英联邦": "英联邦",
      "泛欧": "泛欧",
      "荷兰": "荷兰",
      "西班牙": "西班牙",
    },
  },
};

// Legacy English nation codes — used to migrate older localStorage entries
// (shipListV3, nationFilterV1) where nation was stored in English.
const NATION_EN_TO_ZH = {
  "USA": "美国",
  "USSR": "苏联",
  "Germany": "德国",
  "Japan": "日本",
  "UK": "英国",
  "France": "法国",
  "Italy": "意大利",
  "Pan-Asia": "泛亚",
  "Pan-America": "泛美",
  "Commonwealth": "英联邦",
  "Europe": "泛欧",
  "Netherlands": "荷兰",
  "Spain": "西班牙",
};

const GOAL_TAGS = ["winning", "easy", "fun", "trash"];
const HISTORY_MAX = 5;
const UNKNOWN_NATION = "Unknown";

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

function translateNation(nation) {
  if (!nation || nation === UNKNOWN_NATION) {
    return translations[currentLanguage].nationUnknown;
  }
  return translations[currentLanguage].nations[nation] || nation;
}

function tierLabel(tier) {
  return translations[currentLanguage].tierShort[tier] || String(tier);
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

// Filter state. Empty set semantics differ:
//   tierFilter:    must be non-empty to draw (empty = no tier allowed)
//   nationFilter:  must be non-empty to draw (empty = no nation allowed)
// Both default to "all selected" so the UX matches users' mental model.
let tierFilter = new Set(TIERS);
let nationFilter = new Set(NATIONS);

function loadFilterState() {
  try {
    const t = JSON.parse(localStorage.getItem("tierFilterV1"));
    if (Array.isArray(t)) tierFilter = new Set(t.filter((x) => TIERS.includes(x)));
  } catch {}
  try {
    const n = JSON.parse(localStorage.getItem("nationFilterV1"));
    if (Array.isArray(n)) {
      const migrated = n.map((x) => NATION_EN_TO_ZH[x] || x);
      nationFilter = new Set(migrated.filter((x) => NATIONS.includes(x)));
    }
  } catch {}
}

function saveFilterState() {
  localStorage.setItem("tierFilterV1", JSON.stringify([...tierFilter]));
  localStorage.setItem("nationFilterV1", JSON.stringify([...nationFilter]));
}

function initializeShips() {
  // v4 stores nation in Chinese (canonical). v3 stored nation in English; v2
  // predates nation/tier entirely.
  const v4 = localStorage.getItem("shipListV4");
  if (v4) {
    try {
      ships = JSON.parse(v4);
    } catch {
      ships = SHIPS_DATA[currentLanguage].slice();
    }
  } else {
    const v3 = localStorage.getItem("shipListV3");
    const v2 = localStorage.getItem("shipListV2");
    const raw = v3 || v2;
    if (raw) {
      let parsed = [];
      try { parsed = JSON.parse(raw); } catch {}
      const meta = Object.create(null);
      SHIPS_DATA[currentLanguage].forEach((s) => {
        meta[s.name] = { tier: s.tier, nation: s.nation, tags: s.tags };
      });
      ships = parsed.map((s) => ({
        name: s.name,
        type: s.type,
        tier: s.tier ?? meta[s.name]?.tier ?? 10,
        nation:
          NATION_EN_TO_ZH[s.nation] ||
          s.nation ||
          meta[s.name]?.nation ||
          UNKNOWN_NATION,
        tags: s.tags ?? meta[s.name]?.tags,
      }));
      localStorage.setItem("shipListV4", JSON.stringify(ships));
      localStorage.removeItem("shipListV3");
      localStorage.removeItem("shipListV2");
    } else {
      ships = SHIPS_DATA[currentLanguage].slice();
    }
  }

  // Backfill missing tier/nation/tags from defaults — covers older entries
  // where one of the fields was absent.
  const meta = Object.create(null);
  SHIPS_DATA[currentLanguage].forEach((s) => {
    meta[s.name] = { tier: s.tier, nation: s.nation, tags: s.tags };
  });
  ships.forEach((s) => {
    const m = meta[s.name];
    if (!m) return;
    if (s.tier === undefined && m.tier !== undefined) s.tier = m.tier;
    if (!s.nation && m.nation) s.nation = m.nation;
    if (!s.tags && m.tags) s.tags = m.tags;
  });

  // Merge any new ships from SHIPS_DATA that aren't in the saved list.
  const existingNames = new Set(ships.map((s) => s.name));
  SHIPS_DATA[currentLanguage].forEach((s) => {
    if (!existingNames.has(s.name)) {
      ships.push({ ...s });
    }
  });
}

function saveState() {
  localStorage.setItem("shipListV4", JSON.stringify(ships));
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
    ships = ships.map((s) => ({
      name: translateName(s.name, lang),
      type: s.type,
      tier: s.tier,
      nation: s.nation,
      tags: s.tags,
    }));
    drawHistory = drawHistory.map((h) => ({ name: translateName(h.name, lang), type: h.type }));
    if (lastDrawn) lastDrawn.name = translateName(lastDrawn.name, lang);
    saveState();
    saveHistory();
    renderList();
    renderHistory();
  }

  updateUIText();
  renderResult();
  renderNationChips();
  renderNationAddOptions();
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
  document.getElementById("tier-label").textContent = t.tierLabel;
  document.getElementById("nation-label").textContent = t.nationLabel;
  document.getElementById("nation-all").textContent = t.nationAll;
  document.getElementById("nation-none").textContent = t.nationNone;
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

// ── Tier filter ────────────────────────────────────────────────
function initTierFilter() {
  const container = document.getElementById("tier-checkboxes");
  container.innerHTML = "";
  TIERS.forEach((tier) => {
    const label = document.createElement("label");
    label.innerHTML =
      "<input type='checkbox' data-tier='" + tier + "'" +
      (tierFilter.has(tier) ? " checked" : "") + ">" +
      "<span>" + tierLabel(tier) + "</span>";
    container.appendChild(label);
  });
  container.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", () => {
      const tier = Number(cb.dataset.tier);
      if (cb.checked) tierFilter.add(tier);
      else tierFilter.delete(tier);
      saveFilterState();
      applyVisibilityFromFilters();
    });
  });
}

// ── Nation filter ──────────────────────────────────────────────
function renderNationChips() {
  const container = document.getElementById("nation-chips");
  container.innerHTML = "";
  NATIONS.forEach((nation) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nation-chip" + (nationFilter.has(nation) ? " active" : "");
    btn.dataset.nation = nation;
    btn.textContent = translateNation(nation);
    btn.addEventListener("click", () => {
      if (nationFilter.has(nation)) nationFilter.delete(nation);
      else nationFilter.add(nation);
      btn.classList.toggle("active");
      saveFilterState();
      applyVisibilityFromFilters();
    });
    container.appendChild(btn);
  });
}

function setAllNations(on) {
  if (on) NATIONS.forEach((n) => nationFilter.add(n));
  else nationFilter.clear();
  document.querySelectorAll(".nation-chip").forEach((btn) => {
    btn.classList.toggle("active", nationFilter.has(btn.dataset.nation));
  });
  saveFilterState();
  applyVisibilityFromFilters();
}

// ── Add-ship form: nation dropdown ─────────────────────────────
function renderNationAddOptions() {
  const select = document.getElementById("newShipNation");
  if (!select) return;
  const previous = select.value;
  select.innerHTML = "";
  NATIONS.forEach((nation) => {
    const opt = document.createElement("option");
    opt.value = nation;
    opt.textContent = translateNation(nation);
    select.appendChild(opt);
  });
  if (previous && NATIONS.includes(previous)) select.value = previous;
}

// ── Roster (grouped by tier → nation, collapsible) ─────────────
function renderList() {
  const container = document.getElementById("ship-list");
  container.innerHTML = "";

  // Group: tier -> nation -> [{ ship, idx }]
  const grouped = new Map();
  ships.forEach((ship, idx) => {
    const tier = ship.tier ?? "?";
    const nation = ship.nation || UNKNOWN_NATION;
    if (!grouped.has(tier)) grouped.set(tier, new Map());
    const nationMap = grouped.get(tier);
    if (!nationMap.has(nation)) nationMap.set(nation, []);
    nationMap.get(nation).push({ ship, idx });
  });

  // Tier sort: numeric desc, unknown ("?") last.
  const tierSort = (a, b) => {
    if (a === "?" && b === "?") return 0;
    if (a === "?") return 1;
    if (b === "?") return -1;
    return b - a;
  };
  // Nation sort: NATIONS index order, Unknown last.
  const nationSort = (a, b) => {
    const ai = a === UNKNOWN_NATION ? 999 : NATIONS.indexOf(a);
    const bi = b === UNKNOWN_NATION ? 999 : NATIONS.indexOf(b);
    return (ai === -1 ? 998 : ai) - (bi === -1 ? 998 : bi);
  };

  const sortedTiers = [...grouped.keys()].sort(tierSort);
  let animCounter = 0;

  sortedTiers.forEach((tier) => {
    const nationMap = grouped.get(tier);
    const tierTotal = [...nationMap.values()].reduce((n, arr) => n + arr.length, 0);

    const tierGroup = document.createElement("details");
    tierGroup.className = "tier-group";
    tierGroup.dataset.tier = tier;
    // Open tiers that are currently in the active filter, collapse the rest.
    if (tier !== "?" && tierFilter.has(tier)) tierGroup.open = true;
    else if (tier === "?") tierGroup.open = true;

    const summary = document.createElement("summary");
    summary.className = "tier-head";
    summary.innerHTML =
      "<span class='tier-name'>" + escapeHTML(String(tier === "?" ? "?" : tierLabel(tier))) + "</span>" +
      "<span class='tier-count'>" + tierTotal + "</span>";
    tierGroup.appendChild(summary);

    const sortedNations = [...nationMap.keys()].sort(nationSort);
    sortedNations.forEach((nation) => {
      const list = nationMap.get(nation);
      const nationGroup = document.createElement("div");
      nationGroup.className = "nation-group";
      nationGroup.dataset.nation = nation;

      const nationHead = document.createElement("div");
      nationHead.className = "nation-head";
      nationHead.innerHTML =
        "<span class='nation-head-name'>" + escapeHTML(translateNation(nation)) + "</span>" +
        "<span class='nation-head-count'>" + list.length + "</span>";
      nationGroup.appendChild(nationHead);

      const rows = document.createElement("div");
      rows.className = "ship-rows";
      list.forEach(({ ship, idx }) => {
        const div = document.createElement("div");
        div.className = "ship-item";
        div.style.animationDelay = Math.min(animCounter * 8, 240) + "ms";
        animCounter++;
        div.innerHTML =
          "<div class='ship-left'>" +
          "<input type='checkbox' id='ship-" + idx + "' checked>" +
          "<span>" + escapeHTML(ship.name) + "</span>" +
          "<span class='type-label' data-type='" + escapeHTML(ship.type) + "'>" +
          escapeHTML(ship.type) +
          "</span>" +
          "</div>" +
          "<button class='delete-btn' onclick='removeShip(" + idx + ")' aria-label='Remove'>✕</button>";
        rows.appendChild(div);
      });
      nationGroup.appendChild(rows);
      tierGroup.appendChild(nationGroup);
    });

    container.appendChild(tierGroup);
  });

  applyVisibilityFromFilters();
  updateRosterCount();
}

// Apply tier/nation filter visibility without re-rendering — preserves
// per-ship checkbox state across filter toggles.
function applyVisibilityFromFilters() {
  document.querySelectorAll(".tier-group").forEach((g) => {
    const raw = g.dataset.tier;
    const tier = raw === "?" ? null : Number(raw);
    const visible = tier === null ? true : tierFilter.has(tier);
    g.style.display = visible ? "" : "none";
  });
  document.querySelectorAll(".nation-group").forEach((g) => {
    const nation = g.dataset.nation;
    // Unknown nations bypass the filter (no chip exists for them).
    const visible = nation === UNKNOWN_NATION ? true : nationFilter.has(nation);
    g.style.display = visible ? "" : "none";
  });
}

function addShip() {
  const name = document.getElementById("newShipName").value.trim();
  const type = document.getElementById("newShipType").value;
  const tier = Number(document.getElementById("newShipTier").value);
  const nation = document.getElementById("newShipNation").value;
  if (name && !ships.some((s) => s.name === name)) {
    ships.push({ name: name, type: type, tier: tier, nation: nation });
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
    if (ship.tier !== undefined && !tierFilter.has(ship.tier)) return false;
    if (ship.nation && ship.nation !== UNKNOWN_NATION && !nationFilter.has(ship.nation)) return false;
    if (currentGoal && !(ship.tags && ship.tags.includes(currentGoal))) return false;
    return document.getElementById("ship-" + idx)?.checked;
  });
  const resultDiv = document.getElementById("result");
  const t = translations[currentLanguage];

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

loadFilterState();
initializeShips();
loadHistory();
applyTheme(currentTheme);
// Tier data is T10-only for now; hide the tier filter in production builds
// until T8/T9/T11 rosters land. Dev keeps it visible for ongoing work.
if (import.meta.env.PROD) {
  document.getElementById("tier-filter").hidden = true;
} else {
  initTierFilter();
}
renderNationChips();
renderNationAddOptions();
document.getElementById("nation-all").addEventListener("click", () => setAllNations(true));
document.getElementById("nation-none").addEventListener("click", () => setAllNations(false));
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
