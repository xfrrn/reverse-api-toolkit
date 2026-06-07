const videoLink = document.querySelector("#videoLink");
const localeSelect = document.querySelector("#localeSelect");
const timezoneInput = document.querySelector("#timezoneInput");
const parseButton = document.querySelector("#parseButton");
const statusText = document.querySelector("#statusText");
const resultOutput = document.querySelector("#resultOutput");
const copySummary = document.querySelector("#copySummary");

let lastSummaryText = "";

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function setStatus(text) {
  statusText.textContent = text;
}

function clearResult() {
  lastSummaryText = "";
  resultOutput.className = "result-output empty-result";
  resultOutput.textContent = "等待解析结果";
}

function showError(message) {
  lastSummaryText = "";
  resultOutput.className = "result-output error-result";
  resultOutput.textContent = message;
}

function makeIcon(name) {
  const icon = document.createElement("i");
  icon.dataset.lucide = name;
  return icon;
}

function makeChip(text) {
  const chip = document.createElement("span");
  chip.textContent = text;
  return chip;
}

function mediaTypeName(type) {
  const names = {
    video: "视频",
    audio: "音频",
    image: "图片",
  };
  return names[type] || type || "未知";
}

function getDetailMessage(data, response) {
  const detail = data && data.detail;
  if (response.status === 429 || detail?.upstream_code === "ShowLimitTip") {
    return "上游冷却中，请稍后再试";
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (detail && typeof detail.message === "string") {
    return detail.message;
  }
  return "视频解析请求失败";
}

async function copyText(text, successMessage) {
  if (!text) {
    setStatus("没有可复制的内容");
    return;
  }
  await navigator.clipboard.writeText(text);
  setStatus(successMessage);
}

function makeActionButton(label, icon, onClick) {
  const button = document.createElement("button");
  button.className = "copy-link";
  button.type = "button";
  button.append(makeIcon(icon), document.createTextNode(label));
  button.addEventListener("click", onClick);
  return button;
}

function makeOpenLink(url) {
  const link = document.createElement("a");
  link.className = "small-link";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(makeIcon("external-link"), document.createTextNode("打开链接"));
  return link;
}

function makeSummary(data) {
  const card = document.createElement("section");
  card.className = "summary-card";

  const title = document.createElement("h3");
  title.textContent = data.text || "未返回标题";

  const meta = document.createElement("div");
  meta.className = "summary-meta";
  meta.append(
    makeChip(`媒体 ${Array.isArray(data.medias) ? data.medias.length : 0}`),
    makeChip(`海外 ${data.overseas ?? "未知"}`),
  );

  card.append(title, meta);
  return card;
}

function getPrimaryUrl(media) {
  return media.resource_url || media.video_url || media.audio_url || media.image_url || "";
}

function makeFormatRows(formats) {
  const list = document.createElement("div");
  list.className = "format-list";

  formats.forEach((format, index) => {
    const url = format.video_url || format.audio_url || format.resource_url || "";
    if (!url) {
      return;
    }

    const row = document.createElement("div");
    row.className = "format-row";

    const quality = document.createElement("span");
    quality.className = "format-quality";
    quality.textContent = format.quality_note || format.quality || `格式 ${index + 1}`;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "打开格式链接";

    row.append(quality, link);
    list.append(row);
  });

  return list;
}

function makeMediaCard(media, index) {
  const card = document.createElement("article");
  card.className = "media-card";

  const header = document.createElement("div");
  header.className = "media-card-header";

  const headingWrap = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = `媒体 ${index + 1}`;
  const meta = document.createElement("div");
  meta.className = "media-meta";
  meta.append(makeChip(mediaTypeName(media.media_type)));
  headingWrap.append(heading, meta);

  const url = getPrimaryUrl(media);
  const actions = document.createElement("div");
  actions.className = "media-actions";
  if (url) {
    actions.append(
      makeActionButton("复制", "copy", () => copyText(url, "媒体链接已复制")),
      makeOpenLink(url),
    );
  }

  header.append(headingWrap, actions);
  card.append(header);

  if (url) {
    const resource = document.createElement("code");
    resource.className = "resource-url";
    resource.textContent = url;
    card.append(resource);
  }

  if (Array.isArray(media.formats) && media.formats.length) {
    const formats = makeFormatRows(media.formats);
    if (formats.children.length) {
      card.append(formats);
    }
  }

  return card;
}

function renderResult(data) {
  const medias = Array.isArray(data.medias) ? data.medias : [];
  lastSummaryText = [
    data.text || "未返回标题",
    `媒体数量: ${medias.length}`,
    `overseas: ${data.overseas ?? "未知"}`,
    ...medias.map((media, index) => `媒体 ${index + 1}: ${media.media_type || "unknown"} ${getPrimaryUrl(media)}`),
  ].join("\n");

  resultOutput.className = "result-output";
  resultOutput.replaceChildren(makeSummary(data), ...medias.map(makeMediaCard));

  if (!medias.length) {
    const empty = document.createElement("div");
    empty.className = "empty-result";
    empty.textContent = "接口未返回媒体资源";
    resultOutput.append(empty);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

async function parseVideo() {
  const link = videoLink.value.trim();
  if (!link) {
    setStatus("请输入视频链接");
    videoLink.focus();
    return;
  }
  if (!isHttpUrl(link)) {
    setStatus("请输入 http 或 https 开头的视频链接");
    videoLink.focus();
    return;
  }

  parseButton.disabled = true;
  setStatus("正在解析视频链接...");
  resultOutput.className = "result-output empty-result";
  resultOutput.textContent = "解析中";

  try {
    const response = await fetch("/snapany/video-parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link,
        locale: localeSelect.value,
        timezone: timezoneInput.value.trim() || "Asia/Shanghai",
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(getDetailMessage(data, response));
    }

    renderResult(data);
    setStatus("解析完成");
  } catch (error) {
    const message = error instanceof Error ? error.message : "视频解析请求失败";
    showError(message);
    setStatus(message);
  } finally {
    parseButton.disabled = false;
  }
}

parseButton.addEventListener("click", parseVideo);
copySummary.addEventListener("click", () => copyText(lastSummaryText, "摘要已复制"));
videoLink.addEventListener("input", () => {
  if (!videoLink.value.trim()) {
    clearResult();
    setStatus("");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  clearResult();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
