<template>
	<el-form ref="itemForm" class="special-decorated-form-item" :model="formData">
		<div :class="['form-items ', { 'mrow ': !showJustInfo }]">
			<el-form-item prop="description" class="mcol-xs-12 text-form-item">
				<CustomInput
					ref="description"
					v-model="formData.description"
					:placeholder="tt('description')"
					type="textarea"
					elastic
				/>
			</el-form-item>

			<CustomInput
				v-if="showJustInfo && enableName"
				prefixIcon="icomoon icon-users"
				:value="usersNames"
				:placeholder="'-'"
			/>

			<div v-else-if="enableName" :class="['pt-0 flex align-center mrow']">
				<el-form-item prop="users_ids" :class="['small-form-item', 'mcol-xs-6']">
					<CustomSelect
						prefixIcon="icomoon icon-users"
						clearable
						multiple
						collapse-tags
						:optionsLoading="usersLoading"
						:optionsList="usersList"
						:placeholder="`${tt('Select')} ${tt('users')}`"
						labelKey="full_name"
						v-model="formData.users_ids"
					/>
				</el-form-item>

				<div class="mcol-xs-1 text-center">or</div>

				<el-form-item prop="users_name" :class="['small-form-item', 'mcol-xs-6']">
					<CustomInput
						prefixIcon="icomoon icon-users"
						v-model="formData.users_name"
						:placeholder="showJustInfo ? '-' : this.$t('names')"
					/>
				</el-form-item>
			</div>

			<div class="pt-0 flex align-center mrow" v-if="showJustInfo">
				<el-form-item prop="machine_id" :class="['small-form-item', 'mcol-xs-6']">
					<CustomInput
						prefixIcon="icomoon icon-machines"
						:value="machineName"
						:placeholder="'-'"
					/>
				</el-form-item>

				<el-form-item prop="machine_id" :class="['small-form-item', 'mcol-xs-6']">
					<i class="input-prefix icomoon icon-sensor"></i>
					<span class="span-block" v-html="sensorsNames"></span>
				</el-form-item>
			</div>

			<div v-else :class="['pt-0 flex align-center mrow']">
				<el-form-item prop="machine_id" :class="['small-form-item', 'mcol-xs-6']">
					<CustomSelect
						@change="formData.sensor_ids = []"
						prefixIcon="icomoon icon-machines"
						clearable
						:optionsLoading="machinesLoading"
						:optionsList="machinesList"
						:placeholder="`${tt('select')} ${tt('machine')}`"
						v-model="formData.machine_id"
					/>
				</el-form-item>

				<el-form-item prop="sensor_ids" :class="['small-form-item', 'mcol-xs-6']">
					<CustomSelect
						prefixIcon="icomoon icon-sensor"
						clearable
						multiple
						collapse-tags
						:optionsLoading="sensorsLoading"
						:optionsList="plantSensorsList"
						:placeholder="`${tt('select')} ${tt('sensors')}`"
						labelKey="location_in_equipment"
						v-model="formData.sensor_ids"
					/>
				</el-form-item>
			</div>
		</div>

		<div class="button-container" v-if="!showJustInfo">
			<el-button
				v-if="isLast"
				class="action-button create-button inverted"
				size="mini"
				type="primary"
				icon="icomoon icon-plus"
				@click="addItem"
			/>

			<el-button
				v-else
				class="action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-plus"
				@click="removeItem"
			/>
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
		isLast: Boolean,
		enableName: Boolean,
		usersLoading: Boolean,
		usersList: Array,
		showJustInfo: Boolean,
		machinesLoading: Boolean,
		machinesList: Array,
		sensorsLoading: Boolean,
		sensorsList: Array
	},

	data() {
		return {
			formData: {
				description: '',
				users_name: '',
				users_ids: [],
				machine_id: null,
				sensor_ids: []
			}
		};
	},

	computed: {
		deleteNewId: () => true,

		usersNames() {
			const { users_ids, users_name } = this.formData;

			let names = '';

			users_ids.forEach((id, idx) => {
				const user = findItemBy('id', id, this.usersList);
				if (user) {
					if (idx != 0) names += ', ';
					names += `${user.full_name}`;
				}
			});

			names = names.length ? names + `, ${users_name}` : users_name;

			return names || '-';
		},

		machineName() {
			const { machine_id } = this.formData;
			const machine = findItemBy('id', machine_id, this.machinesList);

			return (machine && machine.name) || '-';
		},

		sensorsNames() {
			const { sensor_ids } = this.formData;
			let names = '';

			sensor_ids.forEach((id, idx) => {
				const sensor = findItemBy('id', id, this.sensorsList);
				if (sensor) {
					if (idx != 0) names += '</br> ';
					names += `${sensor.location_in_equipment}`;
				}
			});

			return names || '-';
		},

		plantSensorsList() {
			if (this.formData.machine_id) {
				return this.sensorsList.filter(
					si =>
						(si.equipment && si.equipment.asset && si.equipment.asset.machine_id) ===
						this.formData.machine_id
				);
			}
			return [];
		}
	},

	methods: {
		localGetFormDataCallback(formData) {
			const newData = { ...formData };

			if (this.enableName) {
				if (!newData.users_name) delete newData.users_name;
			} else {
				delete newData.users_name;
				delete newData.users_ids;
			}
			return newData;
		},
	}
};
</script>
