<template>
	<el-form
		inline
		ref="itemForm"
		:class="['rule-form-item']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item label="Vibration parameter" prop="vibration_parameter">
			<!-- <SimpleSpinner :active="parametersLoading" /> -->
			<el-select
				:placeholder="`${tt('select')} ${tt('parameter')}`"
				v-model="formData.vibration_parameter"
			>
				<el-option
					v-for="item in parametersList"
					:key="'parameter_type-id-' + item.id"
					:label="item.name"
					:value="item.id"
				>
				</el-option>
			</el-select>
		</el-form-item>

		<el-form-item prop="comparison" class="" label="comparison">
			<!-- <label v-if="itemIndex == 0">Comparison</label> -->
			<el-select
				:placeholder="`${tt('select')} ${tt('comparison')} ${tt('type')}`"
				v-model="formData.comparison"
			>
				<el-option
					v-for="item in conditionsTypesList"
					:key="'comparison-' + item.id"
					:label="item.label"
					:value="item.id"
				/>
			</el-select>
		</el-form-item>

		<el-form-item label="equation" prop="equation" :class="'mcol-xs-12'">
			<!-- :validateStatus="formErrors.equation ? 'error' : ''" -->
			<!-- @focus="onFocus('equation')" -->
			<el-input
				v-model="formData.equation"
				placeholder="Expl: int or float or formula (3*{Z_AXIS_VELOCITY})"
			/>
			<!-- <div class="el-form-item__error" v-if="formErrors.equation">
				field is required
			</div> -->
		</el-form-item>

		<el-form-item label="Data sets" prop="data_sets" class="mcol-xs-12">
			<el-input v-model.number="formData.data_sets" placeholder="sets count" />
		</el-form-item>

		<div class="delete-button">
			<el-button
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
import { required } from '@/constants/validation';
import {
	conditionsTypesList
	// CROSSOVER_RULES_TYPES,
	// crossoverRulesTypesList,
	// crossoverRuleRangeTypesList
} from '@/constants/global';
import { subItemMixin } from '@/mixins';
// import { removeObjProps } from '@/helpers';

export default {
	mixins: [subItemMixin()],

	props: {
		parametersList: Array
	},

	data() {
		return {
			predefinedValuesItemsList: [],

			formData: {
				id: null,
				vibration_parameter: null,
				comparison: null,
				equation: '',
				data_sets: 0
			}
		};
	},

	computed: {
		rules: () => ({
			name: required
		}),
		conditionsTypesList: () => conditionsTypesList,

		// targetPropName: () => 'rules',
		deleteNewId: () => true
	},

	methods: {}
};
</script>
