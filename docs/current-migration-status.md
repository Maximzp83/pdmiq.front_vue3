# Vue 2 → Vue 3 Migration Status (Current)

## Статус ключевых блоков

- ✅ Users (ItemsList/ItemPage/ItemForm + Notifications/MFA/Reports)
- ✅ UserRoles (ItemsList/ItemPage/ItemForm)
- ✅ Teams (ItemsList/ItemPage/ItemForm)
- ✅ Companies (ItemsList/ItemPage/ItemForm/InfoPage)
- ✅ Простые каталоги: Brands, Applications, StoreRooms, Parts (лист/форма/страница)
- ✅ Сложные каталоги: BrandModels, EquipmentTypes (+newOptionsOnly), EquipmentTypesCategories
- ✅ Equipments (лист/форма/детали), Machines (лист/форма/детали), Plants (лист/форма/детали), Sensors (лист/форма/детали)
- ✅ Maintenance Import (WorkOrdersImport), вспом. компоненты
- ✅ MFA: SMS + Google Auth (реальные код/QR), интеграция в Users
- ✅ FetchByQuerySelect, useItemsData расширен (Pinia/custom fetch/initialFilters/returnResponse)
- ✅ Router: Vue Router 4, beforeEach с reason, MFA redirect, permissions, routes перенесены для мигрированных вью
- ✅ Производственные линии / процессы / utilities (ProductionLines/Processes/Utilities): мигрировать
- ✅ Requisitions / RFQs: мигрировать
- ✅ Settings: Faults, Import (Plant/Master/History/Logs + строки, dnd/progress/repeat), Custom Formulas, Back-End Registers, Statistics Export

## Маршруты (состояние)

- Перенесены: все маршруты для мигрированных вью (Dashboard, Companies, Users, UserRoles, Teams, EquipmentTypes, EquipmentTypesCategories, BrandModels, Brands, Applications, StoreRooms, Parts, Equipments, Machines, Plants, Sensors, Maintenance* и пр.).
- В beforeEach добавлены: reason для ограничений, redirect на /login при not_auth, permissions/conditionSettings, MFA enforcement (redirect на /profile?enableMfa=true при forced_mfa).
- ✅ Router gap-scan завершен: все маршруты проверены и добавлены.

## Поведение, паритет с Vue2

- Machines: list/grid, dnd reorder, фильтры (location/line/application), show/hide списка, resetNearbyFilters (очистка зависимых фильтров и связок), переходы к Assets/Equipments, WO create с prod_line, preventFetch без plant.
- Plants: фильтры, архив toggle, таблица, переход на dashboard с установкой global plantId.
- Sensors: фильтры/таблица/иконки, действия (graphs → /statistics), лубрикация nullify via /ultrasound-pumps/{id}, create Banner/UltraSound.
- Users: MFA (SMS/GA), Reports tab, уведомления, все поля/валидации; FetchByQuerySelect в новых компонентах.
- EquipmentTypes: newOptionsOnly, сабформы options/media/drives.

## Дополнительные исправления

1. ✅ Исправлены недостающие компоненты router: NewPasswordForm, ForgotPasswordForm, NotFoundPage.
2. ✅ Миграция TabsBar компонента (используется в Login.vue).
3. ✅ Исправлены недостающие изображения: background_login.png, top-logo-white.png (LoginWrapper.vue).
4. ✅ Исправлен метод authStore.set_data → set_value в LoginWrapper.vue.
5. ✅ Обновлён синтаксис router-view в LoginWrapper.vue (Vue 3 slot props).
6. ✅ Исправлен синтаксис slot в компонентах: TabsBar.vue, SidebarWithSubs.vue, TopNavbar.vue, ProductionLines/ItemForm.vue, Processes/ItemForm.vue (Vue 2 → Vue 3).

## Примечания

- Добавляем только то, что было реализовано в Vue2 (закомментированное в старых файлах — не переносим).
- Новые маршруты добавляем после миграции соответствующих вью, чтобы не ломать билд.
- Используем Pinia, `<script setup>`, Composition API, `api_request`, Lang.tt, hasAccessTo/permissions как в текущей архитектуре.
- Все компоненты протестированы линтером, ошибки отсутствуют.
- Vue 3 миграция завершена успешно!
