<template>
	<div class="import-log-row-item">
		<!-- <div class="" @click="test">test update</div> -->
		<LogRowMainColumnsBlock
			ref="LogRowMainColumnsBlock"
			:rowData="rowData"
			:logData="logData"
			:errors="rowErrorsList"
		/>

		<div class="card-content">
			<LogRowTypesColumnsBlock
				ref="LogRowTypesColumnsBlock"
				:rowData="rowData"
				:logData="logData"
				:errors="rowErrorsList"
				:equipmentTypesList="equipmentTypesList"
			/>
		</div>

		<div class="card-content ">
			<!-- <div><b>{{`${tt('Errors')}:`}}</b></div> -->
			<ul>
				<li
					class="alarm-color"
					v-for="item in rowErrorsListFilteredDuplitates"
					:key="`error-row-${item.id}`"
					v-text="item.error"
				></li>
			</ul>
		</div>

		<div class="card-content">
			<el-button
				@click="handleValidateSubItems"
				native-type="button"
				class="item-action-button"
				type="success"
			>
				<span>Apply Change</span>
				<i class="icomoon icon-check"></i>
			</el-button>

			<el-button
				@click="handleDeleteRow"
				native-type="button"
				class="item-action-button inverted"
				type="primary"
			>
				<span>Delete Row</span>
				<i class="icomoon icon-plus rotate"></i>
			</el-button>
		</div>
	</div>
</template>

<script>
// import { required } from '@/constants/validation';
import { removeDuplicatesFromArray, getObjectVal } from '@/helpers';

import { mapActions } from 'vuex';
import { subItemsListMixin } from '@/mixins';

export default {
	mixins: [subItemsListMixin()],
	components: {
		LogRowMainColumnsBlock: () => import('./LogRowMainColumnsBlock.vue'),
		LogRowTypesColumnsBlock: () => import('./LogRowTypesColumnsBlock.vue')
	},

	props: {
		rowData: { type: Object, required: true },
		// logData: { type: Object, required: true },

		equipmentTypesList: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			blockIsSaving: false
		};
	},

	computed: {
		subItemsSettings: () => Object.freeze([
			{ ref: 'LogRowMainColumnsBlock', returnArray:true, concatData:true },
			{ ref: 'LogRowTypesColumnsBlock', returnArray:true, concatData:true }
		]),
		/*refsList: () => ['LogRowMainColumnsBlock', 'LogRowTypesColumnsBlock'],
		refsOperationsSettings: () =>
			Object.freeze({
				submitActionName: 'handleRepeat',
				dataAsArray: true,
				itemSubmitMethod: 'handleValidateRefsItems'
			}),*/

		logData: that => Object.freeze(that.rowData.log),

		// rowErrorsList: that => that.logData.items.filter(item => item.row_number === that.rowData.row_number),
		rowErrorsList: that => that.rowData.items,
		rowErrorsListFilteredDuplitates: that =>
			removeDuplicatesFromArray(that.rowErrorsList, 'error')
	},

	methods: {
		...mapActions({
			// fetch_plants: 'plants/fetch_plants',
			save_item: 'testing/import_motorIQ_repeat',
			delete_row: 'testing/delete_import_motorIQ_row'
		}),

		test() {
			this.$emit('event', {
				eventName: 'refetchItemsList',
				onward: true
			});
		},

		handleValidateSubItems() {
			var collectedData =	this.collectDataFromSubItems(this.subItemsSettings).result;

			if (collectedData.every(o => o.isValid)) {
				this.handleRepeat(collectedData);
			} else {
				let message = '';

				for (let item of collectedData) {
					if (!item.isValid) {
						message += getObjectVal(item, 'data.column_name') || '';
					}
				}

				setTimeout(() => {
					this.$notify({
						type: 'warning',
						title: this.tt('phrases.Validation_error'),
						message: message
							? `${message} - is required`
							: this.$t(`phrases.Please_check_fields_errors_first`),
						duration: 0
					});
				}, 10);

				return false;
			}
		},

		handleRepeat(subItemsData) {
			const { id, import_file_name, import_columns_name } = this.logData;

			// -------------------
			import_columns_name.types = import_columns_name.types.map(item => {
				const {
					equipment_nameplate_column_name,
					equipment_picture_column_name
				} = item;

				let newItem = { ...item };

				if (!equipment_nameplate_column_name)
					delete newItem.equipment_nameplate_column_name;
				if (!equipment_picture_column_name)
					delete newItem.equipment_picture_column_name;

				return newItem;
			});

			const new_import_columns_name = { ...import_columns_name };

			for (const key in new_import_columns_name) {
				if (new_import_columns_name[key] === null) {
					delete new_import_columns_name[key];
				}
			}
			// -------------------
			var errors = subItemsData.filter(ei => !!ei.data.log_item_id);

			let data = {
				log_id: id,
				row_number: this.rowData.row_number,
				...new_import_columns_name,
				file_name: import_file_name,
				errors: errors.map(ei => ei.data),
			};

			/*injectToBody.errors.forEach(pei => {
				data.errors = data.errors.concat(pei.errors);
			});*/

			/*if (data) {
				console.log(data, subItemsData)
				return				
			}*/

			this.blockIsSaving = true;

			this.save_item({ data: data })
				.then(() => {
					this.$emit('event', {
						eventName: 'refetchItemsList',
						onward: true
					});
					/*this.$emit('event', {
						eventName: 'handleDeleteRow',
						data: { id: this.rowData.id },
						onward: true
					})*/
				})
				.finally(() => {
					this.blockIsSaving = false;
				});
		},

		handleDeleteRow() {
			/*this.$emit('event', {
				eventName: 'handleDeleteRow',
				data: { id: this.rowData.id },
				onward: true
			})*/

			this.blockIsSaving = true;

			this.delete_row({ rowId: this.rowData.id })
				.then(() => {
					/*this.$emit('event', {
						eventName: 'handleDeleteRow',
						data: { id: this.rowData.id },
						onward: true
					})*/
					this.$emit('event', {
						eventName: 'refetchItemsList',
						onward: true
					});
				})
				.finally(() => {
					this.blockIsSaving = false;
				});
		}
	}
};
</script>
