<template>
	<div class="content-container roi-update-history">
		<div class="section-row">
			<div class="bold info-row label">CREATED:</div>
			<div class="info-row muted semi-bold">{{ creator.full_name }}</div>

			<InfoCell
				class="info-row muted"
				tag="div"
				labelDisabled
				:itemData="itemData"
				:settingItem="dateValueSetting"
			/>
		</div>

		<div class="section-row" v-if="itemData.updatesLogs.length">
			<div class="bold info-row label">EDITED:</div>
			<div
				class="content-row info-row "
				v-for="log in itemData.updatesLogs"
				:key="`log-${log.id}`"
			>
				<div class="info-row muted semi-bold">{{ log.user.full_name }}</div>

				<InfoCell
					class="info-row muted"
					tag="div"
					labelDisabled
					:itemData="log"
					:settingItem="dateValueSetting"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { cleanDateString } from '@/helpers';

export default {
	components: {
		InfoCell: () => import('@/components/itemDetails/InfoItem.vue')
	},

	props: {
		title: String,
		itemData: Object,
		isLoading: Boolean,
		showClose: Boolean
	},

	computed: {
		creator: that => Object.freeze(that.itemData.creator),
		historyData: that => Object.freeze(that.itemData.updatesLogs),

		dateValueSetting: () =>
			Object.freeze({
				prop: 'created_at',
				meta: { prepareValue: { localMethod: cleanDateString } }
			})
	}

	/*methods: {
		closeDialog() {
			this.$emit('closeDialog');
		}
	}*/
};
</script>
