<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container type-option-item']"
		:model="formData"
	>
		<div class="flex content-container content-row drive">
			<el-form-item prop="name" class="mcol-xs-2" required>
				<label>{{ tt('Name') }}</label>
				<el-input v-model="formData.name" :placeholder="tt('name')"/>
			</el-form-item>

			<div>
				<el-button
					class="action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>
		</div>
	</el-form>
</template>

<script>
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	data() {
		return {
			formData: {
				id: null,
				name: ''
			}
		};
	},

	computed: {
		deleteNewId: () => true
	}
};
</script>
