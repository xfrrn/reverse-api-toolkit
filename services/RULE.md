# Services Code Rules

## Directory Layout

Each provider uses one package under `services/`, for example `services/youdao/`.

Use this structure:

```text
provider/
  api/          FastAPI routers and HTTP error mapping
  core/         constants, config, provider-specific exceptions
  interfaces/   upstream request implementations, grouped by feature
  models/       internal result dataclasses or domain models
  schemas/      Pydantic request/response schemas
  helpers/      small reusable parsing/encoding utilities
```

## Rules

- `main.py` only creates the app and registers provider routers.
- Put FastAPI `APIRouter`, route functions, and response streaming in `api/`.
- Put Pydantic models in `schemas/`; do not define them inside routers.
- Put upstream network calls in `interfaces/`; keep route handlers thin.
- Put endpoints, language maps, headers, and options in `core/config.py`.
- Put provider exceptions in `core/exceptions.py`.
- Do not add catch-all facade classes unless they provide real behavior.
- Keep new interfaces grouped by feature, e.g. `interfaces/text_translate.py`.
- Preserve public route paths unless explicitly asked to change them.
