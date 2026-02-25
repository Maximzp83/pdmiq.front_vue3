# Static Image Path Rule

## Rule

For any files in `src/`, if a reference to `/static/img` is found, it must be replaced with `@/assets/img`.

Examples:

- `url('/static/img/background/header_background.jpg')` -> `url('@/assets/img/background/header_background.jpg')`
- `src="/static/img/icons/warning.svg"` -> `src="@/assets/img/icons/warning.svg"`

## Missing Files Policy

If a referenced file does not exist in `src/assets/img`, copy it from:

- `vue2_project/public/static/img/...`

into:

- `src/assets/img/...`
