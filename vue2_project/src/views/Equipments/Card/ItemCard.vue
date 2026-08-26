<template>
	<div
		:class="[
			'item-card-container equipment-card-item',
			equipmentStatusClass,
			// { hasCrashProcess: has_breakdown }
		]"
	>
		<div class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="data-content-wrapper">
				<!-- :equipmentStatusClass="equipmentStatusClass" -->
			<GridItemCardHeader
				@event="handleEventNew"
				:route="titleLinkRoute"
				:cardData="cardData"
				:selectedIds="selectedIds"
				:operationsSettings="operationsSettings"
				showEquipmentTypeImg
			/>

			<div class="card-content">
				<div class="data-section main">
					<div class="info-part">
						<ul class="info-list">
							<InfoItem
								v-for="item in mainInfoSettingsList"
								:key="`info-${item.label}`"
								:settingItem="item"
								:itemData="cardData"
								labelClassName="capitalize"
							/>
						</ul>

						<div
							class="radio-buttons-wrapper"
							v-if="currentEquipmentTypesList.length > 1"
						>
							<RadioButtonsBlock
								@onChange="switchEquipmentTypeTab"
								:settings="radioBlockOptions"
								:optionsList="currentEquipmentTypesList"
								:value="activeEquipmentTypeTab"
							/>
						</div>
					</div>
					<!-- v-if="equipment_picture" -->
					<div
						class="images-part"
						:class="{ 'has-equipment-img': equipment_picture }"
					>
						<div class="imgWrapper">
							<div
								class="images-part-overlay dark-overlay"
								v-if="cardData.pictures.length"
								@click="togglePreviewModal"
							>
								<div class="caption">
									<i class="icomoon icon-zoom-in"></i>
								</div>
							</div>
							<img
								:class="{ 'type-img': !equipment_picture }"
								:src="equipment_picture || cardData.equipment_type_img"
								alt="img error"
							/>
						</div>
					</div>
				</div>

				<div class="data-section last">
					<div
						v-for="(item, idx) in currentEquipmentTypesList"
						:key="`item-${cardData.id}_tab-${activeEquipmentTypeTab}_idx-${idx}`"
						class="tab-container"
					>
						<TypeOptionBlock
							v-if="activeEquipmentTypeTab == item.id"
							:equipmentTypeData="item"
						/>
					</div>
				</div>
			</div>
		</div>

		<div
			:class="[
				'sensors-block',
				`equipment_${cardData.id}-sensors-drag-n-drop-wrapper`
			]"
		>
			<div
				class="sensors-list drag-n-drop-list"
				v-if="sensorsAndMultiviewsList && sensorsAndMultiviewsList.length"
				:key="resetReorder"
			>
				<div
					v-for="(item, idx) in sensorsAndMultiviewsList"
					:key="`sensor-${item.id}_idx-${idx}`"
					class="drag-n-drop-item"
					:data-card_item_order="item.equipment_card_item_order"
				>
					<CardSensorItem
						v-if="item.data_set"
						v-show="!item.is_archived || filters.archivedNodes"
						@event="handleEventNew"
						:itemData="item"
						:enableReorder="enableReorder"
						:enableResetRuntime="isIndustrialMatrix"
					/>

					<CardMultiViewItem
						v-else
						@event="handleEventNew"
						:enableReorder="enableReorder"
						:itemData="item"
					/>
					
				</div>
			</div>
		</div>

		<!-- <div class="sensors-block multiviews-block" v-if="multiViewsList.length">
			<CardMultiViewItem
				@event="handleEventNew"
				v-for="item in multiViewsList"
				:key="`mv-${item.id}`"
				:itemData="item"
				:data-id="item.id"
			/>
		</div> -->

		<!-- <CardDroppedSection
			:route="`/equipments/${cardData.id}/details`"
			buttonText="View Item Details"
		/> -->
	</div>
</template>

<script>
import { findItemBy, sortArrayByKeyNumber } from '@/helpers';
import { SENSOR_ALARM_TYPES } from '@/constants/global';

import {
	itemCardMixin,
	eventHandler,
	dragNdropSortableMixin,
	navigation,
	fetchItemsHelper,
	sensorTypeMixin
} from '@/mixins';

export default {
	mixins: [itemCardMixin(), eventHandler(), dragNdropSortableMixin(), navigation(), fetchItemsHelper(), sensorTypeMixin()],

	components: {
		GridItemCardHeader: () =>
			import('@/components/gridTable/GridItemCardHeader.vue'),
		// CardDroppedSection: () => import('@/components/gridTable/CardDroppedSection.vue'),
		InfoItem: () => import('@/components/itemDetails/InfoItem.vue'),
		CardSensorItem: () => import('./CardSensorItem.vue'),
		CardMultiViewItem: () => import('./CardMultiViewItem.vue'),
		TypeOptionBlock: () => import('./TypeOptionBlock.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue')
	},

	props: {
		additionalProps: {
			type: Object,
			default: () => ({})
		}
	},

	data: () => ({
		crash_processes: [],
		draggingLocked: false,
		resetReorder: 1,

		activeEquipmentTypeTab: '',

	}),

	computed: {
		isIndustrialMatrix() {
			return (
				this.$store.state.auth.isIndustrialMatrix ||
				this.$store.state.auth.isDeveloper
			);
		},

		enableReorder: that => that.dashboardSensors.length > 1 && that.isIndustrialMatrix,
		// enableReorder: () => false,
		drag_n_drop_wrapper_selector: that =>
			`.equipment_${that.cardData.id}-sensors-drag-n-drop-wrapper`,
		// reorderAction: () => 'reorder_sensor',

		filters() {
			return this.$store.state.equipments.filters;
		},

		mainInfoSettingsList() {
			const { is_store_room, dashboardSensors, asset_id } = this.cardData;

			if (is_store_room) {
				return Object.freeze(
					this.$translate([
						{ prop: 'production_line_name', label: 'Production_line' },
						{ prop: 'equipment_type_name', label: 'Item_type' },
						{ prop: 'brand_name', label: 'Brand' },
						{ prop: 'brand_model_name', label: 'Part' }
					])
				);
			} else if (dashboardSensors.length) {
				return Object.freeze(
					this.$translate([
						{ prop: 'asset_name', label: 'Asset' },
						{ prop: 'location_name', label: 'location_in_plant' },
						{ prop: 'production_line_name', label: 'Production_line' }
						// { prop: 'equipment_type_name', label: 'Item_type' }
					])
				);
			} else if (asset_id) {
				return Object.freeze(
					this.$translate([
						{ prop: 'plant_name', label: 'Plant' },
						{ prop: 'brand_name', label: 'Brand' },
						{ prop: 'brand_model_name', label: 'Part' },
						{ prop: 'machine_name', label: 'Machine' }
					])
				);
			}

			return [];
		},

		equipmentTypesList: that =>
			Object.freeze(that.additionalProps.equipmentTypesList || []),

		/*typeOptions() {
			return Object.freeze(
				this.cardData.typeOptions.filter(
					to => to.raw_values && to.raw_values.length && to.is_in_equipment_card
				)
			);
			// return withValues.filter((to, i) => i < 4);
		},*/
		// pictures: that => that.cardData.pictures,
		// equipment_type_img: that => that.cardData.equipment_type_img,
		dashboardSensors: that => that.cardData.dashboardSensors,
		sensorsAndMultiviewsList() {
			return sortArrayByKeyNumber(
				// this.multiViewsList.concat(this.dashboardSensors),
				this.dashboardSensors.concat(this.multiViewsList),
				'equipment_card_item_order',
				// 'desc'
			);
		},

		has_breakdown: that => that.cardData.has_breakdown,

		equipment_picture() {
			const { pictures /*equipment_type_img*/ } = this.cardData;
			if (pictures.length) {
				return sortArrayByKeyNumber(pictures,	'display_order')[0].full_thumb_file_name;
			}
			// else if (equipment_type_img) return cardData.equipment_type_img;

			return null;
		},

		titleLinkRoute() {
			return `/equipments/${this.cardData.id}/details`;
		},
		radioBlockOptions: () => ({
			hideTitle: true,
			buttonType: 'secondary'
		}),

		currentEquipmentTypesList() {
			const {
				equipment_type_id,
				equipment_type_name,
				equipment_subtype_id,
				subtype_brand_model_name,
				brand_model_name,
				typeOptions,
				subTypeOptions
			} = this.cardData;

			const equipmentType = findItemBy(
				'id',
				equipment_type_id,
				this.equipmentTypesList
			);

			let list = [
				{
					...equipmentType,
					title: equipment_type_name,
					brand_model_name,
					typeOptions
				}
			];

			if (equipment_subtype_id) {
				const equipmentSubType = findItemBy(
					'id',
					equipment_subtype_id,
					this.equipmentTypesList
				);
				// console.log(equipmentSubType)
				list.push({
					...equipmentSubType,
					title: equipmentSubType.name,
					brand_model_name: subtype_brand_model_name,
					typeOptions: subTypeOptions
				});
			}
			// console.log(list)
			return Object.freeze(list);
		},

		multiViewsList: that => Object.freeze(that.cardData.metric_multi_views),

		equipmentStatusClass() {
			const { dashboardSensors } = this;
			if (
				dashboardSensors.some(
					sensor =>
						sensor.current_metric_issue_alerts &&
						sensor.current_metric_issue_alerts.length
				)
			) {
				const isAlarm = dashboardSensors.some(sensor => 
					(sensor.current_metric_issue_alerts || []).some(
						ai => ai.alert_type === SENSOR_ALARM_TYPES.ALARM
					)
				);
				if (isAlarm) return 'alarm';

				const isWarning = dashboardSensors.some(sensor => 
					(sensor.current_metric_issue_alerts || []).some(
						ai => ai.alert_type === SENSOR_ALARM_TYPES.WARNING
					)
				);
				if (isWarning) return 'warning';
			}

			return '';
		}
	},

	methods: {
		switchEquipmentTypeTab(id) {
			this.activeEquipmentTypeTab = id;
		},

		reorderHandler(event) {
			const { oldIndex, newIndex } = event;
			const { card_item_order} = event.data.dragEvent.data.originalSource.dataset;
			// console.log(event.data.dragEvent.data.originalSource.dataset);
			if (oldIndex !== newIndex && card_item_order != null) {
				const payload = {
					itemId: this.cardData.id,
					data: {
						current_display_order: +card_item_order,
						desired_display_order: newIndex
					}
				}

				/*if (process.env.NODE_ENV === 'development') {
					if (payload) {
						console.log('reorderHandler', payload.data);
						this.resetReorder++;
						this.destroySortable();
						
						setTimeout(() => {
							this.setupDraggable();
						}, 0)

						return;
					}
				}*/

				this.$store.dispatch('equipments/reorder_sensors', payload)
					.then(() => {;
						//
					})
					.catch(err => {
						console.log(err);
						this.resetReorder++;
						this.destroySortable();
						
						setTimeout(() => {
							this.setupDraggable();
						}, 0);
					})
			}
		},

		dragStartHandler(event) {
			const { target } = event.sensorEvent.data;

			return target.classList.contains('can-dragging');
		},
	},

	created() {
		// console.log('created', this.cardData.id, this.dashboardSensors.length)
		this.draggingLocked = !this.enableReorder;
		this.activeEquipmentTypeTab = this.currentEquipmentTypesList[0].id;

		if (this.dashboardSensors.length) {
			/*if (this.dashboardSensors.some(sensor=>{
				const type = this.getType(sensor);
				return type.isBannerM25
			})) {
				console.log('isBannerM25', this.cardData.machine_name, this.cardData.asset_name);
			}*/

			/*if (this.dashboardSensors.some(sensor=>{
				const type = this.getType(sensor);
				return type.isBannerV2Generic
			})) {
				console.log('isBannerV2Generic', this.cardData.machine_name, this.cardData.asset_name);
			}*/

			/*if (this.dashboardSensors.some(sensor=>{
				// const type = this.getType(sensor);
				return sensor.lube_version === 3
			})) {
				console.log('isLubeMatrixV3', this.cardData.machine_name, this.cardData.asset_name);
			}*/
		}

		// this.fetchMultiViews(this.cardData.id);

	}
};
</script>
