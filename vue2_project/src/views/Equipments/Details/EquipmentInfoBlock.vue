<template>
	<div class="equipment-info-container view-content-card">
		<!-- <VueElementLoading
			:active="itemLoading"
			spinner="ring"
			:text="'Item loading...'"
			:background-color="'rgba(255, 255, 255, .7)'"
		/> -->
		<div class="content-row ">
			<div class="header-block">
				<div class="card">
					<div class="card-content flex">
						<!-- <div class="filter-item"> -->
						<Datepicker
							setupDaterangeFilter
							enableShortcuts
							@input="
								range =>
									set_filters({
										...filters,
										daterange: range,
										daterange_setted_at: Date.now()
									})
							"
							:value="filters.daterange"
							type="daterange"
							clearingTo="last_7_days"
						/>
						<!-- </div> -->
					</div>
				</div>
			</div>

			<div class="content-row">
				<div class="mrow flex wrap big-padding specifications-block-wrapper">
					<div
						:class="[
							'specifications-block mcol-xs-12 mcol-lg-6 mcol-xlg-5 flex column',
							{ 'fit-content': viewAll_0.active || viewAll_1.active }
						]"
					>
						<div :class="['card content-row', { viewAll: viewAll_0.active }]">
							<div class="card-header">
								<div class="title semi-bold uppercase">
									{{
										`${tt('SPECIFICATIONS')} ${equipmentData.equipment_type_name}`
									}}
								</div>
							</div>
							<div class="card-content relative">
								<div :class="['info-list-container']">
									<ul class="info-list primary main dots-in-text">
										<li v-if="pageTitle.title">
											<span class="label bold">{{ pageTitle.title }}</span>
											<span class="value fz_30" v-text="pageTitle.label"></span>
										</li>

										<InfoItem
											class="capitalize"
											v-for="item in specificationsItemsList"
											:key="`info-${item.label}`"
											:settingItem="item"
											:itemData="equipmentData"
											emptyText=" "
										/>

										<InfoItem
											v-for="item in typeOptionsList"
											:key="`spec-${item.id}`"
											:settingItem="item"
											keyProp="name"
											emptyText=" "
											:valueMethod="getOptionValue"
										/>

										<!-- <li
											v-for="item in specificationsList"
											:key="`spec-${item.label}`"
										>
											<span class="label" v-text="`${item.label}`"></span>
											<span class="value" v-text="item.value"></span>
										</li>

										<li
											v-for="(item, idx) in typeOptionsList"
											:key="`${idx}-option-${item.id}`"
										>
											<span class="label" v-text="`${item.name}`"></span>
											<span class="value" v-text="getOptionValue(item)"></span>
										</li> -->
									</ul>
								</div>
							</div>

							<div class="view-all-button xs-hide lg-show" v-if="viewAll_0.show">
								<div
									:class="['link flex align-center', { active: viewAll_0.active }]"
									@click="viewAll_0.active = !viewAll_0.active"
								>
									<span>{{ tt('phrases.View_All') }}</span>
									<i class="icomoon icon-path_2"></i>
								</div>
							</div>
						</div>

						<div
							:class="['card content-row', { viewAll: viewAll_1.active }]"
							v-if="equipmentSubType"
						>
							<div class="card-header">
								<div class="title semi-bold uppercase">
									{{ `${tt('SPECIFICATIONS')} ${equipmentSubType.name}` }}
								</div>
							</div>
							<div class="card-content relative">
								<div :class="['info-list-container']">
									<ul class="info-list primary main dots-in-text">
										<InfoItem
											v-if="subTypeBrand"
											:key="`subTypeBrand-${subTypeBrand.id}`"
											:itemData="subTypeBrand"
											:settingItem="{ label: 'Brand', prop: 'name' }"
											emptyText=" "
										/>
										<InfoItem
											v-if="subTypeModel"
											:key="`subTypeModel-${subTypeModel.id}`"
											:itemData="subTypeModel"
											:settingItem="{ label: 'Part Number', prop: 'name' }"
											emptyText=" "
										/>
										<InfoItem
											v-for="item in subTypeOptions"
											:key="`spec-${item.id}`"
											:settingItem="item"
											keyProp="name"
											emptyText=" "
											:valueMethod="getOptionValue"
										/>
									</ul>
								</div>
							</div>

							<div class="view-all-button xs-hide lg-show" v-if="viewAll_1.show">
								<div
									:class="['link flex align-center', { active: viewAll_1.active }]"
									@click="viewAll_1.active = !viewAll_1.active"
								>
									<span>{{ tt('phrases.View_All') }}</span>
									<i class="icomoon icon-path_2"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="secondary-block mcol-xs-12 mcol-lg-6 mcol-xlg-7">
						<div class="mrow flex column big-padding">
							<div class="mrow flex wrap">
								<CrossoverBlock
									:class="['mcol-xs-12', { 'mcol-xlg-6': equipmentSubType }]"
									:crossoverList="crossoverList['mainType']"
									:crossoverLoading="crossoverLoading"
									:equipmentData="equipmentData"
									:equipmentTypeName="equipmentData.equipment_type_name"
								/>

								<CrossoverBlock
									v-if="equipmentSubType"
									class="mcol-xs-12 mcol-xlg-6"
									:crossoverList="crossoverList['subType']"
									:crossoverLoading="crossoverLoading"
									:equipmentData="equipmentData"
									:equipmentTypeName="equipmentSubType.name"
								/>
							</div>

							<div class="imgs-block">
								<div class="card">
									<div class="card-header">
										<div class="title semi-bold uppercase">{{ tt('IMAGE') }}</div>
									</div>
									<div class="card-content">
										<div
											class="imgs-list mrow flex wrap"
											v-if="filteredImagesList.length"
										>
											<div
												class="img-item mcol-xs-12 mcol-md-6"
												v-for="img in filteredImagesList"
												:key="`image-${img.id}`"
											>
												<div class="content-container">
													<div class="imgWrapper pointer">
														<img
															@click="togglePreviewModal(img.id)"
															:src="img.full_file_name"
															alt="img error"
														/>
													</div>

													<div class="title muted semi-bold">
														{{ getImgTypeName(img) }}
													</div>
												</div>
											</div>
										</div>

										<div v-else class="imgs-list">
											<div class="img-item text-center">
												<img
													src="/static/img/equipment_mock.jpg"
													alt="error"
													class="plant-dashboard-logo-mock"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="content-row ">
				<div class="mrow flex wrap big-padding">
					<div class="mcol-xs-12 mcol-lg-6">
						<ItemPDMsStatisticBlock
							:filters="filters"
							:predefinedFilters="predefinedFilters"
						/>
					</div>

					<div
						class="mcol-xs-12 mcol-lg-6"
						v-if="$hasAccessTo(['view_maintenance'])"
					>
						<ItemWOStatisticBlock
							:createWOButtonFormSetup="createWOButtonFormSetup"
							@event="handleEventNew"
							:itemData="equipmentData"
							:filters="filters"
							:predefinedFilters="predefinedFilters"
						/>
					</div>
				</div>
			</div>

			<div class="content-row requests-block mcol-xs-12">
				<div class="card">
					<div class="card-header">
						<div class="title semi-bold uppercase">
							{{ tt('phrases.MOTOR_RESULTS') }}
						</div>
					</div>
					<div class="nested-view-content-wrapper">
						<RFQSList
							preventSetNavbar
							editInModal
							fromCard
							:equipmentData="equipmentData"
							:additionalModalSettings="rfqEditModalSettings"
						/>
					</div>
				</div>
			</div>

			<div class="content-row">
				<MaintenanceListWrapper
					v-if="$hasAccessTo(['view_maintenance'])"
					ref="MaintenanceListWrapper"
					hideDatepicker
					:woFilters="woFilters"
					:logFilters="logFilters"
				/>
			</div>

			<div class="content-row">
				<div class="card">
					<div class="card-header">
						<div class="title semi-bold uppercase">{{ tt('HISTORY') }}</div>
					</div>
					<div class="nested-view-content-wrapper">
						<MoveHistoryList
							ref="MoveHistoryList"
							hideDatepicker
							:itemsList="equipmentData.histories || []"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapActions } from 'vuex';
import { mergeArrays, cloneDeep } from '@/helpers';
import { getImgTypeName } from '@/helpers/specialHelpers';

import { mainInstanceDetailsPage, eventHandler } from '@/mixins';

export default {
	mixins: [mainInstanceDetailsPage(), eventHandler()],
	components: {
		InfoItem: () => import('@/components/itemDetails/InfoItem.vue'),
		CrossoverBlock: () => import('./CrossoverBlock.vue'),

		RFQSList: () => import('@/views/RFQS/ItemsList.vue'),
		MoveHistoryList: () => import('./MoveHistoryList.vue'),
		ItemPDMsStatisticBlock: () =>
			import('@/components/itemDetails/ItemPDMsStatisticBlock.vue'),

		ItemWOStatisticBlock: () =>
			import('@/components/itemDetails/ItemWOStatisticBlock.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		MaintenanceListWrapper: () =>
			import('@/components/itemDetails/MaintenanceListWrapper.vue')
	},

	props: {
		equipmentData: {
			type: Object,
			required: true
		},
		/*paramsId: {
			type: Number,
			required: true
		},*/
		crossoverList: Object,
		crossoverLoading: Boolean
	},

	data() {
		return {
			// viewAllButtons: {},
			viewAll_0: {
				show: false,
				active: false
			},
			viewAll_1: {
				show: false,
				active: false
			}
			// equipmentType: null,
			// equipmentTypeLoading: false
			// withoutClearItem: false
		};
	},

	computed: {
		filters() {
			return this.$store.state.equipments.filters;
		},

		getImgTypeName: () => getImgTypeName,

		specificationsItemsList: that =>
			Object.freeze(
				that.$translate([
					{ label: 'Company', prop: 'company_name' },
					{ label: 'Plant', prop: 'plant_name' },
					{ label: 'Machine', prop: 'machine_name' },
					{ label: 'Location', prop: 'location_name' },
					{ label: 'Application', prop: 'application_name' },
					{ label: 'Brand', prop: 'brand_name' },
					{ label: 'Part_number', prop: 'brand_model_name' },
					{ label: 'phrases.Loc_on_machine', prop: 'loc_on_machine' },
					{
						label: 'Storeroom',
						prop: 'storeRooms',
						meta: { fromArray: { subProp: 'name' } }
					},
					{ label: 'Description', prop: 'notes' }
					// { label: 'In store room', prop: 'is_store_room' }
				])
			),

		/*specificationsList() {
			const { equipmentData } = this;

			if (equipmentData) {
				let list = this.specificationsItemsList.map(si => {
					const value = equipmentData[si.prop];
					if (value !== undefined && !!value) {
						return { label: si.label, value: value };
					}
					return false;
				});

				return Object.freeze(list.filter(li => !!li));
			}

			return [];
		},*/

		imagesList() {
			if (this.equipmentData) {
				const equipmentData = cloneDeep(this.equipmentData);
				let { pictures, machine_pictures } = equipmentData;
				pictures = pictures || [];
				machine_pictures = machine_pictures || [];
				return Object.freeze(mergeArrays(pictures, machine_pictures));
			}
			return [];
		},

		filteredImagesList() {
			const { imagesList } = this;
			let result = [];

			for (let i = 0; i < imagesList.length; i++) {
				let img = imagesList[i];
				if (result.some(r => r.type == img.type)) {
					continue;
				} else {
					img.id = `${img.id}-${i}`;
					result.push(img);
				}
			}

			return Object.freeze(result);
		},

		typeOptionsList() {
			if (this.equipmentData && this.equipmentData.typeOptions) {
				return Object.freeze(
					this.equipmentData.typeOptions.filter(
						o => o.raw_values && o.raw_values.length
					)
				);
			}
			return [];
		},

		pageTitle() {
			let result = { title: '', label: '' };

			if (this.equipmentData) {
				if (this.equipmentData.asset_name) {
					result.title = this.tt(`Asset`);
					result.label = `${this.equipmentData.asset_name}`;
				} else if (this.equipmentData.last_asset_name) {
					result.title = `${this.tt('Last')} ${this.tt('Asset')}`;
					result.label = `${this.equipmentData.last_asset_name}`;
				}
			}
			return Object.freeze(result);
		},

		equipmentSubType: that => Object.freeze(that.equipmentData.equipmentSubType),

		subTypeOptions: that => Object.freeze(that.equipmentData.subTypeOptions),
		subTypeBrand: that => Object.freeze(that.equipmentData.subTypeBrand),
		subTypeModel: that => Object.freeze(that.equipmentData.subTypeModel),

		/*historyItemsList() {
			return Object.freeze([
				{ created_at: this.equipmentData.created_at || '-', created: true }
			].concat(this.equipmentData.histories))
		},*/

		preventSetupNavbar: () => true,
		preventDestroyNavbar: () => true,

		rfqEditModalSettings: () =>
			Object.freeze({
				hideFooter: true,
				settings: { showJustInfo: true }
			}),

		predefinedFilters: that =>
			Object.freeze({
				productionLineId: that.equipmentData.production_line_id,
				machineId: that.equipmentData.machine_id,
				assetId: that.equipmentData.asset_id,
				equipmentId: that.equipmentData.id,
				plantId: that.equipmentData.plant_id
			}),

		createWOButtonFormSetup: () =>
			Object.freeze([
				{ formKey: 'production_line_id', valKey: 'production_line_id' },
				{ formKey: 'machine_id', valKey: 'machine_id' },
				{ formKey: 'asset_id', valKey: 'asset_id' },
				{ formKey: 'equipment_id', valKey: 'id' }
			])
	},

	methods: {
		...mapActions({
			set_filters: 'equipments/set_equipments_filters',
			show_edit_modal: 'show_edit_modal'
		}),

		getOptionValue(option) {
			const {
				/*has_predefined_values*/ /*, predefined_values, value_minus, value_plus*/ raw_values
			} = option;
			let value = '';

			raw_values.forEach(rv => {
				value += ` ${rv}`;
			});
			/*		value += value_minus ?`${value_minus}` : '';
					value += value_plus ? ` ${value_plus}` : '';

				if (has_predefined_values) {
					value += ' Predefined:';
					predefined_values.forEach(pv => {
						value += ` ${pv}`;					
					});
			}*/

			return value;
		},

		// -------
		togglePreviewModal(id) {
			const payload = {
				eventName: 'togglePreviewModal',
				data: {
					picturesList: this.imagesList,
					pictureId: id
				},
				onward: true
			};
			this.$emit('event', payload);
		},

		setupInfoBlocksHeights() {
			const listContainers = document.querySelectorAll(
				'.specifications-block .info-list-container .info-list'
			);
			if (listContainers.length) {
				listContainers.forEach((li, idx) => {
					this[`viewAll_${idx}`].show = li.parentNode.clientHeight < li.clientHeight;

					// console.log(li.parentNode.parentNode, li.parentNode.parentNode.clientHeight)
				});

				setTimeout(() => {
					let minHeight = '';
					if (this[`viewAll_0`].show) {
						minHeight = `${listContainers[0].parentNode.parentNode.clientHeight}px`;
					} else {
						// listContainers[0].parentNode.parentNode.parentNode.style.flexGrow = 0;
						minHeight = `${listContainers[0].clientHeight + 30}px`;
					}
					listContainers[0].parentNode.parentNode.style.minHeight = minHeight;
				}, 200);
			}
		}
	},

	watch: {
		equipmentData() {
			setTimeout(() => {
				this.setupInfoBlocksHeights();
			}, 1000);
		}
	},

	mounted() {
		// this.showViewAllButton = true;
		// if (this.typeOptionsList.length) {

		setTimeout(() => {
			this.setupInfoBlocksHeights();
		}, 1000);
	}
};
</script>
