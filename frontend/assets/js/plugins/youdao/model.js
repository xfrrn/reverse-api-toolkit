const sourceText = document.querySelector("#sourceText");
const resultOutput = document.querySelector("#resultOutput");
const statusText = document.querySelector("#statusText");
const translateButton = document.querySelector("#translateButton");
const sourceLang = document.querySelector("#sourceLang");
const targetLang = document.querySelector("#targetLang");
const modelName = document.querySelector("#modelName");
const promptText = document.querySelector("#promptText");
const charCount = document.querySelector("#charCount");
const swapLang = document.querySelector("#swapLang");

async function loadLanguageOptions() {
  sourceLang.disabled = true;
  targetLang.disabled = true;
  statusText.textContent = "正在加载模型翻译语言列表...";

  try {
    await window.YoudaoLanguageOptions.load("model_translate", sourceLang, targetLang, {
      source: "auto",
      target: "en",
    });
    statusText.textContent = "";
  } catch (error) {
    statusText.textContent = error instanceof Error ? error.message : "语言列表加载失败";
  } finally {
    sourceLang.disabled = false;
    targetLang.disabled = false;
  }
}

function updateCharCount() {
  charCount.textContent = `${sourceText.value.length} / 1000`;
}

async function translate() {
  const text = sourceText.value.trim();
  if (!text) {
    statusText.textContent = "请输入要翻译的内容。";
    sourceText.focus();
    return;
  }

  translateButton.disabled = true;
  statusText.textContent = `正在请求 ${modelName.value.toUpperCase()} 模型...`;
  resultOutput.textContent = "";

  try {
    const response = await fetch("/youdao/model-translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source: sourceLang.value,
        target: targetLang.value,
        model: modelName.value,
        prompt: promptText.value.trim(),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "模型翻译请求失败");
    }

    resultOutput.textContent = data.text || "接口返回了空结果。";
    statusText.textContent = "模型翻译完成。";
  } catch (error) {
    statusText.textContent = error instanceof Error ? error.message : "模型翻译请求失败";
  } finally {
    translateButton.disabled = false;
  }
}

swapLang.addEventListener("click", () => {
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

sourceText.addEventListener("input", updateCharCount);
translateButton.addEventListener("click", translate);

document.addEventListener("DOMContentLoaded", () => {
  loadLanguageOptions();
  updateCharCount();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
