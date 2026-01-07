<template>
	<div :class="['notification-column', columnData.className || '']">
		<div class="cell-item">
			<span class="cell-label label semi-bold" v-if="columnData.title">
				{{ columnData.title }}
			</span>
			<el-checkbox @change="handleCheckAllChange" :value="checkAll">{{
				columnData.label
			}}</el-checkbox>
			<!-- :indeterminate="isIndeterminate" -->
		</div>

		<div class="cell-item" v-for="cellData in columnData.cells" :key="cellData.key">
			<span class="cell-label label" v-if="cellData.title">{{
				cellData.title
			}}</span>

			<el-checkbox
				@change="value => handleChecked({ value, key: cellData.key })"
				v-model="formData[cellData.key]"
				:true-label="1"
				:false-label="0"
				>{{ cellData.label || '' }}</el-checkbox
			>
		</div>
	</div>
</template>

<script>
// import { updateFormData } from '@/helpers';
// import { required } from '@/constants/validation';

// import { dynamicItemFormMixin } from '@/mixins';

export default {
	// mixins: [dynamicItemFormMixin()],
	props: {
		columnData: Object
		// selectedSections: Array
	},

	data() {
		return {
			// isIndeterminate: false,
			checkAll: false,

			formData: {}
		};
	},

	computed: {
		targetPropName: () => 'permissions',
		// menuSectionsList: that => menuSectionsList().filter(si => !that.selectedSections.includes(si.id)),
		checkedCount: that => Object.values(that.formData).filter(value => value).length
	},

	methods: {
		handleCheckAllChange() {
			this.handleChecked();
		},

		handleChecked(data) {
			const keysCount = Object.keys(this.formData).length;
			const { checkedCount } = this;

			if (!data) {
				let newValue = !checkedCount ? 1 : 0;
				Object.keys(this.formData).forEach(key => {
					this.formData[key] = newValue;
				});
			}

			this.checkAll = this.checkedCount === keysCount;
			// this.isIndeterminate = this.checkedCount > 0 && this.checkedCount < keysCount;
			// console.log(checkedCount, keysCount)
		},

		setupFormData(data) {
			data.cells.forEach(cellData => {
				this.$set(this.formData, cellData.key, cellData.value || 0);
			});
		},

		getFormData() {
			return this.formData;
		}
	},

	/*watch: {
		'formData.app_section'() {
			this.$emit('updateSelectedSections');
		}
	}*/

	created() {
		this.setupFormData(this.columnData);
	}
};
</script>
