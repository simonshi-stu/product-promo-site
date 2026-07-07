const platformNames = ["小红书", "抖音", "天猫", "拼多多", "京东", "视频号", "淘宝直播", "快手"];
const defaults = new Set(["小红书", "抖音", "天猫", "拼多多"]);
const historyKey = "productPromoHistory";
const maxHistoryItems = 10;
const categoryCatalog = [
  { group: "A", name: "AI智能硬件", keys: "ai znyj znyp rgzn aiyingjian" },
  { group: "A", name: "AI智能眼镜", keys: "ai znyj yanjing glasses eyewear" },
  { group: "A", name: "安防监控", keys: "afjk shexiangtou camera jiankong" },
  { group: "B", name: "办公设备", keys: "bgsb dayinji saomiao bangong" },
  { group: "B", name: "保健食品", keys: "bjsp baojianpin yingyangpin" },
  { group: "C", name: "宠物用品", keys: "cwyp chongwu maoliang gouliang" },
  { group: "C", name: "厨房电器", keys: "cfdq chufang dianqi xiaodian" },
  { group: "C", name: "潮玩手办", keys: "cwsb chaowan shouban blindbox" },
  { group: "D", name: "电脑整机", keys: "dnzj diannao laptop pc" },
  { group: "D", name: "大家电", keys: "djd jiadian kongtiao bingxiang xiyiji" },
  { group: "D", name: "灯具照明", keys: "djzm dengju zhaoming" },
  { group: "E", name: "耳机音频", keys: "ejyp erji yinxiang audio" },
  { group: "F", name: "服饰内衣", keys: "fsny fushi neiyi clothing" },
  { group: "F", name: "户外服饰", keys: "hwfs outdoor fushi" },
  { group: "G", name: "个护仪器", keys: "ghyq gewu yirongyi meirongyi" },
  { group: "G", name: "个护清洁", keys: "ghqj xihu mufa yazi kouqiang" },
  { group: "G", name: "功能箱包", keys: "gnxb xiangbao beibao" },
  { group: "H", name: "护肤美妆", keys: "hfmz hufu meizhuang cosmetics" },
  { group: "H", name: "户外装备", keys: "hwzb outdoor zhuangbei luying" },
  { group: "H", name: "黄金珠宝", keys: "hjzb huangjin zhubao jewelry" },
  { group: "J", name: "家居收纳", keys: "jjsn jiaju shouna" },
  { group: "J", name: "家纺床品", keys: "jfcp jiafang chuangpin" },
  { group: "J", name: "家具家装", keys: "jjjz jiaju jiazhuang" },
  { group: "J", name: "健身器材", keys: "jsqc jianshen qicai" },
  { group: "J", name: "酒水饮料", keys: "jsyl jiushui yinliao" },
  { group: "K", name: "咖啡茶饮", keys: "kfcy kafei chayin tea coffee" },
  { group: "M", name: "母婴用品", keys: "myyp muying baobao yunying" },
  { group: "M", name: "美妆工具", keys: "mzgj meizhuang gongju" },
  { group: "N", name: "男装", keys: "nz nanzhuang menswear" },
  { group: "N", name: "女装", keys: "nvz nuzhuang womenswear" },
  { group: "P", name: "配饰眼镜", keys: "psyj peishi yanjing sunglasses" },
  { group: "Q", name: "汽车用品", keys: "qcyp qiche chepin" },
  { group: "Q", name: "清洁日化", keys: "qjrh qingjie rihua xiyi" },
  { group: "S", name: "手机通讯", keys: "sjtx shouji tongxun phone" },
  { group: "S", name: "食品零食", keys: "spls shipin lingshi snack" },
  { group: "S", name: "数码配件", keys: "smpj shuma peijian charger" },
  { group: "S", name: "摄影摄像", keys: "sysx sheying shexiang camera" },
  { group: "T", name: "童装童鞋", keys: "tztx tongzhuang tongxie kids" },
  { group: "T", name: "图书文具", keys: "tswj tushu wenju stationery" },
  { group: "W", name: "玩具乐器", keys: "wj yueqi wanju toys" },
  { group: "X", name: "鞋靴", keys: "xx xiexue shoes" },
  { group: "X", name: "小家电", keys: "xjd xiaojiadian" },
  { group: "Y", name: "运动户外", keys: "ydhw yundong huwai sports" },
  { group: "Y", name: "营养保健", keys: "yybj yingyang baojian" },
  { group: "Y", name: "医疗健康", keys: "yljk yiliao jiankang" },
  { group: "Z", name: "智能穿戴", keys: "zncd zhineng chuandai wearable" },
  { group: "Z", name: "智能家居", keys: "znjj zhineng jiaju smart home" },
  { group: "Z", name: "钟表腕表", keys: "zbwb watch zhongbiao" }
];

const state = {
  imageDataUrl: "",
  lastResult: null,
  history: []
};

const imageInput = document.querySelector("#imageInput");
const categoryInput = document.querySelector("#category");
const categoryDropdown = document.querySelector("#categoryDropdown");
const preview = document.querySelector("#preview");
const uploadText = document.querySelector("#uploadText");
const uploadZone = document.querySelector(".upload-zone");
const platformsEl = document.querySelector("#platforms");
const generateBtn = document.querySelector("#generateBtn");
const selectAllBtn = document.querySelector("#selectAll");
const copyAllBtn = document.querySelector("#copyAll");
const historySelect = document.querySelector("#historySelect");
const loadHistoryBtn = document.querySelector("#loadHistory");
const clearHistoryBtn = document.querySelector("#clearHistory");
const emptyState = document.querySelector("#emptyState");
const loadingState = document.querySelector("#loadingState");
const errorBox = document.querySelector("#errorBox");
const healthBox = document.querySelector("#healthBox");
const summaryEl = document.querySelector("#summary");
const resultsEl = document.querySelector("#results");

function initPlatforms() {
  platformsEl.innerHTML = platformNames.map((name) => `
    <label class="platform-chip">
      <input type="checkbox" value="${name}" ${defaults.has(name) ? "checked" : ""} />
      ${name}
    </label>
  `).join("");
}

function getSelectedPlatforms() {
  return [...platformsEl.querySelectorAll("input:checked")].map((input) => input.value);
}

function getInputValue(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function normalizeSearch(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function filterCategories(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return categoryCatalog;
  return categoryCatalog.filter((item) => {
    const haystack = normalizeSearch(`${item.name} ${item.keys} ${item.group}`);
    return haystack.includes(normalized);
  });
}

function renderCategoryDropdown(query = "") {
  const matches = filterCategories(query).slice(0, 80);
  if (!matches.length) {
    categoryDropdown.innerHTML = `<div class="category-empty">没有匹配品类，可直接输入自定义品类</div>`;
    categoryDropdown.classList.remove("hidden");
    return;
  }

  let currentGroup = "";
  categoryDropdown.innerHTML = matches.map((item) => {
    const groupTitle = item.group !== currentGroup ? `<div class="category-group">${item.group}</div>` : "";
    currentGroup = item.group;
    return `
      ${groupTitle}
      <button class="category-option" type="button" data-category="${escapeHtml(item.name)}">
        <span>${escapeHtml(item.name)}</span>
        <small>${escapeHtml(item.keys.split(" ").slice(0, 3).join(" / "))}</small>
      </button>
    `;
  }).join("");
  categoryDropdown.classList.remove("hidden");
}

function hideCategoryDropdown() {
  categoryDropdown.classList.add("hidden");
}

function initCategoryPicker() {
  categoryInput.addEventListener("focus", () => renderCategoryDropdown(categoryInput.value));
  categoryInput.addEventListener("input", () => renderCategoryDropdown(categoryInput.value));
  categoryDropdown.addEventListener("click", (event) => {
    const option = event.target.closest(".category-option");
    if (!option) return;
    categoryInput.value = option.dataset.category;
    hideCategoryDropdown();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".category-picker")) return;
    hideCategoryDropdown();
  });
}

function getFormSnapshot() {
  return {
    category: getInputValue("category"),
    priceRange: getInputValue("priceRange"),
    prompt: getInputValue("prompt"),
    platforms: getSelectedPlatforms()
  };
}

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.querySelector("span").textContent = isLoading ? "生成中..." : "生成推广文案";
  loadingState.classList.toggle("hidden", !isLoading);
  if (isLoading) {
    emptyState.classList.add("hidden");
    errorBox.classList.add("hidden");
  }
}

function resetGenerateState() {
  generateBtn.disabled = false;
  generateBtn.querySelector("span").textContent = "生成推广文案";
  loadingState.classList.add("hidden");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  errorBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toList(items = []) {
  if (!Array.isArray(items) || !items.length) return "<p>暂无</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>`;
}

function toTags(items = []) {
  if (!Array.isArray(items) || !items.length) return "<p>暂无</p>";
  return `<div class="tag-list">${items.map((item) => `<span>${escapeHtml(String(item))}</span>`).join("")}</div>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSummary(result) {
  summaryEl.innerHTML = `
    <article class="summary-card">
      <strong>产品介绍</strong>
      <p>${escapeHtml(result.product_summary || "暂无")}</p>
    </article>
    <article class="summary-card">
      <strong>价格策略</strong>
      <p>${escapeHtml(result.price_strategy || "暂无")}</p>
    </article>
    <article class="summary-card">
      <strong>图片识别特点</strong>
      ${toList(result.visual_insights)}
    </article>
    <article class="summary-card">
      <strong>核心卖点</strong>
      ${toList(result.core_selling_points)}
    </article>
  `;
  summaryEl.classList.remove("hidden");
}

function platformToText(platform) {
  return [
    `【${platform.name}】`,
    `定位：${platform.positioning || ""}`,
    `价格角度：${platform.price_angle || ""}`,
    `标题：${(platform.titles || []).join(" / ")}`,
    `介绍：${platform.short_intro || ""}`,
    `宣发语：${(platform.promotion_copy || []).join("；")}`,
    `流量词：${(platform.traffic_keywords || []).join("、")}`,
    `话题：${(platform.hashtags || []).join("、")}`,
    `引导：${platform.cta || ""}`,
    `提醒：${platform.risk_note || ""}`
  ].join("\n");
}

function renderResults(result) {
  const platforms = Array.isArray(result.platforms) ? result.platforms : [];
  resultsEl.innerHTML = platforms.map((platform, index) => `
    <article class="result-card">
      <div class="card-head">
        <span class="platform-name">${escapeHtml(platform.name || `平台 ${index + 1}`)}</span>
        <button class="mini-copy" type="button" data-index="${index}">复制</button>
      </div>
      <div class="copy-section">
        <strong>内容定位</strong>
        <p>${escapeHtml(platform.positioning || "暂无")}</p>
      </div>
      <div class="copy-section">
        <strong>价格角度</strong>
        <p>${escapeHtml(platform.price_angle || "暂无")}</p>
      </div>
      <div class="copy-section">
        <strong>标题推荐</strong>
        ${toList(platform.titles)}
      </div>
      <div class="copy-section">
        <strong>产品介绍</strong>
        <p>${escapeHtml(platform.short_intro || "暂无")}</p>
      </div>
      <div class="copy-section">
        <strong>宣发语句</strong>
        ${toList(platform.promotion_copy)}
      </div>
      <div class="copy-section">
        <strong>大流量推广词</strong>
        ${toTags(platform.traffic_keywords)}
      </div>
      <div class="copy-section">
        <strong>话题标签</strong>
        ${toTags(platform.hashtags)}
      </div>
      <div class="copy-section">
        <strong>行动引导</strong>
        <p>${escapeHtml(platform.cta || "暂无")}</p>
      </div>
      <div class="copy-section">
        <strong>合规提醒</strong>
        <p>${escapeHtml(platform.risk_note || "暂无")}</p>
      </div>
    </article>
  `).join("");

  resultsEl.querySelectorAll(".mini-copy").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(platformToText(platforms[Number(button.dataset.index)]));
      button.textContent = "已复制";
      setTimeout(() => { button.textContent = "复制"; }, 1200);
    });
  });
}

function loadHistory() {
  try {
    state.history = JSON.parse(localStorage.getItem(historyKey) || "[]");
  } catch {
    state.history = [];
  }
}

function renderHistoryOptions() {
  historySelect.innerHTML = `<option value="">历史记录</option>` + state.history.map((item) => {
    const label = `${item.createdAt} · ${item.inputs?.category || "未命名"} · ${item.inputs?.priceRange || "未标价"}`;
    return `<option value="${item.id}">${escapeHtml(label)}</option>`;
  }).join("");
  updateHistoryButtons();
}

function updateHistoryButtons() {
  const hasHistory = state.history.length > 0;
  loadHistoryBtn.disabled = !hasHistory || !historySelect.value;
  clearHistoryBtn.disabled = !hasHistory;
}

function saveHistory(result, inputs) {
  const item = {
    id: String(Date.now()),
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    inputs,
    result
  };
  state.history = [item, ...state.history.filter((entry) => entry.id !== item.id)].slice(0, maxHistoryItems);
  localStorage.setItem(historyKey, JSON.stringify(state.history));
  renderHistoryOptions();
  historySelect.value = item.id;
  updateHistoryButtons();
}

function loadSelectedHistory() {
  const item = state.history.find((entry) => entry.id === historySelect.value);
  if (!item) return;

  document.querySelector("#category").value = item.inputs?.category || "";
  document.querySelector("#priceRange").value = item.inputs?.priceRange || "";
  document.querySelector("#prompt").value = item.inputs?.prompt || "";
  platformsEl.querySelectorAll("input").forEach((input) => {
    input.checked = item.inputs?.platforms?.includes(input.value) || false;
  });

  state.lastResult = item.result;
  emptyState.classList.add("hidden");
  errorBox.classList.add("hidden");
  renderSummary(item.result);
  renderResults(item.result);
  copyAllBtn.disabled = false;
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem(historyKey);
  renderHistoryOptions();
}

async function generate() {
  const platforms = getSelectedPlatforms();
  if (!platforms.length) {
    showError("请至少选择一个平台。");
    return;
  }

  setLoading(true);
  resultsEl.innerHTML = "";
  summaryEl.classList.add("hidden");
  const inputs = getFormSnapshot();

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: state.imageDataUrl,
        ...inputs
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "生成失败，请稍后再试。");
    if (!data.result || !Array.isArray(data.result.platforms)) {
      throw new Error("模型返回格式异常，请再试一次，或减少平台数量后重试。");
    }

    state.lastResult = data.result;
    renderSummary(data.result);
    renderResults(data.result);
    saveHistory(data.result, inputs);
    copyAllBtn.disabled = false;
  } catch (error) {
    emptyState.classList.remove("hidden");
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    healthBox.classList.remove("warning", "error");

    if (!data.keyConfigured) {
      healthBox.classList.add("error");
      healthBox.textContent = "API Key 未配置：请检查 .env 里的 ZHIPU_API_KEY。";
      return;
    }

    if (data.apiStatus === "error") {
      healthBox.classList.add("error");
      healthBox.textContent = `${data.provider || "AI"} 连接异常：${data.error || "请检查网络或 Key。"}`;
      return;
    }

    if (data.modelVisible === false) {
      healthBox.classList.add("warning");
      healthBox.textContent = `API Key 已配置，但当前模型 ${data.model} 不在可见模型列表中。`;
      return;
    }

    healthBox.textContent = `API Key 已配置，当前模型：${data.model}`;
  } catch (error) {
    healthBox.classList.add("error");
    healthBox.textContent = `本地服务检查失败：${error.message}`;
  }
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showError("请上传图片文件。");
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    showError("图片太大，请压缩到 15MB 以内。");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    state.imageDataUrl = String(reader.result);
    preview.src = state.imageDataUrl;
    uploadText.textContent = "更换产品图片";
    uploadZone.classList.add("has-image");
    errorBox.classList.add("hidden");
  };
  reader.readAsDataURL(file);
});

selectAllBtn.addEventListener("click", () => {
  const inputs = [...platformsEl.querySelectorAll("input")];
  const shouldCheck = inputs.some((input) => !input.checked);
  inputs.forEach((input) => { input.checked = shouldCheck; });
  selectAllBtn.textContent = shouldCheck ? "清空" : "全选";
});

copyAllBtn.addEventListener("click", async () => {
  if (!state.lastResult) return;
  const summary = [
    `产品介绍：${state.lastResult.product_summary || ""}`,
    `价格策略：${state.lastResult.price_strategy || ""}`,
    `核心卖点：${(state.lastResult.core_selling_points || []).join("、")}`,
    "",
    ...(state.lastResult.platforms || []).map(platformToText)
  ].join("\n\n");
  await navigator.clipboard.writeText(summary);
  copyAllBtn.textContent = "已复制";
  setTimeout(() => { copyAllBtn.textContent = "复制全部"; }, 1200);
});

loadHistoryBtn.addEventListener("click", loadSelectedHistory);
clearHistoryBtn.addEventListener("click", clearHistory);
historySelect.addEventListener("change", updateHistoryButtons);
generateBtn.addEventListener("click", generate);
initCategoryPicker();
initPlatforms();
loadHistory();
renderHistoryOptions();
resetGenerateState();
checkHealth();
