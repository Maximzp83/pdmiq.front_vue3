<template functional>
	<div
		class="recommended-label"
		v-if="props.propsData && props.propsData.is_recommended"
	>
		<span class="">{{ props.Lang.tt('Recommended') }}</span>
	</div>
</template>

<script>
// import { MAINTENANCE_TYPES } from '@/constants/global';

export default {
	functional: true,
	props: {
		propsData: Object,
		Lang: Object

		/*		MAINTENANCE_TYPES: {
			type: Object, default: () => MAINTENANCE_TYPES
		}
*/
	}
};
</script>
