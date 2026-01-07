<template>
	<div class="content-container">
		<div class="item-header relative" @click="changeInstance">
			<SimpleSpinner :active="isLoading" />

			<div class="title">{{ instance_title }}</div>
			<div class="toggle-button">
				<i class="icomoon icon-path_2"></i>
			</div>
		</div>

		<div v-show="is_active" class="item-content">
			<VueElementLoadingWrapper :isLoading="isLoading" :isSaving="isSaving" />

			<component
				fromModal
				fromMultiformModal
				v-if="initFormComponent"
				@event="handleEvent"
				ref="ItemFormComponent"
				v-bind:is="componentFile"
				:editModal="editModal"
				:itemData="itemData"
				:instancesItemsData="instancesItemsData"
				:multiFormFilters="multiFormFilters"
			/>

			<div class="item-content-footer">
				<el-button
					:loading="isSaving"
					@click="saveItem"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span class="uppercase">{{ `${tt('SAVE')} ${instance_title}` }}</span>
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { eventHandler, navigation } from '@/mixins';
// import { cleanValuesByList, findItemBy } from '@/helpers';

export default {
	mixins: [eventHandler(), navigation()],
	name: 'MultiFormItemWrapper',

	props: {
		instance: Object,
		is_active: Boolean,
		instancesData: {
			type: Object,
			required: true
		},
		instancesItemsData: { type: Object },
		multiFormFilters: { type: Object }
	},

	data() {
		return {
			initFormComponent: false,
			isLoading: false,
			isSaving: false,

			itemData: null
		};
	},

	computed: {
		...mapState({
			editModal: state => state.global.editModal
			// instanceName: state => state.global.instanceNameToEdit,
			// authUser: state => state.auth.authUser
		}),

		instance_title() {
			const { instance } = this;

			if (instance.title) return this.$t(instance.title);
			return '';
		},

		componentFile() {
			return () => import(`@/views/${this.instance.path}.vue`);
			// return this.importFormComponent(this.instance.path);
		}
	},

	methods: {
		...mapActions({
			fetch_asset: 'assets/fetch_asset',
			fetch_machine: 'machines/fetch_machine',
			fetch_production_line: 'production_lines/fetch_production_line',
			fetch_equipment: 'equipments/fetch_equipment'
			// set_global_state: 'set_global_state'
		}),

		emitEvent(eventName, data) {
			this.$emit('event', eventName, data);
		},

		setMultiFormFilters(filters) {
			this.$emit('event', 'setMultiFormFilters', filters);
		},

		changeInstance() {
			// console.log(this.editModal.instanceName, instance)
			if (!this.is_active) {
				const { /*itemData,*/ instance } = this;

				this.emitEvent('changeInstance', {
					name: instance.name
					// data: itemData
				});
			}
		},

		setupItemData({ id, data }) {
			if (id) {
				this.loadItemData(id);
			} else if (data) {
				this.itemData = data;
				this.setupRelatedData(data);
			}
		},

		setupRelatedData(data) {
			const { instance } = this;

			if (instance.relatedInstance) {
				// console.log('setupRelatedData')

				const { related_id } = instance.relatedInstance;
				this.emitEvent('setupRelatedId', {
					prop: related_id,
					value: data[related_id]
				});
			}
		},

		loadItemData(id) {
			this.isLoading = true;
			const { instance } = this;

			this[instance.fetch_action]({ itemId: id })
				.then(({ value }) => {
					this.setupItemData({ data: value });

					// this.itemData = value;
					// this.setupRelatedData(value);
					this.isLoading = false;
				})
				.catch(e => {
					this.isLoading = false;
					console.log(e);
				});
		},

		toggleSaving(isSaving) {
			// console.log('isSaving', isSaving);
			this.isSaving = isSaving;
			// this.emitEvent('event', 'toggleSaving', isSaving);
		},

		saveItem() {
			// console.log(this.$refs.ItemFormComponent)
			this.$refs[`ItemFormComponent`].validateForm();
		},

		successModalSubmit(answer) {
			// console.log('successModalSubmit 4', answer, this.editModal)
			if (answer) {
				const { data } = answer;
				if (data && data.data) {
					this.setupItemData({ data: data.data });
				}
			}
			// console.log(1, this.editModal);
			if (this.editModal.callback) {
				this.editModal.callback(answer);
			}
		}
	},

	watch: {
		is_active(active) {
			if (active && !this.initFormComponent) {
				this.initFormComponent = true;
			}
		},

		instancesData(data) {
			// console.log('instancesData', this.init, this.instance.name)
			const { instance } = this;
			const itemId = data[instance.idProp];
			if (itemId) {
				if (!this.itemData || this.itemData.id !== itemId) {
					this.setupItemData({ id: itemId });
				}
			}
		},

		itemData(data) {
			if (data) {
				this.emitEvent('setInstanceItemData', {
					prop: this.instance.instanceDataProp,
					value: data
				});
			}
		}
	},

	created() {
		if (this.is_active && !this.initFormComponent) {
			this.initFormComponent = true;
		}

		const { editModal, instance } = this;
		if (editModal.instanceData && instance.name == editModal.instanceName) {
			// console.log(1, instance.name)
			this.setupItemData({ data: editModal.instanceData });
		}
	}
};
</script>
