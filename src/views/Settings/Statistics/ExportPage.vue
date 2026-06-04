<template>
	<div class="section-row">
		<div class="card view-content-card">
			<div class="card-content">
				<div class="mcol-xs-12 mcol-sm-6 statistics-export-content">
					<div class="section-row">
						<Datepicker
							v-model="selectedRange"
							type="daterange"
							format="YYYY/MM/DD"
							value-format="YYYY-MM-DD"
							:picker-options="pickerOptions"
							setupDaterangeFilter
						/>
					</div>

					<div class="section-row">
						<div class="flex mrow space-between">
							<div class="mcol-xs-6">
								<el-button
									type="primary"
									native-type="button"
									class="item-action-button"
									@click="() => handleExport('plants')"
								>
									<span class="uppercase" v-text="`${tt('Plant')} ${tt('Export')}`"></span>
								</el-button>
							</div>

							<div class="mcol-xs-6">
								<el-button
									type="primary"
									native-type="button"
									class="item-action-button"
									@click="() => handleExport('users')"
								>
									<span class="uppercase" v-text="`${tt('User')} ${tt('Export')}`"></span>
								</el-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { datePickerShortcuts } from '@/constants/date_time';
import { Lang } from '@/localization';
import { useExportListToFile } from '@/composables/mixins/useExportListToFile';

import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({
	name: 'SettingsStatisticsExportPage',
});

const selectedRange = ref([]);
const pickerOptions = computed(() => ({ shortcuts: datePickerShortcuts() }));
const { handleExportItem } = useExportListToFile();

const handleExport = (instance) => {
	handleExportItem({
		url: `${instance}/statistics`,
		filters: {
			daterange: selectedRange.value,
		},
	});
};
</script>
