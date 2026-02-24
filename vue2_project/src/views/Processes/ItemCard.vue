<template>
	<div class="item-card-container">
		<div class="data-content-wrapper">
			<div class="card-header">
				<el-checkbox
					v-if="operationsSettings.allowDelete"
					:value="isChecked"
					@change="id => handleChecked(id)"
				></el-checkbox>
				<div class="semi-bold" v-text="cardTitle"></div>

				<div class="ml-auto icons-block" v-if="cardData.is_offline">
					<img :src="not_wifi_icon" alt="offline" />
				</div>

				<div class="actions-block ml-auto">
					<template v-if="operationsSettings.actions">
						<ButtonWithPopover
							v-for="action in operationsSettings.actions"
							:key="`action-${action.name}`"
							:title="action.tooltip_text"
							:disabled="!action.tooltip_text"
							:settings="popoverSettings"
							:buttonType="action.type"
							:buttonIcon="action.icon"
							:buttonClass="['action-button', action.className]"
							@onClick="handleAction(action)"
						/>
					</template>
				</div>
			</div>

			<div class="card-content">
				<div class="data-section colored-counters">
					<div class="flex mrow">
						<div class="info-part mcol-xs-7">
							<ul class="info-list">
								<li v-for="item in mainInfoList" :key="`info-${item.label}`">
									<span class="key">{{ item.label }}: </span>
									<span
										:class="[item.className || '', 'value']"
										v-html="getCellValue(cardData, item)"
									></span>
								</li>
							</ul>
						</div>
						
						<div class="images-part mcol-xs-5">
							<div
								class="imgWrapper"
								v-if="cardData.pictures && cardData.pictures.length"
							>
								<div
									class="images-part-overlay dark-overlay"
									@click="togglePreviewModal"
								>
									<div class="caption">
										<i class="icomoon icon-zoom-in"></i>
									</div>
								</div>
								<img
									v-if="mainImage"
									:src="mainImage.full_thumb_file_name"
									alt="img error"
								/>
									<!-- :src="cardData.pictures[0].full_thumb_file_name" -->
							</div>
						</div>
					</div>
				</div>

				<div class="data-section">
					<div class="info-part">
						<ul class="info-list">
							<li>
								<span class="key">Work Time</span>
								<span class="value">
									{{ cardData.start_work_day }} - {{ cardData.finish_work_day }}
								</span>
							</li>
							<li>
								<span class="key">Break Time</span>
								<span class="values-list">
									<span
										class="value"
										v-for="(item, idx) in cardData.work_breaks"
										:key="`break-${item.id}`"
									>
										{{ item.start_time }} - {{ item.finish_time
										}}{{ idx != cardData.work_breaks.length - 1 ? ',' : '' }}
									</span>
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div class="data-section" v-if="totalDowntimes">
					<div class="downtimes-counters">
						<span class="label semi-bold">Accumulative Downtime: </span>

						<span class="value">{{ totalDowntimes.total_count_hours }}</span>
						<span class="label">h</span>

						<span class="value">{{ totalDowntimes.total_count_minutes }}</span>
						<span class="label">m</span>

						<span class="value">{{ totalDowntimes.total_count_seconds }}</span>
						<span class="label">s</span>
					</div>

					<div class="downtimes-counters">
						<span class="label semi-bold">Loss count: </span>
						<span class="value">{{ cardData.loss_count }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { not_wifi_icon } from '@/constants/global';
import { itemCardMixin, eventHandler } from '@/mixins';
import { getCellValue, sortArrayByKeyNumber } from '@/helpers';

export default {
	mixins: [itemCardMixin(), eventHandler()],
	components: {
		// GridItemCardHeader: () => import('@/components/gridTable/GridItemCardHeader.vue'),
	},

	computed: {
		cardTitle: that => that.cardData.name,
		totalDowntimes: that => that.cardData.totalDowntimes,
		not_wifi_icon: () => not_wifi_icon,

		getCellValue: () => getCellValue,

		isChecked() {
			return this.selectedIds.indexOf(this.cardData.id) !== -1;
		},

		mainInfoList() {
			return Object.freeze([
				{ prop: 'max_capacity', label: 'Maximum capacity', className: 'max' },
				{ prop: 'real_capacity', label: 'Real capacity', className: 'real' },
				{ prop: 'production_hourly_rate', label: 'Run rate', className: 'runrate' },
				{ prop: 'actual_capacity', label: 'Running total', className: 'actual' }
			]);
		},

		popoverSettings: () =>
			Object.freeze({
				popperClass: 'button-popover',
				width: '90',
				buttonType: 'mini'
			}),

		mainImage() {
			return this.cardData.pictures ? sortArrayByKeyNumber(this.cardData.pictures, 'display_order')[0] : null;
		}

		/*thirdInfoList() {
			return [
				{ prop: 'max_capacity',	label: 'Work Time'},
				{ prop: 'work_breaks',	label: 'Break Time',
					meta: {
						fromArray: { subProp: 'start_time', delimeter: ', ', inline: true }
					}
				}
			]
		},*/
	},

	methods: {
		handleChecked() {
			const payload = {
				eventName: 'handleSelectionChange',
				data: this.cardData.id,
				onward: true
			};
			this.$emit('event', payload);
		},

		handleAction({ name }) {
			const payload = {
				eventName: name,
				data: { row: this.cardData },
				onward: true
			};
			this.$emit('event', payload);
		}

		/*handleAdditionalAction({ name, submit_action, title, local_action }, index, row) {
			const data = {
				actionName: name,
				submit_action: submit_action,
				index: index,
				row: row,
				title: title
			};

			if (local_action) {
				this[name](data);
			} else {
				// console.log(name, data);
				this.$emit('event', name, data);
			}
		}*/
	}
};
</script>
