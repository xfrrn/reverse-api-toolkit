const ALL_CATEGORY = "全部";
const TEXT_CATEGORY = "文本工具";

const plugins = [
  {
    title: "有道翻译",
    desc: "集成普通翻译、模型翻译和语言列表查询",
    category: TEXT_CATEGORY,
    badge: "译",
    color: "blue",
    url: "/plugins/youdao",
  },
];

let activeCategory = new URLSearchParams(window.location.search).get("category") || ALL_CATEGORY;

const pluginGrid = document.querySelector("#pluginGrid");
const searchInput = document.querySelector("#searchInput");
const categoryEyebrow = document.querySelector("#categoryEyebrow");
const categoryTitle = document.querySelector("#categoryTitle");

function badgeClass(color) {
  return ["green", "orange"].includes(color) ? color : "";
}

function makeBadge(plugin) {
  return `
    <div class="tool-badge ${badgeClass(plugin.color)}" aria-hidden="true">
      <span>${plugin.badge}</span>
    </div>
  `;
}

function makePluginCard(plugin) {
  const link = document.createElement("a");
  link.className = "plugin-card";
  link.href = plugin.url;
  link.innerHTML = `
    ${makeBadge(plugin)}
    <div>
      <h3>${plugin.title}</h3>
      <p>${plugin.desc}</p>
      <span class="plugin-category">${plugin.category}</span>
    </div>
    <i class="plugin-arrow" data-lucide="chevron-right"></i>
  `;
  return link;
}

function makeEmptyState() {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "暂无插件";
  return empty;
}

function getFilteredPlugins() {
  const query = searchInput.value.trim().toLowerCase();
  return plugins.filter((plugin) => {
    const categoryMatch = activeCategory === ALL_CATEGORY || plugin.category === activeCategory;
    const queryMatch = !query || `${plugin.title}${plugin.desc}${plugin.category}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
}

function renderCatalog() {
  const filtered = getFilteredPlugins();
  categoryEyebrow.textContent = activeCategory === ALL_CATEGORY ? "全部插件" : activeCategory;
  categoryTitle.textContent = activeCategory === ALL_CATEGORY ? "插件展示" : "分类插件";
  pluginGrid.replaceChildren(...(filtered.length ? filtered.map(makePluginCard) : [makeEmptyState()]));
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setActiveCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".category").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === category);
  });
  renderCatalog();
}

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => setActiveCategory(button.dataset.category));
});

searchInput.addEventListener("input", renderCatalog);

document.querySelector("#backTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", () => {
  setActiveCategory(activeCategory);
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
