<template>
	<div class="equipment-table-expanded-row">
		<!-- expand: {{ scopeData.$index }} -->
		<div class="sensors-block">
			<div class="sensors-list" v-if="dashboardSensors && dashboardSensors.length">
				<CardSensorItem
					@event="handleEventNew"
					v-for="item in dashboardSensors"
					:key="`sensor-${item.id}`"
					:itemData="item"
				/>
			</div>
		</div>
	</div>
</template>

<script>
// import { findItemBy } from '@/helpers';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],

	components: {
		CardSensorItem: () => import('./Card/CardSensorItem.vue')
	},

	props: {
		propsData: Object
	},

	computed: {
		dashboardSensors: that => that.propsData.dashboardSensors
	}
};
</script>
