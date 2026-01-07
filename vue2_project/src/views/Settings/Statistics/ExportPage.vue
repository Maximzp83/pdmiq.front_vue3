<template>
	<div class="section-row">
		<div class="card view-content-card">
			<div class="card-content">
				<div class="mcol-xs-12 mcol-sm-6 statistics-export-content">
					<div class="section-row ">
						<Datepicker
							className=""
							v-model="selectedRange"
							type="daterange"
							format="yyyy/MM/dd"
							value-format="yyyy-MM-dd"
							:picker-options="pickerOptions"
							setupDaterangeFilter
						/>
						<!-- :default-time="['00:00:00', '23:59:59']" -->
					</div>

					<div class="section-row">
						<div class="flex mrow space-between">
							<div class="mcol-xs-6">
								<el-button
									@click="() => handleExport('plants')"
									type="primary"
									native-type="button"
									class="item-action-button"
								>
									<span
										class="uppercase"
										v-text="`${tt('Plant')} ${tt('Export')}`"
									></span>
								</el-button>
							</div>

							<div class="mcol-xs-6">
								<el-button
									@click="() => handleExport('users')"
									type="primary"
									native-type="button"
									class="item-action-button"
								>
									<span
										class="uppercase"
										v-text="`${tt('User')} ${tt('Export')}`"
									></span>
								</el-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {
	datePickerShortcuts
	// datePickerAdditionalShortcuts,
	// localeMonths,
	// localeMonthsFull,
	// weekdays
} from '@/constants/date_time';

import { exportListToFileMixin } from '@/mixins';

// import { getDateRange } from '@/helpers';

export default {
	mixins: [exportListToFileMixin()],
	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue')
		// ItemForm: () => import('./ItemForm.vue')
	},

	data() {
		return {
			selectedRange: [],

			formData: {
				sensor_ids: []
				// date_start: '',
				// date_finish: '',
				// description: ''
			}
		};
	},

	computed: {
		itemsName: that => ({
			one: that.$t('Back-End Register'),
			mult: that.$t('Back-End Registers')
		}),

		pickerOptions: () => ({ shortcuts: datePickerShortcuts() })

		/*pickerOptions: that => {
			let shortcuts = [].concat(datePickerShortcuts());
			// const timeRanges = ['1_hour', '3_hours', '12_hours'];

			shortcuts = shortcuts.map(sc => {
				let newSc = {
					...sc,
					onClick: picker => {
						that.rangeWithTime = timeRanges.some(r => r == sc.rangeName);
						setTimeout(() => {
							picker.$emit('pick', getDateRange(sc.rangeName));
							// console.log('click ', sc.rangeName, getDateRange(sc.rangeName), picker)
						}, 100);
					}
				};

				// if (sc.rangeName == 'today') newSc.text = 'Today (Live)';

				return newSc;
			});

			return Object.freeze({ shortcuts });
		}*/
	},

	methods: {
		handleExport(instance) {
			// console.log(this.selectedRange)
			this.handleExportItem({
				url: `${instance}/statistics`,
				filters: {
					daterange: this.selectedRange
				}
			});
		}
	}
};
</script>
