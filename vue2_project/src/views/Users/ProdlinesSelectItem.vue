<template>
	<!-- <el-form
		ref="itemForm"
		:class="['option-item-container select-option-item', { mrow: !showJustInfo }]"
		:model="formData"
	> -->
		<el-form-item
			:label="plantItem.name "
			prop="notifiable_prodlines"
			v-if="plantItem"
		>
			<CustomSelect
				filterable
				multiple
				:optionsLoading="productionLinesLoading"
				:optionsList="productionLinesList"
				:placeholder="`${tt('Select')} ${tt('prodlines')}`"
				v-model="formData.notifiable_prodlines"
			/>
		</el-form-item>
	<!-- </el-form> -->
</template>

<script>
// import { required } from '@/constants/validation';
import { fetchItemsHelper } from '@/mixins';
import { findItemBy } from '@/helpers';
import { mapActions } from 'vuex';

export default {
	mixins: [fetchItemsHelper()],
	props: {
		plantId: { type: Number, required: true },
		plantsList: { type: Array, required: true },
		currentNotifiableProdlinesIds: { type: Array, default: () => [] }	
	},

	data() {
		return {
			productionLinesList: [],
			productionLinesLoading: false,

			formData: {
				notifiable_prodlines: []
			}
		};
	},

	computed: {
		plantItem() {
			return this.plantsList.find(p => p.id === this.plantId);
		}
	},

	methods: {
		...mapActions({
			fetch_production_lines: 'production_lines/fetch_production_lines',
		}),

		fetchProdlines(plantId) {
			const payload = { params: { max: -1, plantId: plantId } };

			this.doFetchAction('fetch_production_lines', 'productionLinesList', 'productionLinesLoading', payload);
		},

		getFormData() {
			return this.formData.notifiable_prodlines;
		}
	},

	watch: {
		productionLinesList(list) {
			if (list.length && this.currentNotifiableProdlinesIds.length) {
				this.currentNotifiableProdlinesIds.forEach(id => {
					if(findItemBy('id', id, list)) {
						this.formData.notifiable_prodlines.push(id);
					}
				})
			}
		}
	},

	created() {
		this.fetchProdlines(this.plantId);
	}
};
</script>
