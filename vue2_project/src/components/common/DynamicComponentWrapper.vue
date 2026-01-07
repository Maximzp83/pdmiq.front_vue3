<template>
	<!-- <div class=""> -->
	<component
		ref="additionalBlock"
		@event="handleEventNew"
		:propsData="propsData"
		:additionalProps="additionalProps"
		:Lang="$Lang"
		v-bind:is="componentFile"
	/>
	<!-- :hasRights="hasRights" -->
	<!-- </div> -->
</template>

<script>
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	props: {
		propsData: Object,
		componentPath: String,
		additionalProps: null
	},

	computed: {
		componentFile() {
			return () => import(`@/${this.componentPath}.vue`);
		}
	}
};
</script>
