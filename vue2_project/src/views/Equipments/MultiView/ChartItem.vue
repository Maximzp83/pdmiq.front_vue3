<template>
	<el-form ref="itemForm" :class="['']" :model="formData">
		<div class="content-row flex mrow bottom">
			<el-form-item prop="name" class="mcol-xs-10" :label="`${tt('Chart')} ${tt('name')}`">
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<div class="mcol-xs-auto ml-auto">
				<el-button
					class=" action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>
		</div>

		<div class="content-row semi-bold">{{ tt('constants.Metric') }}</div>

		<el-form-item prop="graph_items">
			<div class="options-container filled_3">
				<div v-if="metricItemsList.length" class="content-row">
					<MetricItem
						ref="MetricItem"
						v-for="(item, idx) in metricItemsList"
						:key="`metric_item-${item.id}`"
						:item-data="item"
						:item-index="idx"
						@onRemove="id => removeFormItem(id, 'metricItemsList')"
					/>
						<!-- @ready="blockReady" -->
				</div>

				<div class="content-row margin-top-row">
					<el-button
						class="create-button small bold"
						size="mini"
						type="success"
						@click="addFormItem('metricItemsList', 'm_i-')"
						icon="icomoon icon-plus"
					/>
				</div>
			</div>
		</el-form-item>
	</el-form>
</template>

<script>
import { subItemMixin, subItemsListMixin } from '@/mixins';

export default {
	mixins: [subItemMixin(), subItemsListMixin()],
	// props: {},
	components: {
		MetricItem: () => import('./MetricItem.vue'),
	},

	data() {
		return {
			metricItemsList: [],

			formData: {
				id: null,
				name: '',
				graph_items: []
			}
		};
	},

	computed: {
		// targetPropName: () => 'characters',
		deleteNewId: () => true,

		subItemsSettings: () => Object.freeze([
			{ ref: 'MetricItem', targetProp: 'graph_items' },
		]),
	},

	methods: {
		localSetupPageActions(item) {
			if (item) {
				this.metricItemsList = this.setupFormSubItemsList(item.graph_items, 'm_i-');
			}
		},
	}
};
</script>
