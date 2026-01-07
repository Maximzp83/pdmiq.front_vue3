<template>
	<div class="option-row">
		<div class="label">{{itemData.name}}</div>
		<div class="value" v-html="itemData.value"></div>

		<div class="checkbox-wrapper">
			<el-checkbox
				class="capitalize"
				:true-label="1"
				:false-label="0"
				v-model="formData.is_visible_in_vibration_analysis"
			/>
		</div>
	</div>
</template>

<script>
// import { mapActions } from 'vuex';

import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	data() {
		return {
			formData: {
				equipment_type_option_id: null,
				is_visible_in_vibration_analysis: false
			}
		};
	},

	computed: {
		deleteId: () => true,
	},
};
</script>
