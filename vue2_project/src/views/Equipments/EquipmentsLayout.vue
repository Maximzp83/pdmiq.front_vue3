<template>
	<div
		:class="[
			'equipments-layout card',
			'content-row',
			{ 'view-content-card': !fromDetailsPage }
		]"
	>
		<div
			v-if="showCardHeader"
			class="flex align-center card-header filled_2 relative"
		>
			<h1 class="title page-title outside-bg-addition uppercase">
				{{ tt('Items') }}
			</h1>
			<div
				v-if="showToggleListButton"
				:class="['ml-auto toggle-list-button', { active: !filters.isShowList }]"
			>
				<span v-text="!filters.isShowList ? $t('Show') : $t('Hide')"></span>
				<i class="icomoon icon-path_2"></i>

				<div
					class="absolute stretch pointer"
					@click="setFilters({ isShowList: !filters.isShowList })"
				></div>
			</div>
		</div>

		<div
			class="card-content"
			v-if="showToggleListButton ? filters.isShowList : true"
		>
			<DropdownFilterbar
				ref="DropdownFilterbar"
				:showCreateActions="
					$hasAccessTo(['create_dashboard']) || $hasAccessTo(['delete_dashboard'])
				"
				:hideCreate="!$hasAccessTo(['create_dashboard'])"
				:hideDelete="!$hasAccessTo(['delete_dashboard'])"
				@event="handleEvent"
				:itemsName="{}"
				:secondaryFilters="specialFiltersList && specialFiltersList.length > 0"
				:showFilterbar.sync="showFilterbar"
				hideToggleButton
				filterbarDropdownId="equipmentsDropdownFilterbar"
			>
				<template v-slot:prefixFilters>
					<div class="mcol-xs-12 mcol-sm-8 fluid">
						<div class="radio-buttons-wrapper mrow flex wrap align-center">
							<!-- v-model="" -->
							<RadioButtonsBlock
								@onChange="handleRadioFilters"
								:settings="radioBlockOptions"
								:optionsList="filterButtonsList"
								:value="activeRadioFilter"
							/>

							<div class="filter-item" v-if="showStoreRoomFilter">
								<div class="relative">
									<CustomSelect
										filterable
										clearable
										:optionsLoading="storeRoomsLoading"
										:optionsList="storeRoomsList"
										:placeholder="$t('phrases.All_storerooms')"
										:value="filters.storeroomId"
										@change="id => setFilters({ storeroomId: id })"
									/>
								</div>
							</div>

							<div class="filter-item" v-if="showStoreRoomFilter">
								<div class="relative">
									<CustomSelect
										filterable
										clearable
										:optionsLoading="storeRoomsLoading"
										:optionsList="storeRoomLocationsList"
										:placeholder="$t('phrases.all_storeroom_locations')"
										:value="filters.storeroomLocationId"
										@change="id => setFilters({ storeroomLocationId: id })"
									/>
								</div>
							</div>

							<div class="filter-item ml-auto" v-if="showClearFilters">
								<el-button
									class="small"
									type="primary"
									native-type="button"
									@click="handleClearFilters"
									v-text="$t('phrases.Clear_filters')"
								/>
							</div>

							<!-- <div class="ml-auto icon-item xs-hide sm-show">
									<i class="icomoon icon-item-types2"></i>
								</div> -->

							<div class="ml-auto filter-item equipment-type-selector">
								<CustomSelect
									className="capitalize"
									:disabled="isStoreRoomTab"
									filterable
									clearable
									:optionsLoading="equipmentTypesLoading"
									:optionsList="equipmentTypesList"
									:placeholder="$t('Item_type')"
									:value="filters.typeId"
									@change="id => setFilters({ typeId: id })"
									prefixIcon="icomoon icon-item-types2"
								/>
							</div>

							<div class="ml-auto filter-item toggle-additional-filters">
								<el-button
									type="primary"
									:disabled="isStoreRoomTab"
									native-type="button"
									:class="['action-button inverted', { active: showFilterbar }]"
									:icon="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"
									@click="e => toggleFilterbar(e)"
								></el-button>
							</div>
						</div>
					</div>
				</template>

				<div class="mrow filter-items-list relative">
					<div class="disable-filters-ovelay" v-show="!globalFilters.plantId">
						<div class="caption">{{ tt('phrases.Select_plant_first') }}</div>
					</div>

					<div class="filter-item">
						<CustomSelect
							filterable
							clearable
							:optionsLoading="locationsLoading"
							:optionsList="locationsList"
							:placeholder="$t('Location')"
							:value="filters.locationId"
							@change="
								id =>
									setFilters({ locationId: id }, [
										'machineId',
										'assetId',
										'productionLineId',
										'brandId',
										'brandModelId'
									])
							"
						/>
					</div>
					<div class="filter-item">
						<CustomSelect
							filterable
							clearable
							:optionsLoading="productionLinesLoading"
							:optionsList="productionLinesList"
							:placeholder="$t('Production_line')"
							:value="filters.productionLineId"
							@change="
								id =>
									setFilters({ productionLineId: id }, [
										'machineId',
										'assetId',
										'brandId',
										'brandModelId'
									])
							"
						/>
					</div>
					<div class="filter-item">
						<CustomSelect
							filterable
							clearable
							:optionsLoading="machinesLoading"
							:optionsList="machinesList"
							:placeholder="$t('Machine')"
							:value="filters.machineId"
							@change="
								id =>
									setFilters({ machineId: id }, [
										'assetId',
										'brandId',
										'brandModelId'
									])
							"
						/>
					</div>
					<div class="filter-item">
						<FetchByQuerySelect
							clearable
							enableLoadmore
							:loadmoreIsActive="assetsLoadmoreIsActive"
							@input="id => setFilters({ assetId: id }, ['brandId', 'brandModelId'])"
							:value="filters.assetId"
							:optionsLoading.sync="assetsLoading"
							:optionsList.sync="assetsList"
							:settings="assetQueryOptions"
							:placeholder="$t('Asset')"
						/>
					</div>

					<div class="filter-item">
						<FetchByQuerySelect
							clearable
							enableLoadmore
							@change="id => setFilters({ brandId: id }, ['brandModelId'])"
							:value="filters.brandId"
							:optionsLoading.sync="brandsLoading"
							:optionsList.sync="brandsList"
							:settings="brandQueryOptions"
							:placeholder="$t('Brand')"
						/>
					</div>

					<div class="filter-item">
						<FetchByQuerySelect
							clearable
							enableLoadmore
							:loadmoreIsActive="brandModelsLoadmoreIsActive"
							@input="id => setFilters({ brandModelId: id })"
							:value="filters.brandModelId"
							:optionsLoading.sync="brandModelsLoading"
							:optionsList.sync="brandModelsList"
							:settings="brandModelsQueryOptions"
							:placeholder="$t('Part_number')"
						/>
					</div>
				</div>

				<template v-slot:secondaryFilters>
					<div
						class="filter-item"
						v-for="item in specialFiltersList"
						:key="`spec-filter-${item.id}`"
					>
						<SpecialFilterItem
							ref="SpecialFilterItem"
							@change="specialFilterChange"
							:type_option="item"
						/>
					</div>
				</template>
			</DropdownFilterbar>

			<Filterbar
				:hideCreate="true"
				:hideDelete="true"
				@event="handleEvent"
				:itemsLoading="false"
				:filters="filters"
				:itemsName="itemsName"
				:perPageItems="perPageItems"
				searchbarClass="mcol-sm-5 mcol-lg-auto"
				perPageClassName="lg-ml-not-auto"
			>
				<template v-slot:middle>
					<div class="filter-item checkbox-item ml-auto">
						<el-checkbox
							:value="filters.favorites"
							:false-label="null"
							@change="val => setFilters({ favorites: val })"
							>{{ tt('Favorites') }}
						</el-checkbox>
					</div>

					<div class="filter-item checkbox-item ml-auto">
						<el-checkbox
							:value="filters.hasSensors"
							:false-label="null"
							@change="val => setFilters({ hasSensors: val })"
							>{{ tt('PDM') }}
						</el-checkbox>
					</div>

					<div class="filter-item checkbox-item" v-show="filters.hasSensors">
						<el-checkbox
							:value="filters.archivedNodes"
							:false-label="null"
							@change="val => setFilters({ archivedNodes: val })"
							>{{ $t('phrases.Display_Archived_Sensors') }}
						</el-checkbox>
					</div>

					<!-- <div class="filter-item checkbox-item">
							<el-checkbox
								:value="filters.acknowledgeOnly"
								:false-label="null"
								@change="val => setFilters({ acknowledgeOnly: val })"
								>Acknowledge
							</el-checkbox>
						</div> -->

					<div class="filter-item mcol-xs-auto mcol-sm-5 mcol-lg-auto">
						<el-select
							:disabled="isStoreRoomTab"
							collapse-tags
							multiple
							:placeholder="$t('phrases.Select_alert_types')"
							:value="alertTypesFilters"
							@change="handleAlertTypesFilter"
						>
							<!-- @change="ids => setFilters({ alert_types: ids })" -->
							<!-- v-show="item.id != ALERT_TYPES.MIXED" -->
							<el-option
								v-for="item in alertTypesList"
								:key="'alert_type-' + item.id"
								:label="item.name"
								:value="item.id"
							>
							</el-option>
						</el-select>
					</div>

					<div class="filter-item text-right mcol-xs-auto" v-if="!hideDatepicker">
						<Datepicker
							setupDaterangeFilter
							enableShortcuts
							@input="handleDateRange"
							:value="filters.daterange"
							type="daterange"
						/>
					</div>
				</template>

				<template v-slot:last>
					<div
						:class="[
							'filter-item grid-buttons flex',
							{ wider: !disableDraggingFeature }
						]"
					>
						<RadioButtonsBlock
							@onChange="toggleItemsGrid"
							:settings="gridSwitcherOptions"
							:optionsList="gridTypesList"
							:value="activeGrid"
						/>

						<span v-if="!disableDraggingFeature">
							<el-button
								:disabled="isStoreRoomTab"
								:class="['drag_n_drop-locker', { active: !draggingLocked }]"
								native-type="button"
								@click="
									globalFilters.plantId ? (draggingLocked = !draggingLocked) : null
								"
							>
								<i
									:class="[
										'icomoon',
										{ 'icon-lock2': draggingLocked },
										{ 'icon-unlock': !draggingLocked }
									]"
								></i>
							</el-button>
						</span>

						<el-popover
							v-if="fromDashboard"
							:placement="'bottom'"
							popper-class="link-popover"
							:title="$t('phrases.export_charts_to_pdf')"
							trigger="hover"
							width="120"
						>
							<!-- :class="[{ active: !draggingLocked }]" -->
							<el-button
								slot="reference"
								native-type="button"
								class="drag_n_drop-locker"
								icon="icomoon icon-pdf"
								@click="exportChartsToPdfDialogOpen = true"
							/>
						</el-popover>
					</div>

					<div
						class="filter-item mcol-xs-12"
						v-show="filters.hasSensors && !isStoreRoomTab"
					>
						<!-- @onChange="id => setFilters({sensorType: id})" -->

						<RadioButtonsBlock
							@onChange="handleSensorTypeFilter"
							:settings="radioSensorTypeSettings"
							:optionsList="sensorTypesButtonsList"
							:value="filters.sensor_class"
						/>
					</div>
				</template>
			</Filterbar>

			<transition name="standard-fade" mode="out-in">
				<EquipmentsList
					ref="ItemsListContainer"
					v-if="activeRadioFilter == 'isAsset'"
					@event="handleEventNew"
					:hideDatepicker="hideDatepicker"
					:fromDashboard="fromDashboard"
					:fromDetailsPage="fromDetailsPage"
					:preventSetNavbar="preventSetNavbar"
					:additionalModalSettings="additionalModalSettings"
					:propsFilters="finalEquipmentsFilters"
					:plantId="plantId"
					fromLayout
					watchPropsFiltersOnly
					:perPageItems="perPageItems"
					:draggingLockedProp="draggingLocked"
					:activeGrid="activeGrid"
					:equipmentTypesList="equipmentTypesList"
				/>

				<BrandModelsList
					ref="ItemsListContainer"
					v-if="activeRadioFilter == 'isStoreRoom'"
					@event="handleEventNew"
					:fromDashboard="fromDashboard"
					:preventSetNavbar="preventSetNavbar"
					:fromDetailsPage="fromDetailsPage"
					:plantId="plantId"
					fromEquipmentsLayout
					isStoreRoomItems
					:perPageItems="perPageItems"
					:propsFilters="finalBrandModelsFilters"
					watchPropsFiltersOnly
				/>
			</transition>
		</div>

		<el-dialog
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="tt('phrases.export_charts_to_pdf')"
			:visible.sync="exportChartsToPdfDialogOpen"
		>
			<ExportChartsToPdfContent
				v-if="exportChartsToPdfDialogOpen"
				:plantId="globalFilters.plantId"
				@close="exportChartsToPdfDialogOpen = false"
			/>
		</el-dialog>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { ALERT_TYPES, alertTypesList, sensorClassesList } from '@/constants/global';
import {
	getYmdDateString,
	getDateRange,
	findItemBy,
	mergeArrays,
	removeObjProps,
	cloneArr
} from '@/helpers';
import {
	requestsListMixin,
	eventHandler,
	/*dragNdropSortableMixin,*/ switchGridViewMixin
} from '@/mixins';

export default {
	mixins: [
		requestsListMixin(),
		eventHandler(),
		/*dragNdropSortableMixin(),*/ switchGridViewMixin()
	],

	components: {
		// ButtonsNavbar: () => import('@/components/ButtonsNavbar.vue'),
		ExportChartsToPdfContent: () => import('./ExportChartsToPdfContent.vue'),
		EquipmentsList: () => import('./ItemsList.vue'),
		BrandModelsList: () => import('@/views/BrandModels/ItemsList.vue'),
		SpecialFilterItem: () => import('@/views/Equipments/SpecialFilterItem.vue'),
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		DropdownFilterbar: () => import('@/components/common/DropdownFilterbar.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	/*directives: {
		'el-select-loadmore': {
			bind(el, binding) {
				// console.log(el, binding)
				const SELECTWRAP_DOM = el.querySelector(
					'.el-select-dropdown .el-select-dropdown__wrap'
				);
				SELECTWRAP_DOM.addEventListener('scroll', function() {
					const condition = this.scrollHeight - this.scrollTop <= this.clientHeight;
					if (condition) {
						binding.value();
					}
				});
			}
		}
	},*/

	props: {
		additionalModalSettings: Object,
		plantId: null,
		hideDatepicker: Boolean,
		fromDashboard: Boolean,
		fromDetailsPage: Boolean,
		showCardHeader: Boolean,
		showToggleListButton: Boolean,
		preventSetNavbar: Boolean,
		disableDraggingFeature: Boolean,
		propsFilters: {
			type: Object,
			default: () => ({})
		}
	},

	data: () => ({
		alertTypesFilters: [],
		draggingLocked: true,

		showFilterbar: false,
		currentPath: '',
		// showRadioFilters: false,
		filtersStateName: '',
		activeRadioFilter: 'isAsset',

		initiateRequestsToDoList: false,

		// typeId: null,
		special_filters: {},

		locationsList: [],
		locationsLoading: false,

		productionLinesList: [],
		productionLinesLoading: false,

		machinesList: [],
		machinesLoading: false,
		assetsList: [],
		assetsLoading: false,

		brandsList: [],
		brandsLoading: false,
		brandModelsList: [],
		brandModelsLoading: false,

		equipmentTypesList: [],
		equipmentTypesLoading: false,

		showStoreRoomFilter: false,
		storeRoomsLoading: false,
		storeRoomsList: [],

		exportChartsToPdfDialogOpen: false
	}),

	computed: {
		isStoreRoomTab: that => that.activeRadioFilter == 'isStoreRoom',

		filters() {
			return this.$store.state.equipments.filters;
		},

		storeroom_brand_models_filters() {
			return this.$store.state.brand_models.storeroom_brand_models_filters;
		},

		sensors_statistics_filters() {
			return this.$store.state.sensors.statistics_filters;
		},

		finalFilters() {
			return { ...this.filters };
		},
		finalBrandModelsFilters() {
			let filters = {
				...this.filters,
				...this.propsFilters,
				...this.storeroom_brand_models_filters
			};

			// console.log(filters)
			let removePropsForModels = [
				'hasSensors',
				'acknowledgeOnly',
				'alert_types',
				'isShowList',
				// 'plantId',
				'predefinedOptionsValuesIDs',
				'rawOptionsValuesIDs'
			];
			return removeObjProps(filters, removePropsForModels);
		},

		finalEquipmentsFilters() {
			return { ...this.finalFilters, ...this.propsFilters };
		},

		globalFilters() {
			return this.$store.state.global.globalFilters;
		},

		itemsName() {
			return Object.freeze({
				one: this.$t('Item'),
				mult: this.$t('Items'),
				instanceName: 'Equipments'
			});
		},

		// drag_n_drop_wrapper_selector: () => '.drag-n-drop-wrapper',
		// reorderAction: () => 'reorder_equipment',

		// =============
		clearableFiltersList: () =>
			Object.freeze([
				'locationId',
				'productionLineId',
				'machineId',
				'assetId',
				'storeroomId',
				// 'isAsset',
				'brandId',
				'brandModelId',
				'typeId',
				'q',
				'hasSensors',
				'sensorType',
				'dataSet',
				'alert_types',
				'offlineNodes',
				'sensor_class',
				'flat_metric_data_anomaly'
			]),

		showClearFilters() {
			const { filters, clearableFiltersList } = this;
			return clearableFiltersList.some(f_prop =>
				filters[f_prop] instanceof Array ? filters[f_prop].length : !!filters[f_prop]
			);
		},

		sensorTypesButtonsList() {
			return Object.freeze(sensorClassesList());
		},

		radioSensorTypeSettings: () =>
			Object.freeze({
				hideTitle: true,
				inline: true,
				clearable: true,
				// valueAsObject: { props: ['sensorType', 'dataSet'] },
				buttonType: 'secondary'
			}),

		// preventResetPage: () => true,
		alertTypesList: that => {
			let list = alertTypesList().filter(
				t =>
					t.id == ALERT_TYPES.ALARM ||
					t.id == ALERT_TYPES.WARNING ||
					t.id == ALERT_TYPES.LUBE
			);
			list.push(
				{ id: 'offline', name: that.tt('Offline') },
				{ id: 'anomaly', name: that.tt('phrases.Flat_Data_Anomaly') }
			);
			return list;
		},

		// ----------
		selectedEquipmentType() {
			const { equipmentTypesList, filters } = this;
			if (filters.typeId && equipmentTypesList.length) {
				return findItemBy('id', filters.typeId, equipmentTypesList);
			}
			return null;
		},

		specialFiltersList() {
			if (this.selectedEquipmentType) {
				return this.selectedEquipmentType.type_options.filter(
					to => to.is_in_dashboard_view
				);
			}

			return [];
		},

		assetQueryOptions() {
			return Object.freeze({
				fetchAction: 'assets/fetch_assets',
				params: { plantId: this.plantId || this.globalFilters.plantId }
			});
		},

		assetsLoadmoreIsActive() {
			// const { routeQuery } = this;
			let { machineId /*, assetId*/ } = this.filters;
			// assetId = assetId || (routeQuery && routeQuery.assetId);
			return !machineId /*&& !assetId*/;
		},

		brandQueryOptions() {
			return Object.freeze({
				fetchAction: 'brands/fetch_brands',
				params: { machineId: this.filters.machineId }
			});
		},

		brandModelsQueryOptions() {
			return Object.freeze({
				fetchAction: 'brand_models/fetch_brand_models',
				params: { machineId: this.filters.machineId }
			});
		},

		brandModelsLoadmoreIsActive() {
			let { brandId } = this.filters;
			return !brandId;
		},

		radioBlockOptions: () => ({
			hideTitle: true,
			buttonType: 'secondary'
		}),

		filterButtonsList: that =>
			Object.freeze([
				// { id: null, title: 'All Items' },
				{ id: 'isAsset', title: that.$t('Asset') },
				{ id: 'isStoreRoom', title: that.$t('Storeroom') }
				// { id: 4, name: 'Storeroom Id', prop: 'storeRoomId' }
				// { id: 2, name: 'Is limbo', value: { isLimbo: true } },
				// { id: 4, name: 'Display on dashboard', value: { displayOnDashboard: true } }
			]),

		requestsToDoList() {
			// console.log(3, this.filtersStateName, this.filters.assetId)
			let { assetId, brandId, brandModelId } = this.filters;
			assetId = assetId || (this.routeQuery && this.routeQuery.assetId);

			return Object.freeze([
				/*{
					action: 'fetch_equipment_types',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					localProp: 'equipmentTypesList',
					localLoadProp: 'equipmentTypesLoading'
				},*/
				{
					action: 'fetch_locations',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'locationsList',
					localLoadProp: 'locationsLoading'
				},
				{
					action: 'fetch_production_lines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId' },
						{ prop: 'filters.locationId', param: 'locationId' }
					],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_machines',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId' },
						{ prop: 'filters.locationId', param: 'locationId' },
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						}
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				},
				{
					action: 'fetch_assets',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: assetId
						? {
								fetchById: { action: 'assets/fetch_asset', itemId: assetId }
						  }
						: null,
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true },
						{
							prop: 'filters.locationId',
							param: 'locationId'
						},
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						},
						{
							prop: 'filters.machineId',
							param: 'machineId'
						}
					],
					localProp: 'assetsList',
					localLoadProp: 'assetsLoading'
				},
				{
					action: 'fetch_brands',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: brandId
						? {
								fetchById: { action: 'brands/fetch_brand', itemId: brandId }
						  }
						: null,
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true },
						{ prop: 'filters.locationId', param: 'locationId' },
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						},
						{
							prop: 'filters.machineId',
							param: 'machineId'
						}
					],
					localProp: 'brandsList',
					localLoadProp: 'brandsLoading'
				},
				{
					action: 'fetch_brand_models',
					payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
					initialSetup: brandModelId
						? {
								fetchById: {
									action: 'brand_models/fetch_brand_model',
									itemId: brandModelId
								}
						  }
						: null,
					bindTo: [
						{ prop: 'globalFilters.plantId', param: 'plantId', noFetch: true },
						{
							prop: 'filters.locationId',
							param: 'locationId'
						},
						{
							prop: 'filters.productionLineId',
							param: 'productionLineId'
						},
						{
							prop: 'filters.machineId',
							param: 'machineId'
						},
						{
							prop: 'filters.brandId',
							param: 'brandId'
						}
					],
					localProp: 'brandModelsList',
					localLoadProp: 'brandModelsLoading'
				}
			]);
		},

		selectedStoreroom() {
			const { storeRoomsList, filters } = this;
			if (storeRoomsList.length && filters.storeroomId) {
				return findItemBy('id', filters.storeroomId, storeRoomsList);
			}
			return null;
		},

		storeRoomLocationsList() {
			if (this.selectedStoreroom) {
				return this.selectedStoreroom.locations || [];
			}

			return [];
		}
	},

	methods: {
		...mapActions({
			fetch_locations: 'plants/fetch_locations',
			fetch_production_lines: 'production_lines/fetch_production_lines',
			fetch_machines: 'machines/fetch_machines',
			fetch_brands: 'brands/fetch_brands',
			fetch_brand_models: 'brand_models/fetch_brand_models',
			fetch_assets: 'assets/fetch_assets',
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			fetch_store_rooms: 'store_rooms/fetch_store_rooms',

			set_equipments_filters: 'equipments/set_equipments_filters',
			set_storeroom_brand_models_filters: 'brand_models/set_storerooms_filters',

			set_statistics_filters: 'sensors/set_statistics_filters',
			// reorder_equipment: 'equipments/reorder_equipment',
			show_edit_modal: 'show_edit_modal'
		}),

		/*reorderHandler(event) {
			const { oldIndex, newIndex, dragEvent } = event;

			if (oldIndex !== newIndex) {
				const currentBlock = dragEvent.data.originalSource;
				// console.log(oldIndex, newIndex, currentBlock)

				const payload = {
					data: {
						currentId: +currentBlock.dataset.id,
						desiredId: +currentBlock.nextElementSibling.dataset.id,
						className: this.itemsList[0].className
					}
				};
				// console.log(payload);
				this[this.reorderAction](payload);
			}
		},*/

		fetchEquipmentTypes() {
			this.doFetchAction(
				'fetch_equipment_types',
				'equipmentTypesList',
				'equipmentTypesLoading',
				{ params: { orderByColumn: 'name', orderByMethod: 'asc', max: -1 } }
			);
		},

		fetchStoreRooms() {
			const payload = { params: { max: -1, plantId: this.globalFilters.plantId } };

			this.doFetchAction(
				'fetch_store_rooms',
				'storeRoomsList',
				'storeRoomsLoading',
				payload
			);
		},

		toggleStoreroomFilter(show) {
			this.showStoreRoomFilter = show;

			if (this.showStoreRoomFilter) {
				this.setFilters({ isAsset: null, isStoreroom: true, page: 1 });

				if (!this.storeRoomsList.length) {
					this.fetchStoreRooms();
				}
			} else {
				this.setFilters({
					isAsset: true,
					isStoreroom: null,
					storeroomId: null,
					storeroomLocationId: null,
					page: 1
				});
			}
		},

		handleRadioFilters(selected_id) {
			this.toggleStoreroomFilter(selected_id == 'isStoreRoom');
			// console.log(selected_id)
			if (selected_id !== this.activeRadioFilter) {
				this.activeRadioFilter = selected_id;
				// const newFilters = this.prepareRadioFilters(selected_id);
				// this.setFilters(newFilters);
			}
		},

		toggleFilterbar(e) {
			this.$refs['DropdownFilterbar'].toggleFilterbar(e);
			this.initiateRequestsToDoList = true;
		},

		setFilters(filters, bindedFilters = [], settings = {}) {
			for (let item in filters) {
				// console.log( item, filters[item], typeof item, filters[item] instanceof Array )
				if (filters[item] instanceof Array) {
					//
				} else {
					if (typeof filters[item] != 'boolean') {
						const new_value = filters[item] ? +filters[item] : filters[item];
						// console.log(new_value, filters[item])
						filters[item] =
							!!new_value && !Number.isNaN(new_value) ? new_value : filters[item];
					}
				}
			}

			let newFilters = { ...this.finalFilters, ...filters };
			// console.log('setFilters', this.filters, filters, settings, newFilters)
			// console.log('filters',this.filters.page, newFilters.page, settings.preventResetPage)

			if (!settings.preventResetPage) {
				newFilters.page = 1;
				// console.log('filters',this.filters.page, newFilters.page)
			}
			if (bindedFilters.length) {
				for (const prop of bindedFilters) {
					if (!Object.keys(filters).some(k => k == prop)) {
						if (this.finalFilters[prop]) {
							newFilters[prop] = null;
						}
					}
				}
			}
			this.set_equipments_filters(newFilters);

			let removePropsForModels = [
				'hasSensors',
				'archivedNodes',
				'daterange_setted_at',
				'isHideList',
				'isShowListRefreshed2',
				'offlineNodes',
				'acknowledgeOnly',
				'alert_types',
				'assetId',
				'brandModelId',
				'daterange',
				'isShowList',
				'isStoreroom',
				'locationId',
				'machineId',
				'isAsset',
				'plantId',
				'predefinedOptionsValuesIDs',
				'productionLineId',
				'rawOptionsValuesIDs',
				'max',
				'sensor_class',
				'flat_metric_data_anomaly',
			];
			// console.log('3', removeObjProps(newFilters, removePropsForModels))
			this.set_storeroom_brand_models_filters(
				removeObjProps(newFilters, removePropsForModels)
			);
		},

		handleClearFilters() {
			this.alertTypesFilters = [];
			this.setFilters({}, this.clearableFiltersList);
		},

		handleAlertTypesFilter(ids) {
			this.alertTypesFilters = ids;
			const hasOffline = ids.some(id => id == 'offline');
			const hasAnomaly = ids.some(id => id == 'anomaly');
			let newFilters = { alert_types: ids.filter(id => id != 'offline' && id != 'anomaly') };

			if (hasOffline || hasAnomaly) {
				newFilters.offlineNodes = hasOffline || null;
				newFilters.flat_metric_data_anomaly = hasAnomaly || null;
			} else {
				this.alertTypesFilters = this.alertTypesFilters.filter(
					fi => fi !== 'offline' && fi !== 'anomaly'
				);
				newFilters.offlineNodes = null;
				newFilters.flat_metric_data_anomaly = null;
			}

			// console.log('newFilters', ids, newFilters)
			this.setFilters(newFilters);
		},

		/*localBeforeMountRequestsList() {
			this.toggleStoreroomFilter(this.activeRadioFilter === 'isStoreRoom');
		},*/

		specialFilterChange() {
			// console.log(params)
			// const currentFilter1 = this.filters.predefinedOptionsValuesIDs;
			// const currentFilter2 = this.filters.rawOptionsValuesIDs;

			let newFilters = {
				predefinedOptionsValuesIDs: [],
				rawOptionsValuesIDs: []
				/*rawOptionsValuesIDs: mergeArrays(
					currentFilter2, rawOptionsValuesIDs, {duplicateCheck: true}
				)*/
			};

			for (const FI of this.$refs['SpecialFilterItem']) {
				const { predefinedOptionsValuesIDs, rawOptionsValuesIDs } = FI._data;

				newFilters.predefinedOptionsValuesIDs = mergeArrays(
					newFilters.predefinedOptionsValuesIDs,
					predefinedOptionsValuesIDs,
					{ duplicateCheck: true }
				);

				newFilters.rawOptionsValuesIDs = mergeArrays(
					newFilters.rawOptionsValuesIDs,
					rawOptionsValuesIDs,
					{ duplicateCheck: true }
				);
			}

			// console.log(currentFilter2, rawOptionsValuesIDs)
			this.setFilters(newFilters);
		},

		handleSensorTypeFilter(value) {
			this.setFilters({ sensor_class: value });
		},

		handleDateRange(range /*settings*/) {
			// console.log(range)
			this['set_equipments_filters']({
				...this['filters'],
				daterange: range,
				daterange_setted_at: Date.now()
			});
			this['set_statistics_filters']({
				...this['statistics_filters'],
				daterange: [
					getYmdDateString({ ms: `${range[0]} 00:00:00`, withTime: true }),
					getYmdDateString({ ms: `${range[1]} 23:59:59`, withTime: true })
				],
				daterange_setted_at: Date.now()
			});
		},

		createItem(payload) {
			if (this.activeRadioFilter != 'isAsset') {
				const { ItemsListContainer } = this.$refs;

				// console.log(payload)
				let modalSettings = {
					show: true,
					instanceName: this.itemsName.instanceName,
					itemName: this.itemsName ? this.itemsName.one : '',
					callback: ItemsListContainer.localModalSettings.callback,
					...this.additionalModalSettings
				};
				this.show_edit_modal(modalSettings);
			} else {
				const { ItemsListContainer } = this.$refs;

				if (ItemsListContainer) {
					ItemsListContainer.createItem(payload);
				}
			}
		},
		handleDeleteItems(payload) {
			const { ItemsListContainer } = this.$refs;

			if (ItemsListContainer) {
				ItemsListContainer.handleDeleteItems(payload);
			}
		}
	},

	watch: {
		/*'globalFilters.plantId'(id) {
			if (!id) {
				this.draggingLocked = true;
			}
			// this.startFetchRequests(this.requestsToDoList);
			const nestedRef = this.$refs['ItemsListContainer'];

			if (nestedRef) {
				nestedRef.cleanRouteQuery ? nestedRef.cleanRouteQuery() : null;
				nestedRef._data.preventFetch = true;				
			}
			console.log(this.bindedFilters)
			this.setFilters({ locationId: null }, this.bindedFilters);
			this.locationsList = [];
			// this.preventFetch = true;
			this.productionLinesList = [];
			this.machinesList = [];
			this.assetsList = [];
			this.brandModelsList = [];
			this.storeRoomsList = [];

			if (this.showStoreRoomFilter) {
				this.fetchStoreRooms();
			}
		},*/

		'propsFilters.daterange'(range) {
			this.handleDateRange(range);
		},

		'filters.isShowList'(isShow) {
			// console.log('filters.isShowList', isShow)

			if (isShow && !this.equipmentTypesList.length) {
				this.fetchEquipmentTypes();
			}
		},

		'filters.storeroomId'(id) {
			// console.log('filters.storeroomId', id)
			if (!id) {
				this.preventFetch = true;
				this.setFilters({ storeroomLocationId: null });
			}
		},

		'filters.hasSensors'(has) {
			// console.log('filters.hasSensors', has)
			if (!has) {
				this.preventFetch = true;
				this.setFilters({ archivedNodes: null, sensor_class: null });
			}
		},
		/*'filters.alert_types'(alert_types) {
			console.log(alert_types)
			if (!alert_types || !alert_types.length) {
				this.alertTypesFilters = [];
			}
		},*/

		/*'filters.typeId'(id) {
			console.log(id, this.equipmentTypesList)
			
		},*/

		'$route'(route) {
			this.redirectPage(route.path);
			this.setupFilters(this.currentPath);
		}
	},

	beforeMount() {
		if (!this.filters.isShowList && !this.filters.isShowListRefreshed2) {
			this.setFilters({ isShowList: true }, [], { preventResetPage: true });
		}

		this.preventFetch = true;
		this.setFilters({ isShowListRefreshed2: true }, [], { preventResetPage: true });

		if (this.gridViewBeforeMount) this.gridViewBeforeMount();

		if (this.filters.isStoreroom) {
			this.handleRadioFilters('isStoreRoom');
		} else {
			this.preventFetch = true;
			this.setFilters({ isAsset: true }, [], { preventResetPage: true });
		}

		this.alertTypesFilters = this.filters.alert_types
			? cloneArr(this.filters.alert_types)
			: [];
		if (this.filters.offlineNodes) {
			this.alertTypesFilters.push('offline');
		}
		if (this.filters.flat_metric_data_anomaly) {
			this.alertTypesFilters.push('anomaly');
		}

		/*if (!this.filters.acknowledgeOnly) {
			this.preventFetch = true;
			this.setFilters({ acknowledgeOnly: null });
		}*/

		if (!this.filters.daterange) {
			this.preventFetch = true;
			this.handleDateRange(
				getDateRange('today', {
					getDateString: true
					// withTime: true
				})
			);
		}
		// console.log(this.propsFilters.daterange)
		if (this.propsFilters.daterange) {
			this.preventFetch = true;
			this.handleDateRange(this.propsFilters.daterange);
		}

		if (!this.fromDashboard || this.filters.isShowList) {
			this.fetchEquipmentTypes();
		}
	},

	beforeDestroy() {
		let newFilters = {
			predefinedOptionsValuesIDs: [],
			rawOptionsValuesIDs: []
			// isStoreroom: null,
			// storeroomId: null,
		};

		this.setFilters(newFilters, [], { preventResetPage: true });
	}
};
</script>
