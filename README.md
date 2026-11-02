# rebuildup/tool-ae-expression

Per-tool repo for the After Effects Expression Helper. The tool ships as a
**standalone static SPA** that the `my-web-2026` Tool Registry embeds as a
`same_origin_static` iframe. It is **not** published to npm.

## Embed model

`pnpm run build` emits a self-contained bundle in `dist/`. The host serves
that directory from its own origin under `/tools/ae-expression/app/` and
frames it with `sandbox="allow-scripts"`, so the artefact must not depend
on a host runtime and must not contact a third-party origin.

Consequences of that contract, all verified by this repo's own gates:

- No `next/*` import and no host-repository import. The tool owns its
  shell (`src/components/ToolWrapper.tsx`).
- Every asset reference in `dist/index.html` is relative (`./assets/...`),
  because the artefact is served from a sub-path.
- `localStorage` and `navigator.clipboard` are both unavailable or
  rejecting in that sandbox, so both have an in-memory / `execCommand`
  fallback.
- The artefact contacts zero third-party origins (no web font, no CDN).

## Development

```sh
pnpm install
pnpm run dev        # local dev server
pnpm run type-check # tsc --noEmit
pnpm run build      # emits dist/
pnpm run preview    # serve the built artefact
```

See `docs/DEVELOPMENT.md` for the internal guide and `docs/adr/` for the
architecture decisions.

## Documentation

- `docs/DEVELOPMENT.md` — internal development guide (Japanese)
- `docs/adr/` — Architecture Decision Records
- `AGENTS.md` — AI coding agent contract (dispatcher)
