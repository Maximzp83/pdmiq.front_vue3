<template>
	<div class="section-row">
		<div class="title article-title capitalize">
			Data set:
			<span class="bold">{{ datasetItem.alt_label || datasetItem.label }}</span>
		</div>

		<el-form
			label-width="100px"
			label-position="left"
			ref="itemForm"
			:model="formData"
		>
			<el-form-item :label="tt('Expression')" prop="expression">
				<el-input
					v-model.lazy="formData.expression"
					:placeholder="`${tt('example')}: 0.000253*{reg}+96.67 - Gain`"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],

	props: {
		itemData: { type: Object },
		datasetItem: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			formData: {
				data_set: null,
				expression: ''
			}
		};
	},

	methods: {
		localSetupPageActions(itemData) {
			if (!itemData) {
				this.formData.data_set = this.datasetItem.id;
			}
		},
	}
};
</script>
