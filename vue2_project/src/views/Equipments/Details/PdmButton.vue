<template>
	<div class="pdm-button-item">
		<!-- :to="`/equipments/${routeParamsId}/details/pdm/${sensor.id}`" -->
		<a
			:class="[
				'el-button el-button--primary',
				'inverted',
				// {'inverted': isSensor },
				{ active: currentPath == buttonPath }
			]"
			@click.prevent="linkClick"
		>
			<span class="icons-list" v-if="isSensor || isManualRoute">
				<i
					v-for="icon in currentSensorType.icons"
					:key="`icon-${icon}`"
					:class="`icomoon icon-${icon}`"
				></i>
			</span>

			<b v-if="isSensor || isManualRoute">{{ tt('PDM') }}</b>
			<b v-else-if="isMultiView">{{ tt('Multi_view') }}</b>
			<!-- <i class="suffix-icon icomoon icon-compare"></i> -->
		</a>

		<div class="location">{{ location_in_equipment }}</div>
	</div>
</template>

<script>
import { sensorTypeMixin, navigation } from '@/mixins';

export default {
	mixins: [sensorTypeMixin(), navigation()],
	props: {
		itemData: {
			type: Object,
			required: true
		},
		routeParamsId: Number,
		isSensor: Boolean,
		buttonTextKey: String,
		isMultiView: Boolean,
		isManualRoute: Boolean
		// value: Number
	},

	/*data() {
		return {
			selected_id: null
		};
	},*/
	computed: {
		location_in_equipment: that => {
			if (that.isManualRoute) return that.tt('technology.manual_route');
			return that.isSensor
				? that.itemData.location_in_equipment
				: that.itemData[that.buttonTextKey];
		},
		currentSensorTypeDataKey: that => that.isSensor || that.isManualRoute ? 'itemData' : '',
		currentPath: that => that.$route.fullPath,
		buttonPath() {
			if (this.isManualRoute) {
				return `/equipments/${this.routeParamsId}/details/manual-route`;
			} else if (this.isSensor) {
				return `/equipments/${this.routeParamsId}/details/pdm/${this.itemData.id}`;
			} else if (this.isMultiView) {
				return `/equipments/${this.routeParamsId}/details/multi-view/${this.itemData.id}`;
			}
			return '';
		}
	},

	methods: {
		linkClick() {
			this.changeRoute({ path: this.buttonPath });
			this.$emit('forceRerender');
		}
	}

	/*watch: {
		selected_id(id) {

		}
	}*/
};
</script>
