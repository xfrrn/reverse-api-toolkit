TEXT_LANGUAGE_NAMES: dict[str, str] = {
    "auto": "自动检测",
    "zh-CHS": "中文",
    "en": "英语",
    "ja": "日语",
    "ko": "韩语",
    "fr": "法语",
    "ru": "俄语",
    "es": "西班牙语",
    "pt": "葡萄牙语",
    "vi": "越南语",
    "de": "德语",
    "id": "印尼语",
}

TEXT_TRANSLATE_ENDPOINT = "https://aidemo.youdao.com/trans"
MODEL_TRANSLATE_ENDPOINT = "https://aidemo.youdao.com/llmTrans"

DEFAULT_HEADERS: dict[str, str] = {
    "Origin": "https://ai.youdao.com",
    "Referer": "https://ai.youdao.com/",
    "User-Agent": "Mozilla/5.0",
}

MODEL_LANGUAGE_NAMES: dict[str, str] = {
    "auto": "自动识别",
    "zh-CHS": "中文",
    "en": "英语",
    "ko": "韩语",
    "ja": "日语",
    "fr": "法语",
    "ru": "俄语",
    "es": "西班牙语",
    "pt": "葡萄牙语",
    "hi": "印地语",
    "ar": "阿拉伯语",
    "da": "丹麦语",
    "de": "德语",
    "fi": "芬兰语",
    "it": "意大利语",
    "ms": "马来语",
    "nl": "荷兰语",
    "sv": "瑞典语",
    "th": "泰语",
    "uk": "乌克兰语",
    "vi": "越南语",
    "zh-CHT": "繁体中文",
    "bs": "波斯尼亚语",
    "ca": "加泰隆语",
    "et": "爱沙尼亚语",
    "hu": "匈牙利语",
    "id": "印度尼西亚语",
    "no": "挪威语",
    "pl": "波兰语",
    "ro": "罗马尼亚语",
    "tr": "土耳其语",
    "eo": "世界语",
    "tl": "菲律宾语",
    "kk": "哈萨克语",
    "km": "高棉语",
    "my": "缅甸语",
    "ne": "尼泊尔语",
    "bo": "藏语",
    "ug": "维语",
    "nob": "书面挪威语",
    "nno": "新挪威语",
}

LANGUAGE_ALIASES: dict[str, str] = {
    "zh": "zh-CHS",
    "chinese": "zh-CHS",
    "english": "en",
    "japanese": "ja",
    "korean": "ko",
    "french": "fr",
    "russian": "ru",
    "spanish": "es",
    "portuguese": "pt",
    "hindi": "hi",
    "arabic": "ar",
    "german": "de",
    "italian": "it",
    "thai": "th",
    "vietnamese": "vi",
}

MODEL_OPTIONS: dict[str, str] = {
    "lite": "3",
    "pro": "0",
}


def normalize_language(value: str, language_names: dict[str, str]) -> str:
    lookup = {
        **{code: code for code in language_names},
        **{name: code for code, name in language_names.items()},
        **LANGUAGE_ALIASES,
    }
    key = value.strip()
    code = lookup.get(key) or lookup.get(key.lower())
    if not code or code not in language_names:
        choices = ", ".join(language_names)
        raise ValueError(f"unsupported language {value!r}; available codes: {choices}")
    return code


def normalize_model(value: str) -> str:
    model = MODEL_OPTIONS.get(value.strip().lower())
    if not model:
        raise ValueError("model must be 'lite' or 'pro'")
    return model
