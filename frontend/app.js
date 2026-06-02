const tools = [
  {
    title: "有道普通翻译",
    desc: "支持文本翻译、自动检测和多语言互译",
    category: "翻译工具",
    badge: "译",
    color: "blue",
    action: "text",
    tag: "权益卡",
  },
  {
    title: "有道模型翻译",
    desc: "支持 Lite / Pro 模型和流式翻译结果",
    category: "翻译工具",
    badge: "AI",
    color: "green",
    action: "model",
    tag: "NEW",
  },
  {
    title: "翻译语言列表",
    desc: "查看当前接口支持的文本和模型语言",
    category: "翻译工具",
    badge: "文",
    color: "orange",
    action: "languages",
  },
  {
    title: "PDF转Word",
    desc: "PDF转Word是一款高效的文档处理工具",
    category: "PDF转换工具",
    badge: "W",
    color: "blue",
    tag: "权益卡",
  },
  {
    title: "PDF转Excel",
    desc: "PDF转Excel是一款高效的文档处理工具",
    category: "PDF转换工具",
    badge: "X",
    color: "green",
    tag: "权益卡",
  },
  {
    title: "PDF转HTML",
    desc: "PDF图片转HTML是一款功能强大的工具",
    category: "PDF转换工具",
    badge: "H",
    color: "red",
  },
  {
    title: "PDF转图片",
    desc: "PDF转图片工具是一款专业的在线转换工具",
    category: "PDF转换工具",
    badge: "图",
    color: "blue",
  },
  {
    title: "PDF转PPT",
    desc: "PDF转PPT工具是一款用户友好的在线工具",
    category: "PDF转换工具",
    badge: "P",
    color: "orange",
    tag: "权益卡",
  },
  {
    title: "Word转PDF",
    desc: "Word转PDF是一款用户友好的在线转换工具",
    category: "文档转换工具",
    badge: "W",
    color: "red",
  },
  {
    title: "Word格式转换",
    desc: "Word格式转换是一款功能强大的文本工具",
    category: "文档转换工具",
    badge: "W",
    color: "blue",
  },
  {
    title: "PPT格式转换",
    desc: "PPT格式转换是一款功能强大的幻灯片工具",
    category: "文档转换工具",
    badge: "P",
    color: "orange",
  },
  {
    title: "文本格式化",
    desc: "整理空格、换行、大小写和常用文本格式",
    category: "文本工具",
    badge: "T",
    color: "green",
  },
  {
    title: "JSON格式化",
    desc: "开发调试中常用的数据格式化工具",
    category: "开发工具",
    badge: "{}",
    color: "blue",
  },
  {
    title: "数据换算",
    desc: "长度、重量、时间等单位快速换算",
    category: "数据换算工具",
    badge: "算",
    color: "green",
  },
  {
    title: "学习工具",
    desc: "作业辅导、词句理解和学习资料处理",
    category: "教育工具",
    badge: "学",
    color: "blue",
  },
  {
    title: "图片压缩",
    desc: "图片压缩是一款轻量级图片处理工具",
    category: "图片工具",
    badge: "图",
    color: "blue",
  },
  {
    title: "证件照生成",
    desc: "相片生成证件照工具，适合常用尺寸",
    category: "生活娱乐工具",
    badge: "证",
    color: "blue",
  },
  {
    title: "浏览器插件",
    desc: "把常用能力接入浏览器右键与工具栏",
    category: "浏览器插件",
    badge: "件",
    color: "orange",
  },
  {
    title: "在线录屏",
    desc: "在线录屏，支持录制指定窗口和屏幕",
    category: "视频工具",
    badge: "播",
    color: "red",
  },
];

let activeCategory = "全部";
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
    ${tool.tag ? `<span class="ribbon ${tool.tag === "NEW" ? "orange" : ""}">${tool.tag}</span>` : ""}
    ${makeBadge(tool)}
    <div>
      <h3>${tool.title}</h3>
      <p>${tool.desc}</p>
    </div>
  `;
  button.addEventListener("click", () => openTool(tool));
  return button;
}

function renderTools() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = tools.filter((tool) => {
    const categoryMatch = activeCategory === "全部" || tool.category === activeCategory;
    const queryMatch = !query || `${tool.title}${tool.desc}${tool.category}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });

  toolGrid.replaceChildren(...filtered.map(makeToolCard));
}

function renderFeatured() {
  latestTools.replaceChildren(...tools.slice(0, 3).map(makeFeaturedTool));
  hotTools.replaceChildren(...tools.slice(15, 18).map(makeFeaturedTool));
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
    return;
  }

  statusText.textContent = `${tool.title} 暂未接入后端接口。`;
  document.querySelector("#translator").scrollIntoView({ behavior: "smooth", block: "start" });
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
