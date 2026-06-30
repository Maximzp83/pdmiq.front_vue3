<template>
	<div class="corporate-dashboard">
		<div class="view-wrapper item-page-wrapper">
			<div v-if="companyId && selectedCompany" class="mcontainer">
				<div class="content-row nested-view-content-wrapper">
					<RouterView v-slot="{ Component }">
						<transition name="standard-fade" mode="out-in">
							<component
								:is="Component"
								ref="nestedViewContent"
								:key="detailsComponentKey"
								:companyData="selectedCompany"
								:companyId="companyId"
								preventSetNavbar
								@event="handleEvent"
							/>
						</transition>
					</RouterView>
				</div>
			</div>

			<div v-else class="mcontainer">
				<PageMockImg :text="tt('phrases.select_company_first')" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
import annotations from 'highcharts/modules/annotations';
import { storeToRefs } from 'pinia';

import { localeMonths, localeMonthsFull, weekdays } from '@/constants/date_time';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { initHighchartsModule } from '@/helpers/charts';
import PageMockImg from '@/components/common/PageMockImg.vue';

initHighchartsModule(highchartsMore, Highcharts);
initHighchartsModule(stockInit, Highcharts);
initHighchartsModule(boost, Highcharts);
initHighchartsModule(annotations, Highcharts);

const { tt } = Lang;

defineOptions({ name: 'CorporateDashboard' });

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { authUser } = storeToRefs(authStore);
const { globalCompaniesList, globalFilters } = storeToRefs(globalStore);

const detailsComponentKey = ref(1);

const companyId = computed(() => authUser.value?.company_id || globalFilters.value?.companyId || null);
const selectedCompany = computed(() => {
	if (!companyId.value || !globalCompaniesList.value) return null;
	return findItemBy('id', companyId.value, globalCompaniesList.value);
});

const navbarSettings = computed(() => ({
		enableCompaniesFilter: true,
		datepickerSettings: {
			label: `${tt('phrases.statistics_for_period')}:`,
			storeSettings: {
				storeName: 'PlantsStore',
				stateKey: 'statistics_filters',
			},
		},
		printButtonSettings: {
			querySelector: '.corporate-dashboard .corporate-for-print-container',
			icon: 'icomoon icon-pdf',
		},
	}));

const setupHighchartsLocale = () => {
	if (Lang.currentLangId !== LANGUAGE_TYPES.SPANISH) return;

	Highcharts.setOptions({
		lang: {
			months: Lang.translate(localeMonthsFull()),
			weekdays: Lang.translate(weekdays()),
			shortMonths: Lang.translate(localeMonths(true)),
		},
	});
};

const setGlobalFilters = ({ id, filterName }) => {
	globalStore.set_global_filters({
		...globalFilters.value,
		[filterName]: id,
	});
};

const { handleEvent } = useEventHandler({}, null);

onBeforeMount(() => {
	setupHighchartsLocale();
	globalStore.setup_navbar(navbarSettings.value);
});

onBeforeUnmount(() => {
	globalStore.setup_navbar({});
	setGlobalFilters({ id: null, filterName: 'companyId' });
});
</script>
