<template>
	<div class="edit-form-container multiview-form-container">
		<!-- :validate="" -->
			<!-- label-width="150px" -->
		<el-form
			class="item-edit-form"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="content-row flex">
				<div class="article-title semi-bold capitalize">{{ viewName }}</div>

				<el-button
					class="ml-auto action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>

			<el-form-item
				class="content-row"
				required
				:label="`${tt('View')} ${tt('name')}`"
				prop="name"
				label-width="150px"
			>
				<CustomInput
					v-model="formData.name"
					:placeholder="`${tt('input')} ${tt('name')}`"
				/>
			</el-form-item>

			<el-form-item  prop="multi_view_graphs">
				<div class="charts-form-container options-container filled_3">
					<div v-if="chartsItemsList.length" class="content-row">
						<ChartItem
							ref="ChartItem"
							v-for="(item, idx) in chartsItemsList"
							:key="`chart_item-${item.id}`"
							:item-data="item"
							:item-index="idx"
							@onRemove="id => removeFormItem(id, 'chartsItemsList')"
						/>
							<!-- @ready="blockReady" -->
					</div>

					<div class="margin-top-row">
						<el-button
							class="create-button content-row with-text small"
							size="mini"
							type="success"
							@click="addFormItem('chartsItemsList', 'c_i-')"
						>
							<span class="capitalize" v-text="`${tt('Add')} ${tt('Chart')}`"></span>
							<i class="icomoon icon-plus"></i>
						</el-button>
					</div>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
// import { mapActions } from 'vuex';
// import { prepareSubmitData } from '@/helpers';
import { required } from '@/constants/validation';
// import { productionLineTypesList } from '@/constants/global';

import {
	// itemFormMixin,
	subItemsListMixin,
	subItemMixin
} from '@/mixins';

export default {
	mixins: [
		// itemFormMixin(),
		subItemsListMixin(),
		subItemMixin()
	],
	components: {
		ChartItem: () => import('./ChartItem.vue'),
	},

	props: {
		equipmentData: { type: Object, default: () => ({}) },
		// ---From FormItemMixin-------
		itemData: {	type: Object,	default: () => null },
		fromModal: Boolean,
		showSubmitButtons: Boolean,
		editInModal: Boolean,
		additionalSettings: { type: Object,	default: () => ({}) },
		itemsName: { type: Object, default: () => ({}) },
	},

	data() {
		return {
			isMobile: false,

			chartsItemsList: [],

			formData: {
				id: null,
				name: '',
				multi_view_graphs: [],
			}
		};
	},

	computed: {
		isNew: that => that.itemData.new,

		deleteNewId: () => true,

		rules: () => ({
			name: required,
		}),

		viewName() {
			if (this.isNew) {
				return `${this.tt('New')} ${this.tt('View')}`;
			}
			return this.formData.name;
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'ChartItem', targetProp: 'multi_view_graphs' },
		]),
	},

	methods: {
		/*...mapActions({
			save_item: 'equipments/save_metric_multi_views'
		}),*/

		removeItem() {
			this.$emit('onRemove', this.itemId);
		},

		localSetupPageActions(item) {
			if (item) {
				this.chartsItemsList = this.setupFormSubItemsList(item.multi_view_graphs, 'c_i');
			}
		},
	}

};
</script>
