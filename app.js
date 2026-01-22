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
const exportCsvBtn = document.querySelector("#exportCsvBtn");
const submitBtn = document.querySelector("#submitBtn");
const cancelEditBtn = document.querySelector("#cancelEditBtn");

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
  editingId: null, // ✅ 目前正在編輯的那筆 id；沒在編輯就是 null
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

function setFormValuesFromRecord(r) {
  dateInput.value = r.date;
  typeInput.value = r.type;
  categoryInput.value = r.category;
  amountInput.value = String(r.amount);
  noteInput.value = r.note || "";
}

function clearEditingHighlight() {
  document.querySelectorAll(".item.is-editing").forEach((el) => {
    el.classList.remove("is-editing");
  });
}

function enterEditMode(r) {
  state.editingId = r.id;
  setFormValuesFromRecord(r);

  submitBtn.textContent = "更新";
  cancelEditBtn.hidden = false;

  clearEditingHighlight();
  const row = document.querySelector(`.item[data-id="${r.id}"]`);
  if (row) row.classList.add("is-editing");

  amountInput.focus();
}

function escapeCSV(v) {
  // CSV 需要處理逗號、雙引號、換行
  const s = String(v ?? "");
  const escaped = s.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function recordsToCSV(records) {
  const header = ["date", "type", "category", "amount", "note"];
  const rows = records.map((r) => [
    r.date,
    r.type,
    r.category,
    r.amount,
    r.note || "",
  ]);

  const lines = [
    header.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ];

  return lines.join("\n");
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
  // V2: summary should follow current filters (same as the list)
  const filtered = getFilteredRecords();

  let income = 0;
  let expense = 0;

  for (const r of filtered) {
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
    const li = node.querySelector(".item");
    li.dataset.id = r.id;

    const typeBadge = node.querySelector('[data-role="typeBadge"]');
    const categoryText = node.querySelector('[data-role="categoryText"]');
    const dateText = node.querySelector('[data-role="dateText"]');
    const noteText = node.querySelector('[data-role="noteText"]');
    const amountText = node.querySelector('[data-role="amountText"]');
    const editBtn = node.querySelector('[data-role="editBtn"]');
    const deleteBtn = node.querySelector('[data-role="deleteBtn"]');

    editBtn.classList.add("btn");// 要實心紫色編輯就只加 btn
    deleteBtn.classList.add("btn");

    typeBadge.textContent = r.type === "income" ? "收入" : "支出";
    categoryText.textContent = CATEGORY_LABEL[r.category] || r.category;
    dateText.textContent = r.date;

    noteText.textContent = r.note?.trim() ? r.note.trim() : "—";

    const sign = r.type === "income" ? "+" : "-";
    amountText.textContent = `${sign}${formatMoney(r.amount)}`;

    // 綁定刪除 // 綁定編輯
    editBtn.addEventListener("click", () => {
      enterEditMode(r);
    });

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

function updateRecord(id, patch) {
  const target = state.records.find((r) => r.id === id);
  if (!target) return;

  target.date = patch.date;
  target.type = patch.type;
  target.category = patch.category;
  target.amount = patch.amount;
  target.note = patch.note || "";

  saveRecords(state.records);
  render();
}

function deleteRecord(id) {
  state.records = state.records.filter((r) => r.id !== id);
  saveRecords(state.records);
  render();
}

function exitEditMode() {
  state.editingId = null;
  clearEditingHighlight();

  submitBtn.textContent = "新增";
  cancelEditBtn.hidden = true;

  // UX：清空金額與備註、日期回今天（你也可選擇保留今天）
  dateInput.value = todayISO();
  amountInput.value = "";
  noteInput.value = "";
  typeInput.value = "expense";
  categoryInput.value = "food";

  amountInput.focus();
}

function clearAll() {
  state.records = [];
  saveRecords(state.records);
  render();
}

function downloadCSV(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

// ---------- Events ----------
function initDefaults() {
  dateInput.value = todayISO();

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  state.filters.month = `${yyyy}-${mm}`;
  syncFilterUIFromState();

  // ✅ 重要：刷新後一律回到「新增模式」
  state.editingId = null;
  clearEditingHighlight();
  submitBtn.textContent = "新增";
  cancelEditBtn.hidden = true;
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

  // ✅ 分流：編輯模式 or 新增模式
  if (state.editingId) {
    console.log("[UPDATE]", state.editingId);
    updateRecord(state.editingId, { date, type, category, amount, note });
    exitEditMode();
  } else {
    console.log("[ADD]");
    addRecord({ date, type, category, amount, note });
    // 你原本新增後 UX
    amountInput.value = "";
    noteInput.value = "";
    amountInput.focus();
  }
});

clearAllBtn.addEventListener("click", () => {
  const ok = confirm("確定要清空全部紀錄嗎？此動作無法復原。");
  if (!ok) return;
  clearAll();
});

cancelEditBtn.addEventListener("click", () => {
  exitEditMode();
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

exportCsvBtn.addEventListener("click", () => {
  const filtered = getFilteredRecords(); // ✅ 匯出「目前畫面上看到的結果」

  if (filtered.length === 0) {
    alert("目前沒有可匯出的紀錄（請先新增或調整篩選條件）");
    return;
  }

  const csv = recordsToCSV(filtered);

  const yyyyMm = state.filters.month || "all";
  const filename = `accounting_${yyyyMm}.csv`;

  downloadCSV(filename, csv);
});


// ---------- Boot ----------
initDefaults();
render();
