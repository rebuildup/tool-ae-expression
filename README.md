# rebuildup/tool-ae-expression

Per-tool source-only repo for the After Effects Expression Helper. This
repo contributes the `tool-ae-expression` tool to the `my-web-2025`
host application via filesystem-relative import. It is **not** a
standalone app and **not** published to npm.

## Embed model

This repo lives at `Desktop/tool-ae-expression/` as a sibling of
`Desktop/my-web-2025/`. The host app imports `ToolWrapper` from
`../../../../src/components/tools-ui/ToolWrapper` (resolved against the
sibling layout). See `docs/adr/0002-architecture.md` for details.

## Documentation

- `docs/DEVELOPMENT.md` — internal development guide (Japanese)
- `docs/adr/` — Architecture Decision Records
- `AGENTS.md` — AI coding agent contract (dispatcher)