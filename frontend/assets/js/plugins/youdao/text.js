const sourceText = document.querySelector("#sourceText");
const resultOutput = document.querySelector("#resultOutput");
const statusText = document.querySelector("#statusText");
const translateButton = document.querySelector("#translateButton");
const directionSelect = document.querySelector("#directionSelect");
const charCount = document.querySelector("#charCount");

const directions = [
  { label: "中文 » 英语", source: "zh-CHS", target: "en" },
  { label: "英语 » 中文", source: "en", target: "zh-CHS" },
  { label: "中文 » 日语", source: "zh-CHS", target: "ja" },
  { label: "日语 » 中文", source: "ja", target: "zh-CHS" },
  { label: "中文 » 韩语", source: "zh-CHS", target: "ko" },
  { label: "韩语 » 中文", source: "ko", target: "zh-CHS" },
  { label: "中文 » 法语", source: "zh-CHS", target: "fr" },
  { label: "法语 » 中文", source: "fr", target: "zh-CHS" },
  { label: "中文 » 俄语", source: "zh-CHS", target: "ru" },
  { label: "俄语 » 中文", source: "ru", target: "zh-CHS" },
  { label: "中文 » 西班牙语", source: "zh-CHS", target: "es" },
  { label: "西班牙语 » 中文", source: "es", target: "zh-CHS" },
  { label: "中文 » 葡萄牙语", source: "zh-CHS", target: "pt" },
  { label: "葡萄牙语 » 中文", source: "pt", target: "zh-CHS" },
  { label: "中文 » 越南语", source: "zh-CHS", target: "vi" },
  { label: "越南语 » 中文", source: "vi", target: "zh-CHS" },
  { label: "中文 » 德语", source: "zh-CHS", target: "de" },
  { label: "德语 » 中文", source: "de", target: "zh-CHS" },
  { label: "中文 » 印尼语", source: "zh-CHS", target: "id" },
  { label: "印尼语 » 中文", source: "id", target: "zh-CHS" },
];

function renderDirections() {
  directionSelect.replaceChildren(
    ...directions.map((direction, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = direction.label;
      return option;
    }),
  );
}

function updateCharCount() {
  charCount.textContent = `${sourceText.value.length} / 800`;
}

async function translate() {
  const text = sourceText.value.trim();
  if (!text) {
    statusText.textContent = "请输入要翻译的内容。";
    sourceText.focus();
    return;
  }

  translateButton.disabled = true;
  statusText.textContent = "正在请求普通翻译接口...";
  resultOutput.textContent = "";
  const direction = directions[Number(directionSelect.value)] || directions[0];

  try {
    const response = await fetch("/youdao/text-translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source: direction.source,
        target: direction.target,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "普通翻译请求失败");
    }

    resultOutput.textContent = data.text || "接口返回了空结果。";
    statusText.textContent = "普通翻译完成。";
  } catch (error) {
    statusText.textContent = error instanceof Error ? error.message : "普通翻译请求失败";
  } finally {
    translateButton.disabled = false;
  }
}

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
  renderDirections();
  updateCharCount();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
