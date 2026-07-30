<template>
	<el-form
		ref="itemForm"
		:class="['flex mrow relative content-row']"
		:model="formData"
		:rules="rules"
		:label-position="fromModal ? 'left' : 'top'"
	>
		<el-form-item prop="name" class="mini mcol-xs-5">
			<!-- <label v-if="!fromModal && itemIndex == 0">{{tt('Materials')}}</label> -->
			<CustomInput
				class="mini"
				v-model="formData.name"
				:placeholder="tt('material')"
			/>
		</el-form-item>

		<el-form-item prop="price" class="mini mcol-xs-5">
			<!-- <label v-if="!fromModal && itemIndex == 0">{{tt('cost')}}</label> -->
			<CustomInput
				class="mini"
				v-model="formData.price"
				:placeholder="tt('cost')"
				@input="calcActualPrice"
			/>
		</el-form-item>

		<div :class="['action-buttons-container', { 'flex bottom': !fromModal }]">
			<el-button
				v-if="!isLast"
				class="action-button remove-button "
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>

			<el-button
				v-else
				class="action-button create-button"
				size="mini"
				type="success"
				icon="icomoon icon-cross"
				@click="addItem('materialsItemsList', 'm_i-')"
			/>
		</div>
	</el-form>
</template>

<script>
import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],

	props: {
		isLast: Boolean,
		// targetPropName: { type: String, required: true },
		fromModal: Boolean
	},

	data() {
		return {
			formData: {
				id: null,
				name: '',
				price: ''
			},

			rules: {
				name: null,
				price: null
			}
		};
	},

	computed: {
		deleteNewId: () => true
	},

	methods: {
		calcActualPrice() {
			this.$emit('calcActualPrice');
		},

		removeItem() {
			this.$emit('onRemove', this.itemId);
			this.$emit('calcActualPrice');
		}
	},

	watch: {
		formData: {
			deep: true,
			handler(data) {
				if (!!data.name || !!data.price) {
					this.rules = { name: required, price: required };
				} else {
					this.rules = { name: null, price: null };
				}
				setTimeout(() => {
					this.handleResetValidate();
				}, 10);
			}
		}
	}
};
</script>
