<template>
	<div class="card content-row">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">{{ tt('sidebar_menu.cost_savings_calculator') }}</div>
		</div>
		<div class="card-content">
			<div class="mrow flex wrap">
				<el-form-item class="mcol-xs-12 mcol-sm-4" :label="tt('daterange')">
					<Datepicker v-model="localFilters.daterange" enableShortcuts type="daterange" />
				</el-form-item>
				<el-form-item class="mcol-xs-12 mcol-sm-4" :label="tt('Status')">
					<CustomSelectV2
						v-model="localFilters.status"
						clearable
						:optionsList="statusesList"
						:placeholder="tt('Status')"
					/>
				</el-form-item>
				<div class="mcol-xs-12 mcol-sm-4 flex align-end">
					<el-button type="primary" :loading="loading" @click="calculate">{{ tt('Calculate') }}</el-button>
				</div>
			</div>

			<div class="content-row mrow flex wrap">
				<div class="mcol-xs-12 mcol-sm-4">
					<div class="muted">{{ tt('Requisitions') }}</div>
					<div class="title semi-bold">{{ result.total_work_orders || result.count || 0 }}</div>
				</div>
				<div class="mcol-xs-12 mcol-sm-4">
					<div class="muted">{{ tt('Hours') }}</div>
					<div class="title semi-bold">{{ result.total_time_work_orders || result.hours || 0 }}</div>
				</div>
				<div class="mcol-xs-12 mcol-sm-4">
					<div class="muted">{{ tt('Budget') }}</div>
					<div class="title semi-bold">{{ result.total_costs_work_orders || result.cost || 0 }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref } from 'vue';

import { requisitionStatusesList } from '@/constants/global';
import { prepareRangeParams } from '@/helpers';
import { Lang } from '@/localization';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';

import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionsRoiCalculatorBlock' });

const { calculateRequisitionsRoi } = usePlantRequisitions();
const localFilters = reactive({
	daterange: [],
	status: null,
});
const loading = ref(false);
const result = ref({});
const statusesList = requisitionStatusesList();

const calculate = () => {
	let params = { ...localFilters };
	if (params.daterange?.length) {
		params = { ...params, ...prepareRangeParams(params.daterange) };
		delete params.daterange;
	}
	loading.value = true;
	return calculateRequisitionsRoi(params)
		.then(({ value }) => {
			result.value = value || {};
		})
		.finally(() => {
			loading.value = false;
		});
};
</script>
