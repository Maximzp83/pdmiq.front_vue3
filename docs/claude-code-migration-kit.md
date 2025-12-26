# Claude Code Migration Kit (Final, Aligned & Extended)

This document defines HOW Claude Code must operate during the Vue2 → Vue3 migration.
It extends and complements `claude-code-migration-plan.md` and is MANDATORY.

---

## 1. Sources of Truth (IMMUTABLE)

Claude Code MUST rely ONLY on the following documents:

1. claude-code-migration-plan.md — WHAT to do
2. claude-code-migration-kit.md — HOW to do it
3. migration-progress.md — CURRENT STATE

Forbidden:
- making decisions outside these documents
- inventing or redesigning architecture
- refactoring without explicit necessity

---

## 2. Hard Rules (STRICT)

Claude Code is STRICTLY FORBIDDEN to:

- copy legacy api / store / mixins / helpers as-is
- modify src/assets/* (except src/assets/img)
- modify src/constants/*
- modify src/helpers/*
- modify index.html
- modify vite.config.* unless explicitly required
- touch files marked as "READY"
- migrate the entire project in a single pass

Violation of any rule = migration error.

---

## 3. Mandatory Workflow (ITERATIVE ONLY)

Claude Code MUST work incrementally.

### One cycle = one chunk

Allowed chunk size:
- 1 API domain / file
- OR 1 Pinia store module
- OR 1–3 components
- OR 1 view
- OR 1 mixin → 1 composable

Anything larger is FORBIDDEN.

---

## 4. Chunk Execution Template (REQUIRED)

Before execution:

Migration chunk:
- Scope: <files>
- Dependencies: <api / store / composables>
- Risks: <list>

After execution:

Result:
- Files migrated: <list>
- API used: <list>
- Stores used: <list>
- TODOs / follow-ups: <if any>

After each chunk Claude Code MUST:
- update migration-progress.md
- STOP execution

---

## 5. Anti-Context-Overflow Rules

Claude Code MUST:

- re-read claude-code-migration-plan.md before every chunk
- re-read migration-progress.md before every chunk
- never load more than 3 files into context at once
- NEVER operate on the entire project

If context is insufficient — STOP AND ASK.

---

## 6. Enforced Architecture Rules

### API
- Use ONLY src/api
- Legacy logic → src/api/adapters or src/api/legacy
- Components and stores MUST NOT import legacy APIs directly

### Store
- Vuex → Pinia bridge
- Legacy modules → src/stores/legacy
- Public method interface MUST be preserved
- API calls MUST be moved out of stores into composables

### UI
- Element-UI is FORBIDDEN
- Element-Plus is MANDATORY
- Highcharts must use a modern Vue 3 compatible wrapper

---

## 7. Syntax Migration Rules (MANDATORY)

Required replacements:
- beforeDestroy → beforeUnmount
- this.$emit('input') → v-model
- slot="footer" → <template #footer>
- v-bind.sync → v-model
- filters → computed / functions
- require() → import
- module.exports → export

Prefer Composition API.
Options API is allowed ONLY if rewriting is unsafe.

---

## 8. Enforced Migration Order (CRITICAL)

Migration MUST follow this exact order:

1. API
2. Stores (Pinia, no API calls inside)
3. Composables
4. Components
5. Views
6. Cleanup & validation

Reordering is NOT allowed.

---

## 9. Session End Rules (MANDATORY)

Before stopping, Claude Code MUST:

- update migration-progress.md
- briefly describe the completed chunk
- explicitly STOP (no extra changes)

---

## 10. Recommended Start Command

Load claude-code-migration-plan.md and claude-code-migration-kit.md.
Continue from the first unchecked item in migration-progress.md.
Work strictly by chunks.
Ask before applying changes and show diffs.

---

## 11. Core Principle

It is always better to STOP and ASK
than to introduce an unnecessary refactor or architectural change.
