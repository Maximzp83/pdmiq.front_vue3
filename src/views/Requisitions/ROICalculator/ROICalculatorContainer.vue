<template>
	<div class="view-wrapper requisitions-dashboard">
		<div class="mcontainer">
			<div class="section-row roi-calculator-wrapper">
				<ROICalculatorBlock
					:usersList="usersList"
					:usersLoading="usersLoading"
					:calculationsStepEnabled="calculationsStepEnabled"
					@event="handleEvent"
				/>
			</div>

			<div v-if="calculationsStepEnabled" class="card section-row">
				<ItemsList preventSetNavbar :filters="appliedFilters" :usersList="usersList" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { USER_ROLES_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ROICalculatorBlock from './ROICalculatorBlock.vue';
import ItemsList from './ItemsList.vue';

const { tt } = Lang;

defineOptions({ name: 'ROICalculator' });

const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const usersList = shallowRef([]);
const usersLoading = ref(false);
const appliedFilters = ref({});
const calculationsStepEnabled = ref(false);
const fetchUsers = createGetRequest('/users');

const navbarSettings = computed(() => ({
	pageTitle: tt('phrases.Fab_Plant_Dashboard'),
	showFilter: true,
}));

const loadUsers = (plantId) => {
	if (!plantId) {
		usersList.value = [];
		return;
	}

	usersLoading.value = true;
	fetchUsers({
		params: {
			max: -1,
			type: USER_ROLES_TYPES.CUSTOMER,
			plantId,
		},
	})
		.then(({ value }) => {
			usersList.value = value || [];
		})
		.finally(() => {
			usersLoading.value = false;
		});
};

const applyFilters = (filters) => {
	appliedFilters.value = filters || {};
	calculationsStepEnabled.value = true;
};

const toggleCalculationsStepEnabled = (enabled) => {
	calculationsStepEnabled.value = enabled;
};

const { handleEvent } = useEventHandler({
	applyFilters,
	toggleCalculationsStepEnabled,
});

onBeforeMount(() => {
	globalStore.setup_navbar(navbarSettings.value);
});
onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});

watch(() => globalFilters.value.plantId, loadUsers, { immediate: true });
</script>
