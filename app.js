/* =========================
   Accounting App - V0 (MVP)
   - Single source of truth: state.records
   - render() draws UI from state
   - localStorage persistence
========================= */

// ---------- DOM ----------
const form = document.querySelector("#recordForm");
const dateInput = document.querySelector("#dateInput");
const typeInput = document.querySelector("#typeInput");
const categoryInput = document.querySelector("#categoryInput");
const amountInput = document.querySelector("#amountInput");
const noteInput = document.querySelector("#noteInput");

const sumIncomeEl = document.querySelector("#sumIncome");
const sumExpenseEl = document.querySelector("#sumExpense");
const sumBalanceEl = document.querySelector("#sumBalance");

const recordList = document.querySelector("#recordList");
const recordItemTpl = document.querySelector("#recordItemTpl");

const clearAllBtn = document.querySelector("#clearAllBtn");
const monthFilter = document.querySelector("#monthFilter");
const typeFilter = document.querySelector("#typeFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const qFilter = document.querySelector("#qFilter");
const resetFilterBtn = document.querySelector("#resetFilterBtn");


// ---------- Config ----------
const STORAGE_KEY = "accounting_records_v0";

// 類別中文對照（UI 顯示用）
const CATEGORY_LABEL = {
  food: "餐飲",
  traffic: "交通",
  shopping: "購物",
  rent: "房租",
  medical: "醫療",
  salary: "薪資",
  bonus: "獎金",
  other: "其他",
};

// ---------- State ----------
const state = {
  records: loadRecords(),
  filters: {
    month: "",       // "YYYY-MM"
    type: "all",     // all | income | expense
    category: "all", // all | food | ...
    q: "",           // keyword
  },
};


// ---------- Utils ----------
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isValidISODate(v) {
  // 簡單檢查 YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function toInt(v) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
}

function formatMoney(n) {
  // 先用整數記帳（目前 amountInput step=1）
  return String(n);
}

function sameMonth(dateStr, yyyy, mm) {
  // dateStr: YYYY-MM-DD
  if (!isValidISODate(dateStr)) return false;
  const [y, m] = dateStr.split("-").map((x) => Number(x));
  return y === yyyy && m === mm;
}

// ---------- Storage ----------
function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // 基本資料校驗，避免壞資料把 UI 弄掛
    return parsed.filter((r) => {
      return (
        r &&
        typeof r.id === "string" &&
        typeof r.date === "string" &&
        (r.type === "income" || r.type === "expense") &&
        typeof r.category === "string" &&
        Number.isFinite(r.amount) &&
        typeof r.note === "string"
      );
    });
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getFilteredRecords() {
  const { month, type, category, q } = state.filters;
  const keyword = (q || "").trim().toLowerCase();

  return state.records.filter((r) => {
    if (month) {
      if (!r.date.startsWith(month)) return false; // YYYY-MM
    }
    if (type !== "all") {
      if (r.type !== type) return false;
    }
    if (category !== "all") {
      if (r.category !== category) return false;
    }
    if (keyword) {
      const catLabel = (CATEGORY_LABEL[r.category] || r.category).toLowerCase();
      const note = (r.note || "").toLowerCase();
      if (!catLabel.includes(keyword) && !note.includes(keyword)) return false;
    }
    return true;
  });
}

function syncFilterUIFromState() {
  monthFilter.value = state.filters.month;
  typeFilter.value = state.filters.type;
  categoryFilter.value = state.filters.category;
  qFilter.value = state.filters.q;
}

// ---------- Core: Render ----------
function render() {
  renderSummary();
  renderList();
}

function renderSummary() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = now.getMonth() + 1;

  let income = 0;
  let expense = 0;

  for (const r of state.records) {
    if (!sameMonth(r.date, yyyy, mm)) continue;
    if (r.type === "income") income += r.amount;
    if (r.type === "expense") expense += r.amount;
  }

  const balance = income - expense;

  sumIncomeEl.textContent = formatMoney(income);
  sumExpenseEl.textContent = formatMoney(expense);
  sumBalanceEl.textContent = formatMoney(balance);
}

function renderList() {
  recordList.innerHTML = "";

  // 最新在上面：依 date 倒序，再依 createdAt 倒序
  const filtered = getFilteredRecords();
  const sorted = [...filtered].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  for (const r of sorted) {
    const node = recordItemTpl.content.cloneNode(true);

    const typeBadge = node.querySelector('[data-role="typeBadge"]');
    const categoryText = node.querySelector('[data-role="categoryText"]');
    const dateText = node.querySelector('[data-role="dateText"]');
    const noteText = node.querySelector('[data-role="noteText"]');
    const amountText = node.querySelector('[data-role="amountText"]');
    const deleteBtn = node.querySelector('[data-role="deleteBtn"]');

    typeBadge.textContent = r.type === "income" ? "收入" : "支出";
    categoryText.textContent = CATEGORY_LABEL[r.category] || r.category;
    dateText.textContent = r.date;

    noteText.textContent = r.note?.trim() ? r.note.trim() : "—";

    const sign = r.type === "income" ? "+" : "-";
    amountText.textContent = `${sign}${formatMoney(r.amount)}`;

    // 綁定刪除
    deleteBtn.addEventListener("click", () => {
      deleteRecord(r.id);
    });

    recordList.appendChild(node);
  }
}

// ---------- Core: Actions ----------
function addRecord({ date, type, category, amount, note }) {
  const record = {
    id: crypto.randomUUID(),
    date,
    type,
    category,
    amount,
    note: note || "",
    createdAt: Date.now(),
  };

  state.records.push(record);
  saveRecords(state.records);
  render();
}

function deleteRecord(id) {
  state.records = state.records.filter((r) => r.id !== id);
  saveRecords(state.records);
  render();
}

function clearAll() {
  state.records = [];
  saveRecords(state.records);
  render();
}

// ---------- Events ----------
function initDefaults() {
  dateInput.value = todayISO();

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  state.filters.month = `${yyyy}-${mm}`;
  syncFilterUIFromState();
}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const date = dateInput.value;
  const type = typeInput.value; // income | expense
  const category = categoryInput.value;
  const amount = toInt(amountInput.value);
  const note = noteInput.value;

  // Validation（故意做得明確，避免未來迷思）
  if (!isValidISODate(date)) {
    alert("請選擇正確日期");
    return;
  }
  if (type !== "income" && type !== "expense") {
    alert("類型不正確");
    return;
  }
  if (!category) {
    alert("請選擇類別");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    alert("金額請輸入大於 0 的整數");
    return;
  }

  addRecord({ date, type, category, amount, note });

  // UX：新增後只清空金額與備註，日期保留今天
  amountInput.value = "";
  noteInput.value = "";
  amountInput.focus();
});

clearAllBtn.addEventListener("click", () => {
  const ok = confirm("確定要清空全部紀錄嗎？此動作無法復原。");
  if (!ok) return;
  clearAll();
});
monthFilter.addEventListener("change", () => {
  state.filters.month = monthFilter.value;
  render();
});

typeFilter.addEventListener("change", () => {
  state.filters.type = typeFilter.value;
  render();
});

categoryFilter.addEventListener("change", () => {
  state.filters.category = categoryFilter.value;
  render();
});

qFilter.addEventListener("input", () => {
  state.filters.q = qFilter.value;
  render();
});

resetFilterBtn.addEventListener("click", () => {
  state.filters = { month: "", type: "all", category: "all", q: "" };
  syncFilterUIFromState();
  render();
});


// ---------- Boot ----------
initDefaults();
render();
