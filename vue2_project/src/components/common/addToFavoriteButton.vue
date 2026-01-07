<template>
	<div class="add-to-favorites-button-content">
		<i v-if="propsData.is_favorite" class="el-icon-star-on"></i>
		<i v-else class="el-icon-star-off"></i>
	</div>
</template>

<script>
// import { scrollToElement } from '@/helpers/specialHelpers';

export default {
	props: {
		propsData: { type: Object, required: true },
	},

	methods: {
		
	}
};
</script>
