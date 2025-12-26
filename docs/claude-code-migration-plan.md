# Vue2 → Vue3 Migration Plan (Claude Code)

## 0. Global Goal

Migrate the project from `./vue2_project/` into the main Vue 3 project
(Vite, Element Plus, Highcharts), using the already existing new
architecture modules located in:

- src/api
- src/stores
- src/composables
- src/components
- src/views

Migration must be incremental and non-destructive.
Already migrated parts of the project must NOT be broken or rewritten.

---

## 1. Global Migration Rules (IMMUTABLE)

### 1.1 Use the new project core

All migrated files MUST:

- use API modules from `src/api`
- use Pinia stores from `src/stores`
- use composables from `src/composables`
- use base components from `src/components`
- use the new page architecture from `src/views`

❗ Forbidden:
- copying old `api/`, `store/`, `helpers/`, `mixins/`, `plugins` as-is
- reintroducing Vue2-style architecture

Old logic must be ADAPTED using existing new project scaffolding.

 - use Promise syntax for async operations
 - use router from src/router

---

### 1.2 File and folder mapping

| Vue2 location | Vue3 location |
|--------------|--------------|
| vue2_project/src/components/* | src/components/ |
| vue2_project/src/views/* | src/views/ |
| vue2_project/src/mixins/* | src/composables/ |
| vue2_project/src/api/*.js | src/api/adapters/ |
| vue2_project/src/store/* | src/stores/ |
| vue2_project/src/helpers/* | src/utils/ |
| vue2_project/static/img/* | src/assets/img/ |

---

### 1.3 Asset path conversion

Automatically replace asset paths:

@/static/img/...
~/static/img/...
/static/img/...

@/assets/img/...



Images must be physically moved from:

- vue2_project/public/static/img
- vue2_project/static/img

into:

- src/assets/img/

---

### 1.4 Assets protection rule

Files in `src/assets/*` MUST NOT be modified,
except for adding images into `src/assets/img`.

Files in `src/constants/*` MUST NOT be modified,
Files in `src/helpers/*` MUST NOT be modified,

---

## 2. Component Migration Rules

### 2.1 Vue syntax migration

- Convert `.vue` files to Vue 3 syntax
- Prefer Composition API
- Remove Options API

Replace legacy patterns:

| Vue2 | Vue3 |
|----|----|
| this.$emit('input', ...) | v-model |
| slot syntax | v-slot |
| beforeDestroy | beforeUnmount |
| .native | native events |
| filters | functions / computed |
| v-bind.sync | new v-model |

---

### 2.2 Element UI → Element Plus

- Replace Element-UI with Element-Plus
- Compatible components may stay unchanged
- Update dialog headers and slot syntax
- Replace `slot="footer"` with `<template #footer>`

---

### 2.3 Highcharts

- Ensure modern `highcharts` package is used
- Replace legacy `highcharts-vue` wrapper if present
- Use the current Vue 3 compatible wrapper

---

## 3. API Migration

### 3.1 API architecture rules

- DO NOT copy old axios instances
- Use existing HTTP client from `src/api`

---

4. Store Migration
4.1 Vuex → Pinia 

Convert each module into a Pinia store

Preserve method names (public interface)

Rewrite implementation using:

new Pinia stores

exclude all api actions to the components using composables

- Use as template from existing stores in src/stores

4.2 Use existing Pinia scaffolding
If a store already exists in src/stores,
extend or reuse it instead of creating duplicates.

5. Mixins → Composables
Copy legacy mixins from vue2_project/src/mixins

Rewrite them as composables:

js

export function useExample() {
  // logic
}
Place them in src/composables

6. Protected Files (DO NOT TOUCH)
Claude Code MUST NOT modify:

src/assets/* (except adding images)

index.html

Vite configuration (unless Element Plus import is required)

any files explicitly marked as "ready"

7. Automatic Cleanup & Standardization
After migration:

remove unused imports

replace require() → import

replace module.exports → export

format code using project prettier / eslint rules

8. Execution Order (Agent Workflow)
Phase 1 — Structure migration
move components

move views

move utils / helpers

move static assets

Phase 2 — Syntax migration
Vue2 → Vue3 syntax

Element UI → Element Plus

Highcharts

Phase 3 — Integration

Pinia integration

Phase 4 — Dead code removal
Phase 5 — Test builds
Agent Instructions
Execute steps incrementally

Ask before applying changes

Show diffs for every step

Never modify unrelated files