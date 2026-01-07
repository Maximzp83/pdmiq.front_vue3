<template>
	<el-form ref="itemForm" class="special-decorated-form-item" :model="formData">
		<div class="form-items flex mrow">
			<el-checkbox
				v-if="enableCheckbox"
				class="mcol-xs-1"
				v-model="formData.include"
				:false-label="0"
				:true-label="1"
			/>

			<el-form-item class="text-form-item mcol-xs-11 fluid" prop="title">
				<CustomInput
					ref="title"
					v-model="formData.title"
					:placeholder="tt('title')"
				/>
			</el-form-item>
		</div>

		<div class="mcol-xs-2 button-container" v-if="!showJustInfo">
			<el-button
				v-if="isLast"
				class="action-button create-button inverted"
				size="mini"
				type="primary"
				icon="icomoon icon-plus"
				@click="addItem"
			/>

			<el-button
				v-else
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-plus"
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script>
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		targetPropName: String,
		isLast: Boolean,
		showJustInfo: Boolean,
		enableCheckbox: Boolean,
		itemAsValue: Boolean
	},

	data() {
		return {
			formData: {
				title: '',
				include: false
			}
		};
	},

	computed: {
		deleteNewId: () => true
	},

	methods: {
		localSetupPageActions(itemData) {
			if (this.itemAsValue) {
				this.formData.title = itemData.value;
			}
		},

		localGetFormDataCallback(data) {
			if (!this.enableCheckbox) {
				delete data.include;
			}
			/*if (this.itemAsValue) {
				console.log(data)
				data = data.title;
			}*/
			return data;
		}
	}
};
</script>
