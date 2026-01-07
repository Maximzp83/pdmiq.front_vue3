<template>
	<el-form
		class="item-edit-form content-row"
		label-width="150px"
		ref="itemForm"
		:model="formData"
		:rules="rules"
		:label-position="'top'"
	>
		<div class="content-row">
			<b>{{ `${tt('Lubricator')} ${tt('configuration')}` }}</b>
		</div>
		<div class="content-row">
			<el-form-item
				:label="`${tt('Lubricator')} ${tt('type')}`"
				prop="type"
				class="mcol-lg-6"
			>
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
		</div>

		<div class="form-section paint content-row items_width_180">
			<div
				class="flex mrow wrap content-row"
				v-show="formData.type === PUMP_TYPES.PULSAR"
			>
				<el-form-item
					class="mcol-xs-12 mcol-md-6"
					:label="tt('Grease_pack')"
					prop="lubricant_container"
				>
					<CustomSelect
						required
						:optionsList="greasePacksList"
						:placeholder="`${tt('select')} ${tt('pack')}`"
						v-model="formData.lubricant_container"
						labelKey="label"
						valueKey="val"
						idKey="val"
					/>
				</el-form-item>

				<el-form-item
					:label="tt('phrases.Modes_of_Cycles')"
					prop="lube_cycle_max_count"
					class="mcol-xs-12 mcol-md-6"
				>
					<CustomSelect
						:optionsList="numberOfCyclesList"
						:placeholder="`${tt('select')} ${tt('mode')}`"
						v-model="formData.lube_cycle_max_count"
						labelKey="label"
						valueKey="val"
						idKey="val"
					/>

					<span class="input-description bold right-outside">
						{{ totalLubeLevel }}
					</span>
				</el-form-item>

				<el-form-item
					:label="`${tt('Warning')} ${tt('Level')}`"
					prop="lube_cycle_warning_count"
					class="mcol-xs-12 mcol-md-6"
				>
					<el-input-number v-model="formData.lube_cycle_warning_count" :min="0" />
				</el-form-item>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ tt('phrases.lube_cycle_spent_count') }}
					</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="formData.lube_cycle_spent_count"
					></div>
				</div>
			</div>

			<div class="flex mrow wrap" v-show="formData.type === PUMP_TYPES.PERMA">
				<el-form-item
					class="mcol-xs-12 mcol-md-6"
					:label="`${tt('Lubricant')} ${tt('type')}`"
					prop="lubricant_type_id"
				>
					<CustomSelect
						:optionsLoading="lubeTypesLoading"
						:optionsList="lubeTypesList"
						:placeholder="`${tt('Select')} ${tt('type')}`"
						v-model="formData.lubricant_type_id"
					/>
				</el-form-item>

				<el-form-item
					class="mcol-xs-12 mcol-md-6"
					:label="`${tt('Lubricant')} ${tt('Cartridge')}`"
					prop="lubricant_container"
				>
					<CustomSelect
						required
						:optionsList="lubricantCartridgeList"
						:placeholder="`${tt('select')} ${tt('cartridge')}`"
						v-model="formData.lubricant_container"
						labelKey="label"
						valueKey="val"
						idKey="val"
					/>
				</el-form-item>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ `${tt('Lubricant')} ${tt('Density')}` }} (g/cm3)
					</div>
					<div class="value-instead-input el-form-item__content bold"></div>
					<!-- v-text="calculatedLubesData.gramsLubricantAmount" -->
				</div>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ tt('phrases.Lube Cycles Per Cartridge') }}
					</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="permaLubeCyclesPerCartridge"
					></div>
				</div>

				<el-form-item
					label="Lubricant Amount (cm3/cycle)"
					prop="lubricant_amount"
					class="mcol-xs-12 mcol-md-6"
				>
					<CustomSelect
						:optionsList="lubricantAmountsList"
						:placeholder="`${tt('select')} ${tt('Amount')}`"
						v-model="formData.lubricant_amount"
						labelKey="label"
						valueKey="val"
						idKey="val"
					/>
				</el-form-item>

				<el-form-item
					:label="`${tt('Warning')} ${tt('Level')}`"
					prop="lube_cycle_warning_count"
					class="mcol-xs-12 mcol-md-6"
				>
					<el-input-number v-model="formData.lube_cycle_warning_count" :min="0" />
				</el-form-item>
			</div>
		</div>

		<div v-show="formData.type === PUMP_TYPES.PERMA" class="content-row">
			<b>{{ `${tt('Lubrication')} ${tt('Amount')}` }}</b>
		</div>

		<div
			v-show="formData.type === PUMP_TYPES.PERMA"
			class="form-section paint content-row items_width_180"
		>
			<div class="flex mrow wrap content-row">
				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ tt('phrases.total_lubricant_dilevered_in_all_sets') }} (g)
					</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="calculatedLubesData.totalGramsLubricantDeliveredInAllSets || '-'"
					></div>
				</div>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ tt('phrases.total_lubricant_dilevered_in_all_sets') }} (% of CQ)
					</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="
							calculatedLubesData.totalPercentLubricantDeliveredInAllSets || '-'
						"
					></div>
				</div>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ tt('phrases.target_lubricant_per_cycle') }} (g)
					</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="calculatedLubesData.targetLubricantPerCycle || '-'"
					></div>
				</div>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ tt('phrases.lubricant_dilevered_per_cycle') }} (% of CQ)
					</div>
					<div class="value-instead-input el-form-item__content bold"></div>
					<!-- v-text="calculatedLubesData.lube_cycle_spent_count || '-'" -->
				</div>

				<div class="el-form-item mcol-xs-12 mcol-md-6">
					<div class="el-form-item__label">
						{{ tt('phrases.actual_lubricant_per_cycle') }} (g)
					</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="calculatedLubesData.actualLubricantPerCycle || '-'"
					></div>
				</div>
			</div>
		</div>

		<!-- <div class="content-row">
			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</div> -->
	</el-form>
</template>

<script>
// import { mapActions } from 'vuex';
import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { PUMP_TYPES, pumpTypesList } from '@/constants/global';

import {
	greasePacksList,
	pulsarLubeLevelStep,
	lubricantCartridgeList
} from '@/constants/ultrasound';

import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	components: {},
	props: {
		equipmentData: {
			type: Object,
			default: () => ({})
		},
		isNew: Boolean,
		lubeTypesList: Array,
		lubeTypesLoading: Boolean,
		calculatedLubesData: { type: Object, default: () => ({}) }
	},

	data() {
		return {
			formData: {
				id: null,
				type: null,
				sensor_id: null,
				lubricant_container: null,
				lube_cycle_max_count: null,
				lube_cycle_warning_count: 20,
				lube_cycle_spent_count: 0,

				lubricant_type_id: null,
				lubricant_amount: null
			},

			rules: {
				type: required,
				sensor_id: required,
				lubricant_container: required,
				lube_cycle_max_count: required,
				lubricant_amount: null
				// radio_id: required,
			}
		};
	},

	computed: {
		// targetPropName: () => 'pumpFormData',

		pumpTypesList: () => Object.freeze(pumpTypesList()),
		PUMP_TYPES: () => Object.freeze(PUMP_TYPES),

		greasePacksList: () => Object.freeze(greasePacksList()),
		pulsarLubeLevelStep: () => Object.freeze(pulsarLubeLevelStep),
		lubricantCartridgeList: () => Object.freeze(lubricantCartridgeList()),

		numberOfCyclesList() {
			if (this.formData.lubricant_container) {
				const pack = findItemBy(
					'val',
					this.formData.lubricant_container,
					this.greasePacksList
				);
				if (pack) return Object.freeze(pack.cyclesList);
			}
			return [];
		},

		lubricantAmountsList() {
			if (this.formData.lubricant_container) {
				const pack = findItemBy(
					'val',
					this.formData.lubricant_container,
					this.lubricantCartridgeList
				);
				if (pack) return Object.freeze(pack.amountsList);
			}
			return [];
		},

		permaLubeCyclesPerCartridge() {
			const { formData, lubricantAmountsList } = this;

			if (formData.type === PUMP_TYPES.PERMA && formData.lubricant_amount) {
				const item = findItemBy(
					'val',
					formData.lubricant_amount,
					lubricantAmountsList
				);

				if (item) return Object.freeze(item.pos);
			}

			return 0;
		},

		totalLubeLevel() {
			const { lube_cycle_max_count, lubricant_container } = this.formData;
			const { numberOfCyclesList } = this;

			if (lubricant_container && lube_cycle_max_count && numberOfCyclesList.length) {
				const selectedItem = findItemBy(
					'val',
					lube_cycle_max_count,
					numberOfCyclesList
				);

				if (selectedItem) {
					return `${selectedItem.pos * pulsarLubeLevelStep.val}${
						pulsarLubeLevelStep.unit
					}`;
				}
			}
			return 0;
		}
	},

	methods: {
		localSetupPageActions(itemData) {
			if (!itemData.type) {
				this.formData.type = PUMP_TYPES.PULSAR;
			}
		},

		localGetFormDataCallback(data) {
			// let { data } = payload;
			// data.id = this.itemId;

			if (data.type !== PUMP_TYPES.PULSAR) {
				delete data.lube_cycle_max_count;
			} else if (data.type !== PUMP_TYPES.PERMA) {
				delete data.lubricant_amount;
			}

			// payload.data = data;
			return data;
		},

		handleResetValidate() {
			if (this.$refs['itemForm']) {
				this.$refs['itemForm'].clearValidate();
			}
		},

		handleCalculateData() {
			const { lubricant_type_id, lubricant_amount } = this.formData;

			if ((lubricant_type_id, lubricant_amount)) {
				this.$emit('event', 'calculateLubeParams', {
					lubricant_type_id: lubricant_type_id,
					lubricant_amount: lubricant_amount
				});
			}
		}
	},

	watch: {
		'formData.lube_cycle_max_count'(val) {
			if (!this.isInitialSetup) {
				this.formData.lube_cycle_warning_count = val - 10;
			}
		},

		'formData.type'(type) {
			if (!this.isInitialSetup) {
				this.formData.lubricant_container = null;
			}

			this.rules.lube_cycle_max_count = type === PUMP_TYPES.PULSAR ? required : null;
			this.rules.lubricant_amount = type === PUMP_TYPES.PERMA ? required : null;

			this.$emit('event', 'setPumpType', type);
		},
		'formData.lubricant_container'() {
			if (!this.isInitialSetup) {
				this.formData.lube_cycle_max_count = null;
				this.formData.lubricant_amount = null;
				// this.totalLubeLevel = 0;
			}
		},

		'formData.lubricant_type_id'() {
			this.handleCalculateData();
		},
		'formData.lubricant_amount'() {
			this.handleCalculateData();
		}
	}
};
</script>
