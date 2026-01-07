<template>
	<div
		class="edit-form-container"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<div class="nav-tabs-container small section-row">
			<div class="underline-tabs">
				<TabsBar
					@switchTab="switchTab"
					:activeTab="activeTab"
					:tabsList="tabsList"
				/>
				<!-- <el-button
					v-for="tab in tabsList"
					:key="`tab_${tab.title}`"
					:class="['capitalize', { active: tab.prop == activeTab }]"
					round
					@click="toggleTab(tab)"
					v-text="tab.title"
					:disabled="
						tab.prop == 'solenoidsTabActive' && formData.type !== PUMP_TYPES.GRACO
					"
				/> -->
			</div>
		</div>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form section-row"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div
				v-show="activeTab.prop == tabsList[0].prop"
				:key="tabsList[0].title"
				class="tab-container"
			>
				<el-form-item :label="`${tt('Pump')} ${tt('type')}`" prop="type">
					<el-select
						v-model="formData.type"
						:placeholder="`${tt('Select')} ${tt('type')}`"
					>
						<el-option
							v-for="item in pumpTypesList"
							:key="'type-' + item.id"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>

				<el-form-item
					:label="tt('Sensor')"
					prop="sensor_id"
					v-show="formData.type === PUMP_TYPES.PULSAR"
				>
					<SimpleSpinner :active="sensorsLoading" />
					<el-select
						:disabled="!sensorsList.length"
						v-model="formData.sensor_id"
						:placeholder="`${tt('select')} ${tt('sensor')}`"
					>
						<el-option
							v-for="item in sensorsList"
							:key="'sensor_id-' + item.id"
							:label="setupLabel(item, sensorsLabelOptions)"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>

				<el-form-item :label="tt('Radio_Node')" prop="radio_id">
					<SimpleSpinner :active="radiosLoading" />
					<el-select
						:disabled="!radiosList.length"
						v-model="formData.radio_id"
						:placeholder="`${tt('select')} ${tt('node')}`"
					>
						<el-option
							v-for="item in radiosList"
							:key="'radio_id-' + item.id"
							:label="`${tt('position')} - ${item.position}`"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>

				<el-form-item :label="tt('Position')" prop="position">
					<el-input v-model="formData.position" />
				</el-form-item>

				<el-form-item
					:label="`${tt('Lube_cycle')} ${tt('max')}`"
					prop="lube_cycle_max_count"
				>
					<el-input-number v-model="formData.lube_cycle_max_count" :min="0" />
				</el-form-item>

				<el-form-item
					:label="`${tt('Lube_cycle')} ${tt('constants.warning')} ${tt('count')}`"
					prop="lube_cycle_warning_count"
				>
					<el-input-number v-model="formData.lube_cycle_warning_count" :min="0" />
				</el-form-item>

				<div class="custom-form-item el-form-item">
					<div class="el-form-item__label">
						{{ tt('phrases.lube_cycle_spent_count') }}
					</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="formData.lube_cycle_spent_count"
					></div>
				</div>
			</div>

			<div
				v-show="activeTab.prop == tabsList[1].prop"
				:key="tabsList[1].title"
				class="tab-container"
			>
				<el-form-item
					:label="tt('Solenoids')"
					prop="solenoids"
					v-if="formData.type === PUMP_TYPES.GRACO"
				>
					<div class="options-container solenoids-container">
						<div v-if="formItemsList.length" class="content-row">
							<SolenoidItem
								ref="SolenoidItem"
								v-for="(item, idx) in formItemsList"
								:key="`solenoid_item-${item.id}`"
								:sensorsList="sensorsList"
								:item-data="item"
								:item-index="idx"
								:pump="itemData"
								@onRemove="id => removeFormItem(id, 'formItemsList')"
							/>
						</div>

						<div class="1margin-top-row">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								icon="icomoon icon-cross"
								@click="addFormItem('formItemsList', 's_i-')"
							/>
						</div>
					</div>
				</el-form-item>
			</div>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { PUMP_TYPES, pumpTypesList } from '@/constants/global';

import { setupLabel } from '@/helpers';
import { required } from '@/constants/validation';
import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin,
	tabsMixin
} from '@/mixins';

export default {
	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		SolenoidItem: () => import('./SolenoidItem.vue')
	},
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin(),
		tabsMixin()
	],

	data() {
		return {
			collectedData: [],
			formItemsList: [],

			sensorsLoading: false,
			sensorsList: [],
			radiosLoading: false,
			radiosList: [],

			formData: {
				type: null,
				sensor_id: null,
				radio_id: null,
				position: '',
				lube_cycle_max_count: 0,
				lube_cycle_warning_count: 0,
				lube_cycle_spent_count: 0,
				solenoids: []
			},

			rules: {
				type: required,
				sensor_id: required,
				radio_id: required,
				position: required
			}
		};
	},

	computed: {
		PUMP_TYPES: () => PUMP_TYPES,
		pumpTypesList: () => Object.freeze(pumpTypesList()),

		tabsList: that =>
			Object.freeze(
				that.$translate([
					{ title: 'Pump', prop: 'pumpTabActive' },
					{ title: 'Solenoids', prop: 'solenoidsTabActive' }
				])
			),

		sensorsLabelOptions: () => ({
			accessors: ['name', 'item_type', 'uuid'],
			delimeter: ','
		}),
		setupLabel: () => setupLabel,

		subItemsSettings: () => Object.freeze([
			{ ref:'SolenoidItem', targetProp:'solenoids' }
		]),

		requestsToDoList: () => Object.freeze([
			{
				action: 'fetch_sensors',
				payload: { prepareData: 'ultrasoundSensorsOnly' },
				localProp: 'sensorsList',
				localLoadProp: 'sensorsLoading'
			},
			{
				action: 'fetch_ultrasound_radios',
				// bindTo: { prop: 'formData.companies_ids', param: 'companies_ids' },
				localProp: 'radiosList',
				localLoadProp: 'radiosLoading'
			}
		])
	},

	methods: {
		...mapActions({
			fetch_sensors: 'sensors/fetch_sensors',
			fetch_ultrasound_radios: 'ultrasound_radios/fetch_ultrasound_radios'
		}),

		localSetupPage(itemData) {
			this.formItemsList = this.setupFormSubItemsList(itemData.solenoids, 's_i');
		},

		localPrepareSubmitData(data) {
			let newData = data;
			const { type } = this.formData;
			if (type !== PUMP_TYPES.GRACO) {
				delete newData.solenoids;
			}

			if (type !== PUMP_TYPES.PULSAR) {
				delete newData.sensor_id;
			}

			return newData;
		}
	},

	watch: {
		'formData.type'(type) {
			if (type === PUMP_TYPES.GRACO) {
				this.rules.sensor_id = null;
			} else if (type === PUMP_TYPES.PULSAR) {
				this.rules.sensor_id = required;
			}
		}
	}
};
</script>
