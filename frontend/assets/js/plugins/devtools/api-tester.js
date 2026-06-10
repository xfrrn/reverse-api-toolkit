(function () {
  "use strict";

  var STORAGE_KEY = "devtools_api_tester";

  /* ── Marketplace models (shared for OpenAI-compatible endpoints) ── */
  var CHAT_MODELS = [
    /* OpenAI */
    "gpt-5.2", "gpt-5.1", "gpt-5.1-mini", "gpt-5",
    "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano",
    "gpt-4o", "gpt-4o-mini",
    "gpt-4-turbo", "gpt-4", "gpt-4-32k",
    "gpt-3.5-turbo", "gpt-3.5-turbo-16k",
    "o4-mini", "o3", "o3-mini", "o1", "o1-mini",
    /* Anthropic (Claude API) */
    "claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5",
    "claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5",
    "claude-3.7-sonnet", "claude-3.5-sonnet", "claude-3.5-haiku", "claude-3-opus",
    /* Google Gemini */
    "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite",
    "gemini-2.0-flash", "gemini-2.0-flash-lite",
    "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.5-flash-8b",
    /* DeepSeek */
    "deepseek-v3.1", "deepseek-v3.1-terminus",
    "deepseek-v3", "deepseek-r1", "deepseek-v3-0324", "deepseek-r1-0528",
    "deepseek-chat", "deepseek-reasoner","deepseek-v4-pro", "deepseek-v4-flash",
    /* Qwen / Alibaba */
    "qwen3-235b-a22b", "qwen3-32b", "qwen3-14b", "qwen3-8b", "qwen3-4b", "qwen3-1.7b",
    "qwen-max", "qwen-plus", "qwen-turbo",
    "qwen2.5-72b", "qwen2.5-32b", "qwen2.5-14b", "qwen2.5-7b",
    "qwq-32b",
    /* Moonshot / Kimi */
    "moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k",
    "kimi-latest",
    /* Zhipu / GLM */
    "glm-4.6", "glm-4.5", "glm-4-plus", "glm-4-air", "glm-4-flash", "glm-4-long",
    "glm-4v-plus", "glm-4v-flash",
    /* 01.AI / Yi */
    "yi-large", "yi-medium", "yi-lightning", "yi-vision",
    /* ByteDance / Doubao */
    "doubao-pro-256k", "doubao-lite-128k",
    "doubao-vision-pro-32k",
    /* MiniMax */
    "abab7", "abab6.5s", "minimax-m1",
    /* Baidu / ERNIE */
    "ernie-4.5", "ernie-4.0-turbo-8k", "ernie-3.5-8k", "ernie-speed-8k", "ernie-lite-8k",
    /* Tencent / Hunyuan */
    "hunyuan-turbos-latest", "hunyuan-lite", "hunyuan-standard", "hunyuan-pro",
    /* xAI / Grok */
    "grok-4", "grok-3",
    /* Meta / Llama (via Groq/Together) */
    "llama-4-maverick", "llama-4-scout",
    "llama-3.3-70b", "llama-3.2-90b", "llama-3.1-405b", "llama-3.1-70b", "llama-3.1-8b",
    /* Mistral */
    "mistral-large", "mistral-medium", "mistral-small",
    "mixtral-8x22b", "mixtral-8x7b",
    /* Cohere */
    "command-r-plus", "command-r", "command",
  ];

  var PRESETS = {
    openai: {
      url: "https://api.openai.com/v1",
      pathSuffix: "/chat/completions",
      method: "POST",
      headers: '{\n  "Content-Type": "application/json"\n}',
      bodyTemplate: function (model) {
        return JSON.stringify({
          model: model,
          messages: [{ role: "user", content: "Hello, are you working?" }],
          max_tokens: 50,
        }, null, 2);
      },
      models: CHAT_MODELS,
      defaultModel: "gpt-4o",
      keyHeaderName: "Authorization",
      keyHeaderTemplate: "Bearer ${KEY}",
      headerHint: "Authorization: Bearer <key>",
    },
    claude: {
      url: "https://api.anthropic.com/v1",
      pathSuffix: "/messages",
      method: "POST",
      headers: '{\n  "Content-Type": "application/json",\n  "anthropic-version": "2023-06-01"\n}',
      bodyTemplate: function (model) {
        return JSON.stringify({
          model: model,
          max_tokens: 50,
          messages: [{ role: "user", content: "Hello, are you working?" }],
        }, null, 2);
      },
      models: [
        "claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5",
        "claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5",
        "claude-3.7-sonnet", "claude-3.5-sonnet", "claude-3.5-haiku", "claude-3-opus",
      ],
      defaultModel: "claude-sonnet-4-6",
      keyHeaderName: "x-api-key",
      keyHeaderTemplate: "${KEY}",
      headerHint: "x-api-key: <key>",
    },
    custom: {
      url: "",
      pathSuffix: null,
      method: "POST",
      headers: '{\n  "Content-Type": "application/json"\n}',
      bodyTemplate: function (model) {
        return JSON.stringify({
          model: model,
          messages: [{ role: "user", content: "Hello" }],
        }, null, 2);
      },
      models: CHAT_MODELS,
      defaultModel: "",
      keyHeaderName: "Authorization",
      keyHeaderTemplate: "Bearer ${KEY}",
      headerHint: "",
    },
  };

  /* ── DOM refs ── */
  var apiUrl = document.querySelector("#apiUrl");
  var apiKey = document.querySelector("#apiKey");
  var modelInput = document.querySelector("#modelInput");
  var modelList = document.querySelector("#modelList");
  var timeoutInput = document.querySelector("#timeout");
  var customHeaders = document.querySelector("#customHeaders");
  var requestBody = document.querySelector("#requestBody");
  var testButton = document.querySelector("#testButton");
  var statusText = document.querySelector("#statusText");
  var resultOutput = document.querySelector("#resultOutput");
  var copyResponse = document.querySelector("#copyResponse");
  var clearResponse = document.querySelector("#clearResponse");
  var quickEndpoints = document.querySelector("#quickEndpoints");
  var urlSuffixHint = document.querySelector("#urlSuffixHint");

  var activePreset = null;
  var userEditedHeaders = false;
  var userEditedBody = false;

  /* ── Persistence ── */
  function saveState() {
    var state = {
      preset: activePreset,
      url: apiUrl.value,
      key: apiKey.value,
      model: modelInput.value,
      timeout: timeoutInput.value,
      headers: customHeaders.value,
      body: requestBody.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var state = JSON.parse(raw);
      if (state.preset) applyPreset(state.preset, { restore: state });
    } catch (_) { /* corrupted storage, ignore */ }
  }

  /* ── Populate model datalist ── */
  function populateModels(models, defaultModel, restoreModel) {
    var val = restoreModel || defaultModel;
    modelList.innerHTML = "";
    models.forEach(function (m) {
      var opt = document.createElement("option");
      opt.value = m;
      modelList.appendChild(opt);
    });
    modelInput.value = val;
    modelInput.placeholder = models.length ? "选择或输入模型名称…" : "输入自定义模型…";
  }

  /* ── Rebuild body from template ── */
  function rebuildBody() {
    var preset = PRESETS[activePreset];
    if (!preset) return;
    var model = modelInput.value || preset.defaultModel;
    requestBody.value = preset.bodyTemplate(model);
  }

  /* ── Clear result panel ── */
  function clearResult() {
    resultOutput.className = "result-output empty-result";
    resultOutput.style.display = "";
    resultOutput.textContent = "等待测试请求";
    statusText.textContent = "";
  }

  /* ── Apply preset ── */
  function applyPreset(name, opts) {
    var preset = PRESETS[name];
    if (!preset) return;
    activePreset = name;
    userEditedHeaders = false;
    userEditedBody = false;

    var restore = (opts && opts.restore) || {};
    apiUrl.value = restore.url !== undefined ? restore.url : preset.url;
    apiKey.value = restore.key !== undefined ? restore.key : "";
    timeoutInput.value = restore.timeout !== undefined ? restore.timeout : "30";

    populateModels(preset.models, preset.defaultModel, restore.model);

    customHeaders.value = restore.headers !== undefined ? restore.headers : preset.headers;
    requestBody.value = restore.body !== undefined ? restore.body : preset.bodyTemplate(restore.model || preset.defaultModel);

    /* Update URL suffix hint */
    urlSuffixHint.textContent = preset.pathSuffix ? preset.pathSuffix : "";

    quickEndpoints.querySelectorAll(".quick-endpoint").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.preset === name);
    });

    /* Only clear result on user-initiated preset switches, not page-load restore */
    if (!opts || !opts.restore) {
      clearResult();
    }
    saveState();
  }

  quickEndpoints.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-preset]");
    if (!btn) return;
    applyPreset(btn.dataset.preset);
  });

  /* ── Model change rebuilds body ── */
  modelInput.addEventListener("input", function () {
    if (!userEditedBody) {
      rebuildBody();
    }
    saveState();
  });

  /* ── Track manual edits ── */
  customHeaders.addEventListener("input", function () {
    userEditedHeaders = true;
    saveState();
  });
  requestBody.addEventListener("input", function () {
    userEditedBody = true;
    saveState();
  });

  /* ── Autosave for other fields ── */
  [apiUrl, apiKey, modelInput, timeoutInput].forEach(function (el) {
    el.addEventListener("input", saveState);
    el.addEventListener("change", saveState);
  });

  /* ── Resolve headers ── */
  function resolveHeaders() {
    var headers = {};
    var key = apiKey.value.trim();
    var preset = PRESETS[activePreset];

    /* Auto-inject key header */
    if (preset && preset.keyHeaderName && key) {
      headers[preset.keyHeaderName] = preset.keyHeaderTemplate.replace("${KEY}", key);
    }

    /* Merge custom headers from textarea */
    try {
      var extra = JSON.parse(customHeaders.value || "{}");
      if (typeof extra === "object" && extra !== null) {
        Object.keys(extra).forEach(function (k) {
          headers[k] = extra[k];
        });
      }
    } catch (_) { /* ignore bad JSON */ }

    return headers;
  }

  /* ── Normalize URL with path suffix ── */
  function normalizeUrl(rawUrl) {
    var url = rawUrl.trim();
    var preset = PRESETS[activePreset];
    if (!preset || !preset.pathSuffix) return url;

    /* Strip trailing slash from user input */
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    /* Avoid double-appending */
    var suffix = preset.pathSuffix;
    if (url.endsWith(suffix)) return url;

    return url + suffix;
  }

  /* ── Test request ── */
  function validateForm() {
    if (!apiUrl.value.trim()) {
      statusText.textContent = "请输入请求 URL";
      return false;
    }
    var resolved = normalizeUrl(apiUrl.value);
    try { new URL(resolved); } catch (_) {
      statusText.textContent = "URL 格式无效";
      return false;
    }
    var timeout = parseInt(timeoutInput.value, 10);
    if (isNaN(timeout) || timeout < 1 || timeout > 120) {
      statusText.textContent = "超时请设置在 1-120 秒之间";
      return false;
    }
    if (requestBody.value.trim()) {
      try { JSON.parse(requestBody.value); } catch (_) {
        statusText.textContent = "请求 Body 不是有效 JSON";
        return false;
      }
    }
    return true;
  }

  testButton.addEventListener("click", function () {
    if (!validateForm()) return;

    var url = normalizeUrl(apiUrl.value);
    var preset = PRESETS[activePreset];
    var method = (preset && preset.method) || "POST";
    var timeoutMs = parseInt(timeoutInput.value, 10) * 1000;
    var headers = resolveHeaders();
    var body = requestBody.value.trim() || undefined;

    statusText.textContent = "请求中…";
    testButton.disabled = true;

    var startTime = performance.now();
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);

    fetch(url, {
      method: method,
      headers: headers,
      body: body,
      signal: controller.signal,
    })
      .then(function (response) {
        clearTimeout(timer);
        var latency = Math.round(performance.now() - startTime);
        return response.text().then(function (text) {
          return { status: response.status, statusText: response.statusText, latency: latency, body: text };
        });
      })
      .then(function (result) {
        renderResult(result);
        statusText.textContent = "";
        testButton.disabled = false;
      })
      .catch(function (err) {
        clearTimeout(timer);
        var latency = Math.round(performance.now() - startTime);
        if (err.name === "AbortError") {
          renderError("请求超时（" + timeoutInput.value + " 秒）", latency);
          statusText.textContent = "请求超时";
        } else {
          renderError(err.message || "网络错误", latency);
          statusText.textContent = "请求失败";
        }
        testButton.disabled = false;
      });
  });

  /* ── Render results ── */
  function renderResult(result) {
    var ok = result.status >= 200 && result.status < 300;
    var badgeClass = ok ? "success" : "error";
    var badgeText = ok ? "连通" : result.status;

    var parsedBody = result.body;
    try {
      var json = JSON.parse(result.body);
      parsedBody = JSON.stringify(json, null, 2);
    } catch (_) { /* not JSON, keep raw */ }

    resultOutput.className = "result-output";
    resultOutput.style.display = "";
    resultOutput.innerHTML =
      '<div class="result-status-line">' +
        '<span class="status-badge ' + badgeClass + '">' + escapeHtml(badgeText) + '</span>' +
        '<span class="latency-text">' + result.latency + 'ms</span>' +
        '<span class="latency-text">' + escapeHtml(result.statusText) + '</span>' +
      "</div>" +
      '<pre class="response-json">' + escapeHtml(parsedBody) + "</pre>";
  }

  function renderError(message, latency) {
    resultOutput.className = "result-output error-result";
    resultOutput.style.display = "";
    resultOutput.innerHTML =
      '<div style="margin-bottom:10px;font-weight:700;">请求失败</div>' +
      '<div>' + escapeHtml(message) + '</div>' +
      (latency ? '<div style="margin-top:8px;color:var(--muted);font-size:12px;">耗时 ' + latency + 'ms</div>' : "");
  }

  /* ── Actions ── */
  copyResponse.addEventListener("click", function () {
    var pre = resultOutput.querySelector(".response-json");
    var text = pre ? pre.textContent : "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      statusText.textContent = "已复制";
      setTimeout(function () { statusText.textContent = ""; }, 1500);
    }).catch(function () {
      statusText.textContent = "复制失败";
    });
  });

  clearResponse.addEventListener("click", function () {
    resultOutput.className = "result-output empty-result";
    resultOutput.style.display = "";
    resultOutput.textContent = "等待测试请求";
  });

  /* ── Helpers ── */
  function escapeHtml(str) {
    var s = String(str);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ── Init ── */
  loadState();
  if (!activePreset) {
    applyPreset("openai");
  }
})();
