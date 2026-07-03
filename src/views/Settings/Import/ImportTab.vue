<template>
	<div>
		<div class="card connect_to_card bottom">
			<div class="card-content small-buttons-navbar mrow wrap flex card-tabs">
				<ButtonsNavbar
					class="mcol-xs-12 mcol-sm-auto"
					card
					inline
					:itemsList="navbarList"
					buttonClass="el-button--info inverted mini"
				/>

				<div
					v-if="currentPath === '/settings/import/history'"
					class="fluid mcol-xs-12 mcol-sm-6"
				>
					<Filterbar
						:filters="filters"
						hideCreate
						hideDelete
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>

		<RouterView v-slot="{ Component }">
			<Transition name="standard-fade" mode="out-in">
				<component :is="Component" preventSetNavbar />
			</Transition>
		</RouterView>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import { useTestingStore } from '@/stores/TestingStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ButtonsNavbar from '@/components/common/ButtonsNavbar.vue';
import Filterbar from '@/components/common/Filterbar.vue';

defineOptions({ name: 'SettingsImportTab' });

const route = useRoute();
const testingStore = useTestingStore();
const { filters } = storeToRefs(testingStore);

const currentPath = computed(() => route.fullPath);
const navbarList = Object.freeze([
	{ id: 1, path: '/settings/import/logs', label: 'Plant' },
	{ id: 2, path: '/settings/import/master', label: 'Master' },
	{ id: 3, path: '/settings/import/history', label: 'History' },
]);
const setFilters = (newFiltersValues, bindedFilters = []) => {
	let newFilters = { ...filters.value, ...newFiltersValues };
	if (filters.value.page === newFilters.page) newFilters.page = 1;
	if (bindedFilters.length) {
		for (const prop of bindedFilters) {
			if (filters.value[prop]) newFilters = { ...newFilters, [prop]: null };
		}
	}
	testingStore.set_settings_filters(newFilters);
};

const { handleEvent } = useEventHandler({ setFilters });
</script>
