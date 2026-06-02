const languageGroups = document.querySelector("#languageGroups");
const statusText = document.querySelector("#statusText");
const refreshButton = document.querySelector("#refreshButton");
const textCount = document.querySelector("#textCount");
const modelCount = document.querySelector("#modelCount");

const groupNames = {
  text_translate: "普通翻译语言",
  text_translate_directions: "普通翻译支持语向",
  model_translate: "模型翻译语言",
};

function makeLanguageCard(code, name) {
  const card = document.createElement("article");
  card.className = "language-card-item";
  card.innerHTML = `
    <strong>${name}</strong>
    <span>${code}</span>
  `;
  return card;
}

function makeGroup(key, languages) {
  const entries = Object.entries(languages || {});
  const section = document.createElement("section");
  section.className = "language-group";
  section.innerHTML = `
    <div class="language-group-title">
      <h3>${groupNames[key] || key}</h3>
      <span>${entries.length} 种</span>
    </div>
    <div class="language-list"></div>
  `;

  const list = section.querySelector(".language-list");
  list.replaceChildren(...entries.map(([code, name]) => makeLanguageCard(code, name)));
  return section;
}

function makeDirectionCard(direction) {
  const card = document.createElement("article");
  card.className = "language-card-item direction-card-item";
  card.innerHTML = `
    <strong>${direction.label}</strong>
    <span>${direction.source} → ${direction.target}</span>
  `;
  return card;
}

function makeDirectionGroup(directions) {
  const section = document.createElement("section");
  section.className = "language-group";
  section.innerHTML = `
    <div class="language-group-title">
      <h3>${groupNames.text_translate_directions}</h3>
      <span>${directions.length} 个</span>
    </div>
    <div class="language-list"></div>
  `;

  section.querySelector(".language-list").replaceChildren(...directions.map(makeDirectionCard));
  return section;
}

async function loadLanguages() {
  refreshButton.disabled = true;
  statusText.textContent = "正在读取语言列表...";
  languageGroups.replaceChildren();

  try {
    const response = await fetch("/youdao/languages");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "语言列表读取失败");
    }

    const textLanguages = data.text_translate || {};
    const textDirections = data.text_translate_directions || [];
    const modelLanguages = data.model_translate || {};
    textCount.textContent = textDirections.length;
    modelCount.textContent = Object.keys(modelLanguages).length;
    languageGroups.replaceChildren(
      makeDirectionGroup(textDirections),
      makeGroup("model_translate", modelLanguages),
    );
    statusText.textContent = "语言列表读取完成。";
  } catch (error) {
    textCount.textContent = "-";
    modelCount.textContent = "-";
    statusText.textContent = error instanceof Error ? error.message : "语言列表读取失败";
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadLanguages);

document.addEventListener("DOMContentLoaded", () => {
  loadLanguages();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
