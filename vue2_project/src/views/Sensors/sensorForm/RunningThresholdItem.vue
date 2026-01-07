<template>
	<el-form
		ref="itemForm"
		:class="['flex mrow bottom align-center']"
		:model="formData"
	>
		<!-- <div class="flex mrow media"> -->
			<el-form-item prop="node_parameter" class="mcol-xs-6" required>
				<label v-if="itemIndex == 0">{{ tt('Parameter') }}</label>

				<CustomSelect
					:optionsList="parametersList"
					:placeholder="`${tt('Select')} ${tt('parameter')}`"
					v-model="formData.node_parameter"
				/>
			</el-form-item>

			<div class="running-threshold-suffix" v-text="'>'"></div>

			<el-form-item prop="baseline_value" class="mcol-xs-3" required>
				<label v-if="itemIndex == 0">{{ tt('Value') }}</label>
				
				<el-input v-model="formData.baseline_value" :placeholder="`${tt('value')}`"/>
			</el-form-item>

			<div class="mcol-xs-2 running-threshold-suffix and">{{isLast ? '' : 'AND' }}</div>

			<div>
				<el-button
					class="action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>
		<!-- </div> -->
	</el-form>
</template>

<script>
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		parametersList: Array,
		isLast: Boolean,
	},
	data() {
		return {
			formData: {
				id: null,
				node_parameter: null,
				baseline_value: null
			}
		};
	},

	computed: {
		deleteNewId: () => true
	},

	methods: {
		localGetFormDataCallback(formData) {
			formData.baseline_value = +formData.baseline_value;
			return formData;
		}
	},

	watch: {
		parametersList() {			
			if (!this.isInitialSetup) {
				this.formData.node_parameter = null;
			}
		}
	},

	created() {
		// console.log('parametersList', this.parametersList)
	}
};
</script>
