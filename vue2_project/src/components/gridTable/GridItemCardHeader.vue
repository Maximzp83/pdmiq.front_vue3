<template>
	<!-- <div class=""> -->
	<!-- <div class="card-data-overlay dark-overlay">
			<div class="caption">
				<div class="buttons-block">
					<router-link
						event
						@click.native.prevent="handleLinkButton"
						v-if="link"
						:to="preparedLink"
						:class="[
							'el-button el-button--success link-button content-row',
							link.className || ''
						]"
					>
						<span class="capitalize">{{ link.text }}</span>
					</router-link>

					<span v-if="buttons && buttons.length" class="content-row">
						<el-button
							v-for="item in buttons"
							:key="`overlay_button-${item.id}`"
							:class="['action-button inverted', item.className || '']"
							@click="buttonHandler(item)"
							size="mini"
							type="secondary"
						>
							<span v-if="item.text">{{ item.text }}</span>
							<i v-if="item.icon" :class="item.icon"></i>
						</el-button>
					</span>
				</div>
			</div>
		</div> -->

	<div class="card-header">
		<div class="title-block">
			<el-checkbox
				v-if="operationsSettings.allowDelete"
				:value="isChecked"
				@change="handleChecked"
			></el-checkbox>

			<div class="equipmentTypeImg imgWrapper relative" v-if="showEquipmentTypeImg">
				<div :class="['status-round-block1', sensorsStatusClass]">
					<a
						class="absolute stretch"
						:href="route"
						@click.prevent="handleTitleClick"
					></a>
					<img :src="cardData.equipment_type_img" alt="img error" />					
				</div>
			</div>

			<el-tooltip class="" effect="dark" placement="top">
				<div slot="content" v-html="cardTitle"></div>

				<div class="title semi-bold">
					<a
						class="standard"
						:href="route"
						@click.prevent="handleTitleClick"
						v-html="cardTitle"
					></a>
				</div>
			</el-tooltip>
		</div>

		<div class="buttons-block">
			<TableAction
				v-for="(action, idx) in operationsSettings.buttons"
				:key="`card_action-${action.name}-${idx}`"
				@event="handleEventNew"
				:rowData="cardData"
				:action="action"
			/>
		</div>
	</div>
	<!-- </div> -->
</template>

<script>
import { equipmentCardTitle } from '@/helpers/specialHelpers';
// import { /*findItemBy*/ getObjectVal } from '@/helpers';

import { eventHandler, navigation } from '@/mixins';

export default {
	mixins: [eventHandler(), navigation()],
	components: {
		TableAction: () => import('@/components/table/TableAction.vue')
	},
	props: {
		cardData: { type: Object, required: true },
		operationsSettings: { type: Object, default: () => ({}) },
		selectedIds: { type: Array, default: () => [] },
		showEquipmentTypeImg: Boolean,
		route: { type: String, required: true },
		sensorsStatusClass: String
	},

	computed: {
		// getCellValue: () => getCellValue,
		isChecked() {
			return this.selectedIds.indexOf(this.cardData.id) !== -1;
		},

		// link: that => that.operationsSettings.link,
		titles() {
			const { is_store_room } = this.cardData;
			return is_store_room
				? this.operationsSettings.titles.filter(ti => ti.prop == 'id')
				: this.operationsSettings.titles.filter(ti => ti.prop != 'id');
		},
		cardTitle() {
			return equipmentCardTitle(this.titles, this.cardData);
		},

		buttons: that => that.operationsSettings.buttons
	},

	methods: {
		handleChecked() {
			const payload = {
				eventName: 'handleSelectionChange',
				data: this.cardData.id,
				onward: true
			};
			this.$emit('event', payload);
		},

		handleTitleClick() {
			// this.changeRoute({path: this.route});
			this.$emit('event', { eventName: 'handleTitleClick' });
		}
	}
};
</script>
