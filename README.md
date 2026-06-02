# reverse-api-toolkit

一个基于 FastAPI 的逆向接口封装工具，用来把网页中抓取到的网络请求整理成可直接调用的 API 服务。

当前主要封装有道翻译相关接口，后续可以继续扩展更多平台和更多类型的请求。

## 功能

- 普通文本翻译：支持原文语种、目标语种参数。
- 大模型翻译：支持 `lite` / `pro` 模型选项。
- 流式翻译：支持按增量结果返回大模型翻译内容。
- 语言列表查询：可查看当前接口支持的语言代码。
- 多平台扩展：后续可继续添加其它网站或服务商的逆向接口。

## 环境要求

- Python 3.11+
- uv

## 启动

```bash
uv sync
uv run uvicorn main:app --host 127.0.0.1 --port 8000
```

启动后访问接口文档：`http://127.0.0.1:8000/docs`

## 接口示例

### 有道普通文本翻译

```bash
curl -X POST http://127.0.0.1:8000/youdao/text-translate \
  -H "Content-Type: application/json" \
  -d '{"text":"你好","source":"zh-CHS","target":"en"}'
```

### 有道大模型翻译

```bash
curl -X POST http://127.0.0.1:8000/youdao/model-translate \
  -H "Content-Type: application/json" \
  -d '{"text":"你好","source":"zh-CHS","target":"en","model":"lite"}'
```

### 有道大模型流式翻译

```bash
curl -N -X POST http://127.0.0.1:8000/youdao/model-translate/stream \
  -H "Content-Type: application/json" \
  -d '{"text":"你好，世界","source":"zh-CHS","target":"en"}'
```

### 查看语言列表

```bash
curl http://127.0.0.1:8000/youdao/languages
```

## 说明

本项目封装的是从网页网络请求中提取出的接口，仅用于学习、调试和个人研究。使用时请遵守目标网站的服务条款和访问频率限制。
