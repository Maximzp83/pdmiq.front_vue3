<template>
	<div
		class="edit-form-container"
		:class="{ 'flex justify-center': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			:class="['item-edit-form', { 'mcol-xs-8': !fromAnotherInstance && !isMobile }]"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('phrases.move_to')" required>
				<CustomSelect
					:optionsList="moveToList"
					:placeholder="`${tt('Select')} ${tt('to')}`"
					v-model="moveTo"
					idKey="value"
					valueKey="value"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Storeroom')"
				prop="store_room_id"
				v-if="moveTo == 'storeroom'"
				required
			>
				<CustomSelect
					filterable
					clearable
					:optionsLoading="storeRoomsLoading"
					:optionsList="storeRoomsList"
					:placeholder="`${tt('Select')} ${tt('storeroom')}`"
					v-model="formData.store_room_id"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Storeroom')"
				prop="store_room_id"
				v-if="moveTo == 'storeroom'"
			>
				<CustomSelect
					filterable
					clearable
					:optionsList="storeRoomLocationsList"
					:placeholder="`${tt('storeroom')} ${tt('location')}`"
					v-model="formData.store_room_location_id"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Asset')"
				prop="asset_id"
				v-if="moveTo == 'asset'"
				required
			>
				<FetchByQuerySelect
					clearable
					filterable
					enableLoadmore
					loadmoreIsActive
					v-model="formData.asset_id"
					:optionsLoading.sync="assetsLoading"
					:optionsList.sync="assetsList"
					:settings="assetQueryOptions"
					:placeholder="tt('Asset')"
				/>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { findItemBy } from '@/helpers';
// import { required } from '@/constants/validation';
import { itemFormMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [itemFormMixin(), fetchItemsHelper()],
	components: {
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
		FormOperationsButtons: () =>
			import('@/components/form/FormOperationsButtons.vue')
	},

	data() {
		return {
			storeRoomsList: [],
			storeRoomsLoading: false,
			assetsList: [],
			assetsLoading: false,

			moveTo: null,

			formData: {
				asset_id: null,
				store_room_id: null,
				store_room_location_id: null,
				is_store_room: false
			},

			rules: {
				// name: required,
				// plant_id: required
			}
		};
	},

	computed: {
		moveToList: () =>
			Object.freeze([
				{ name: 'Storeroom', value: 'storeroom' },
				{ name: 'Asset', value: 'asset' }
			]),

		assetQueryOptions() {
			return Object.freeze({
				fetchAction: 'assets/fetch_assets',
				params: { plantId: this.plantId }
			});
		},

		plantId: that => that.additionalSettings.plantId,
		equipmentId: that => that.additionalSettings.equipmentId,

		selectedStoreroom() {
			const { storeRoomsList, formData } = this;
			if (storeRoomsList.length && formData.store_room_id) {
				return findItemBy('id', formData.store_room_id, storeRoomsList);
			}
			return null;
		},

		storeRoomLocationsList() {
			if (this.selectedStoreroom) {
				return this.selectedStoreroom.locations || [];
			}

			return [];
		},

		requestsToDoList: that =>
			Object.freeze([
				{
					action: 'fetch_store_rooms',
					payload: { params: { plantId: that.plantId } },
					localProp: 'storeRoomsList',
					localLoadProp: 'storeRoomsLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_store_rooms: 'store_rooms/fetch_store_rooms',
			fetch_assets: 'assets/fetch_assets',
			save_item: 'equipments/move_equipment'
		}),

		fetchStorerooms() {
			this.doFetchAction(
				'fetch_store_rooms',
				'storeRoomsList',
				'storeRoomsLoading',
				{ params: { plantId: this.plantId } }
			);
		},

		preparePayload(payload) {
			delete payload.data.id;
			payload.itemId = this.equipmentId;

			return payload;
		}
	},

	watch: {
		moveTo(to) {
			// console.log(to)
			this.formData.is_store_room = to == 'storeroom';

			this.formData.store_room_id = null;
			this.formData.asset_id = null;
		}
	},

	created() {
		this.fetchStorerooms();
	}
};
</script>
