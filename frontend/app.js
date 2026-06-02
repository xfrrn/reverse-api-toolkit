const ALL_CATEGORY = "全部";
const TEXT_CATEGORY = "文本工具";

const tools = [
  {
    title: "有道普通翻译",
    desc: "支持文本翻译、自动检测和多语言互译",
    category: TEXT_CATEGORY,
    badge: "译",
    color: "blue",
    action: "text",
  },
  {
    title: "有道模型翻译",
    desc: "支持 Lite / Pro 模型和流式翻译结果",
    category: TEXT_CATEGORY,
    badge: "AI",
    color: "green",
    action: "model",
  },
  {
    title: "翻译语言列表",
    desc: "查看当前接口支持的文本和模型语言",
    category: TEXT_CATEGORY,
    badge: "文",
    color: "orange",
    action: "languages",
  },
];

let activeCategory = ALL_CATEGORY;
let activeMode = "text";

const latestTools = document.querySelector("#latestTools");
const hotTools = document.querySelector("#hotTools");
const toolGrid = document.querySelector("#toolGrid");
const searchInput = document.querySelector("#searchInput");
const sourceText = document.querySelector("#sourceText");
const resultOutput = document.querySelector("#resultOutput");
const statusText = document.querySelector("#statusText");
const translateButton = document.querySelector("#translateButton");
const sourceLang = document.querySelector("#sourceLang");
const targetLang = document.querySelector("#targetLang");
const modelName = document.querySelector("#modelName");
const promptText = document.querySelector("#promptText");
const charCount = document.querySelector("#charCount");
const modelOptions = document.querySelector("#modelOptions");
const activeToolTitle = document.querySelector("#activeToolTitle");

function badgeClass(color) {
  return ["red", "green", "orange"].includes(color) ? color : "";
}

function makeBadge(tool) {
  return `
    <div class="tool-badge ${badgeClass(tool.color)}" aria-hidden="true">
      <span>${tool.badge}</span>
    </div>
  `;
}

function makeFeaturedTool(tool) {
  const button = document.createElement("button");
  button.className = "feature-tool";
  button.type = "button";
  button.innerHTML = `
    <div class="feature-icon">${makeBadge(tool)}</div>
    <h3>${tool.title}</h3>
    <p>${tool.desc}</p>
  `;
  button.addEventListener("click", () => openTool(tool));
  return button;
}

function makeToolCard(tool) {
  const button = document.createElement("button");
  button.className = "tool-card";
  button.type = "button";
  button.innerHTML = `
    ${makeBadge(tool)}
    <div>
      <h3>${tool.title}</h3>
      <p>${tool.desc}</p>
    </div>
  `;
  button.addEventListener("click", () => openTool(tool));
  return button;
}

function makeEmptyState() {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "该分类暂无已接入工具。";
  return empty;
}

function getFilteredTools() {
  const query = searchInput.value.trim().toLowerCase();
  return tools.filter((tool) => {
    const categoryMatch = activeCategory === ALL_CATEGORY || tool.category === activeCategory;
    const queryMatch = !query || `${tool.title}${tool.desc}${tool.category}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
}

function renderTools() {
  const filtered = getFilteredTools();
  toolGrid.replaceChildren(...(filtered.length ? filtered.map(makeToolCard) : [makeEmptyState()]));
}

function renderFeatured() {
  latestTools.replaceChildren(...tools.map(makeFeaturedTool));
  hotTools.replaceChildren(...tools.map(makeFeaturedTool));
}

function setMode(mode) {
  activeMode = mode;
  document.querySelectorAll(".mode-tabs button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  modelOptions.hidden = mode !== "model";
  sourceText.maxLength = mode === "model" ? 800 : 1000;
  activeToolTitle.textContent = mode === "model" ? "有道模型翻译" : "有道普通翻译";
  updateCharCount();
}

function openTool(tool) {
  if (tool.action === "model" || tool.action === "text") {
    setMode(tool.action);
    document.querySelector("#translator").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (tool.action === "languages") {
    loadLanguages();
    document.querySelector("#translator").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateCharCount() {
  const limit = Number(sourceText.maxLength);
  charCount.textContent = `${sourceText.value.length} / ${limit}`;
}

async function translate() {
  const text = sourceText.value.trim();
  if (!text) {
    statusText.textContent = "请输入要翻译的内容。";
    sourceText.focus();
    return;
  }

  const endpoint = activeMode === "model" ? "/youdao/model-translate" : "/youdao/text-translate";
  const payload = {
    text,
    source: sourceLang.value,
    target: targetLang.value,
  };

  if (activeMode === "model") {
    payload.model = modelName.value;
    payload.prompt = promptText.value.trim();
  }

  translateButton.disabled = true;
  statusText.textContent = "正在请求接口...";
  resultOutput.textContent = "";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "接口请求失败");
    }

    resultOutput.textContent = data.text || "接口返回了空结果。";
    statusText.textContent = "翻译完成。";
  } catch (error) {
    resultOutput.textContent = "";
    statusText.textContent = error instanceof Error ? error.message : "接口请求失败";
  } finally {
    translateButton.disabled = false;
  }
}

async function loadLanguages() {
  statusText.textContent = "正在读取语言列表...";
  try {
    const response = await fetch("/youdao/languages");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "语言列表读取失败");
    }
    resultOutput.textContent = JSON.stringify(data, null, 2);
    activeToolTitle.textContent = "翻译语言列表";
    statusText.textContent = "语言列表读取完成。";
  } catch (error) {
    statusText.textContent = error instanceof Error ? error.message : "语言列表读取失败";
  }
}

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".category").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderTools();
  });
});

document.querySelectorAll(".mode-tabs button").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

searchInput.addEventListener("input", renderTools);
sourceText.addEventListener("input", updateCharCount);
translateButton.addEventListener("click", translate);

document.querySelector("#swapLang").addEventListener("click", () => {
  if (sourceLang.value === "auto") {
    sourceLang.value = targetLang.value;
    targetLang.value = "zh-CHS";
    return;
  }
  const currentSource = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = currentSource;
});

document.querySelector("#copyResult").addEventListener("click", async () => {
  const text = resultOutput.textContent.trim();
  if (!text) {
    statusText.textContent = "没有可复制的结果。";
    return;
  }
  await navigator.clipboard.writeText(text);
  statusText.textContent = "结果已复制。";
});

document.querySelector("#backTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

renderFeatured();
renderTools();
setMode("text");
