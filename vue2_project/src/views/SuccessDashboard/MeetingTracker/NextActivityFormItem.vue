<template>
	<el-form
		ref="itemForm"
		class="special-decorated-form-item content-row activity-form-item"
		:model="formData"
	>
		<div :class="['form-items flex mrow align-center']">
			<ul :class="[isToDo ? 'mcol-xs-4' : 'mcol-xs-6']">
				<li>{{ formData.description }}</li>
			</ul>

			<el-checkbox
				:class="[isToDo ? 'mcol-xs-3' : 'mcol-xs-2', 'ml-auto text-right']"
				@change="e => handleCheck(e)"
				:value="formData.is_completed"
				:false-label="0"
				:true-label="1"
				>{{ $t('constants.Completed') }}</el-checkbox
			>

			<el-form-item
				prop="comment"
				:class="[
					isToDo ? 'mcol-xs-4' : 'mcol-xs-3',
					'mini no-margin text-form-item'
				]"
			>
				<CustomInput
					class=""
					@input="handleSave"
					v-model="formData.comment"
					:placeholder="tt('notes')"
				/>
			</el-form-item>

			<div class="remove-button-container" v-if="showDeleteButton">
				<el-button
					class="action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>
		</div>

		<div class="mt-10">
			<div class="content-row" v-if="itemData.machine">
				<span class="label muted span-block">{{ $t('Machine') }}: </span>
				<span class="value span-block">{{ itemData.machine.name }}</span>
			</div>

			<div class="content-row" v-if="sensorsNames">
				<span class="label muted span-block">{{ $t('Sensors') }}: </span>
				<span class="value span-block">{{ sensorsNames }}</span>
			</div>
		</div>
	</el-form>
</template>

<script>
import { subItemMixin } from '@/mixins';
import { findItemBy } from '@/helpers';

export default {
	mixins: [subItemMixin()],
	props: {
		targetPropName: String,
		showJustInfo: Boolean,
		isToDo: Boolean,
		showDeleteButton: Boolean,
		sensorsList: Array
	},

	data() {
		return {
			formData: {
				board_type: null,
				id: null,
				tracker_id: null,
				users_ids: [],
				users_name: '',

				description: '',
				comment: '',
				is_completed: 0
			}
		};
	},

	computed: {
		// deleteNewId: () => true,
		sensorsNames() {
			const { sensorsList, itemData } = this;
			let result = '';

			if (itemData.sensor_ids.length) {
				itemData.sensor_ids.forEach((sid, idx) => {
					const sensor = findItemBy('id', sid, sensorsList);
					if (sensor) {
						if (idx) result += ', ';
						result += sensor.name;
					}
				});
			}

			return result;
		}
	},

	methods: {
		handleCheck(val) {
			this.formData.is_completed = val;
			this.handleSave();
		},
		handleSave() {
			this.$emit('onSave');
		},
	}
};
</script>
