<template>
	<div class="card block-item statistics-block vertical-fluid flex column">
		<div class="card-header flex align-center">
			<div class="round-icon-container">
				<i class="icomoon icon-docs"></i>
			</div>
			<div class="title semi-bold uppercase">{{ tt('phrases.roi_value_creation') }}</div>
		</div>

		<div class="card-content gauge-content relative flex column fluid">
			<div class="content-row">
				<GaugeStatisticsContainer
					:plantItem="plantItem"
					:rootFilters="equipments_statistics_filters"
					:selectedColumnsNumber="selectedColumnsNumber"
				/>
			</div>

			<div class="content-row instances-roi-charts mt-auto">
				<InstanceROIStatisticsContainer
					instanceIdProp="productionLineId"
					:predefinedFilters="predefinedFilters"
					fetch_action_url="production-lines/roi"
					:selectedColumnsNumber="selectedColumnsNumber"
				/>

				<InstanceROIStatisticsContainer
					instanceIdProp="machineId"
					:predefinedFilters="predefinedFilters"
					fetch_action_url="machines/roi"
					:selectedColumnsNumber="selectedColumnsNumber"
				/>

				<InstanceROIStatisticsContainer
					instanceIdProp="assetId"
					:predefinedFilters="predefinedFilters"
					fetch_action_url="assets/roi"
					:selectedColumnsNumber="selectedColumnsNumber"
				/>
			</div>
			
			<div class="content-row text-right">
				<router-link class="el-button el-button--primary inverted" to="/success-dashboard/roi-one-pager">
					{{ tt('Details') }}
				</router-link>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';
import GaugeStatisticsContainer from './GaugeStatisticsContainer.vue';
import InstanceROIStatisticsContainer from './InstanceROIStatisticsContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardROIStatisticsContainer' });

defineProps({
	plantItem: { type: Object, default: () => ({}) },
	predefinedFilters: { type: Object, default: () => ({}) },
	equipments_statistics_filters: { type: Object, default: () => ({}) },
	selectedColumnsNumber: { type: Object, default: () => ({ id: null }) },
});
</script>
