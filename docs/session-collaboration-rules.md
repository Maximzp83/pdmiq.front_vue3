# Session Collaboration Rules

- Apply changes only after user confirmation.
- If there are risks or ambiguous/disputable points, highlight them and ask clarifying questions before changes.
- Migrate one file at a time (no multi-file chunks).
- Exception: if a change is structurally coupled across parent/child or otherwise tightly linked files, one combined step may include multiple files.
- Diff preview is NOT required before applying a file.
- After each single-file migration, stop and wait for the next user instruction.
- For the coupled-files exception above, stop after the combined step and wait for the next user instruction.
- Continue migrating all components from `vue2_project/src/components` and update already migrated ones if needed.
- During migration, replace all `@event="handleEventNew"` with `@event="handleEvent"`.
- During migration, replace all `<CustomSelect` usages with `<CustomSelectV2`.
- Do not display code/diff in terminal responses unless there is a risky or ambiguous point that requires discussion.
- After each completed migration, provide only the newly migrated file path in plain text format like `src/path/file.vue — ...` (no markdown links); use an absolute path only when explicitly requested.
- After each migration step, do not report docs file updates; mention docs changes only when updating process/rules documents.

## Language Note

Latest user rules (RU):

- "применять изменения только после подтверждения"
- "если есть риски или спорные моменты - спрашивай"
- "не выводи diff и просто применяй изменения ... и только по одному файлу"
- "останавливайся после каждого файла"
