window.YoudaoLanguageOptions = {
  async load(group, sourceSelect, targetSelect, defaults) {
    const response = await fetch("/youdao/languages");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "语言列表读取失败");
    }

    const languages = data[group] || {};
    const entries = Object.entries(languages);
    if (!entries.length) {
      throw new Error("当前接口没有可用语言列表");
    }

    fillSelect(sourceSelect, entries, defaults.source, true);
    fillSelect(targetSelect, entries, defaults.target, false);
  },
};

function fillSelect(select, entries, selectedValue, includeAuto) {
  const options = entries
    .filter(([code]) => includeAuto || code !== "auto")
    .map(([code, name]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${name} (${code})`;
      option.selected = code === selectedValue;
      return option;
    });

  select.replaceChildren(...options);

  if (![...select.options].some((option) => option.selected)) {
    const fallback = [...select.options].find((option) => option.value === selectedValue) || select.options[0];
    if (fallback) {
      fallback.selected = true;
    }
  }
}
