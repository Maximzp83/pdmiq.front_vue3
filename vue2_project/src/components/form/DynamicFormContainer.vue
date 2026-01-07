<template>
	<div :class="{ js_hidden: editModal.hideModal }">
		<!-- <div class=""> -->
		<CoverOverlay
			:active="editModal.show"
			:z="1800"
			@onClick="handleCloseEditModal"
		/>

		<CustomModal
			:className="
				`dynamic-form-modal ${modalTypeClass} ${multiformClass} ${editModal.modalClassName ||
					''} ${modalSize}`
			"
			:headerClass="editModal.headerClass"
			:active="editModal.show"
			:title="modalTitle"
			:activeSpinner="isSaving"
			:spinnerText="editModal.itemName + ` ${tt('saving')}...`"
			:event="handleEvent"
			@onClose="handleCloseEditModal"
			:hideFooter="editModal.hideFooter || editModal.multiform"
		>
			<component
				v-if="componentFile"
				ref="ItemFormComponent"
				@event="handleEvent"
				v-bind:is="componentFile"
				:editModal="editModal"
				:itemData="editModal.instanceData"
				:fromModal="true"
				:settings="editModal.settings"
				:formSettings="editModal.formSettings"
				:additionalSettings="editModal.additionalModalSettings"
			/>

			<template v-slot:header>
				<div class="header-actions" v-if="editModal.headerActions">
					<TableAction
						class="borderless-button"
						v-for="(action, idx) in editModal.headerActions"
						:key="`header_action-${action.name}-${idx}`"
						@event="handleAction"
						:rowData="editModal.instanceData"
						:action="action"
						buttonSize="normal"
					/>
				</div>
			</template>

			<template v-slot:footer>
				<el-button
					v-if="!editModal.hideSubmitButtons"
					@click="saveModalItem"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span class="uppercase">{{ editModal.saveButtonText || tt('SAVE') }}</span>
				</el-button>

				<div class="footer-actions" v-if="editModal.footerActions">
					<TableAction
						v-for="(action, idx) in editModal.footerActions"
						:key="`footer_action-${action.name}-${idx}`"
						@event="handleAction"
						:action="action"
						buttonSize="normal"
					/>
					<!-- :rowData="action.payload" -->
				</div>
			</template>
		</CustomModal>
	</div>
</template>

<script>
// @ is an alias to /src
import { mapState, mapActions } from 'vuex';
import { eventHandler, navigation } from '@/mixins';

export default {
	mixins: [eventHandler(), navigation()],
	name: 'DynamicFormContainer',
	components: {
		TableAction: () => import('@/components/table/TableAction.vue')
	},

	props: {
		editModalProp: String
	},

	data() {
		return {
			// showModal: false,
			isSaving: false
		};
	},

	computed: {
		...mapState({
			globalFilters: state => state.global.globalFilters,
			// editModal: state => state.global.editModal,
			authUser: state => state.auth.authUser
		}),

		editModal() {
			const modalProp = this.editModalProp || 'editModal';
			return this.$store.state.global[modalProp];
		},

		componentFile() {
			const { componentPath, instanceName, componentFullPath } = this.editModal;

			if (componentPath || instanceName || componentFullPath) {
				let path = '';

				if (componentFullPath) {
					path = `${componentFullPath}`;
				} else if (componentPath) {
					path = `views/${componentPath}`;
				} else {
					path = `views/${instanceName}/ItemForm`;
				}

				return () => import(`@/${path}.vue`);
			}
			return null;
		},

		modalTitle() {
			const { editModal, tt } = this;
			editModal.itemName = editModal.itemName || 'Item';

			if (editModal.title) return editModal.title;
			if (editModal.instanceData) {
				return `${tt('Edit')} ${editModal.itemName}`;
			}
			return `${tt('Create')} ${editModal.itemName}`;
		},

		modalTypeClass() {
			const { editModalProp } = this;
			return editModalProp == 'editModalClassic' ||
				editModalProp == 'editModalClassicSecond'
				? 'classic-modal'
				: 'editItem-dialog';
		},

		modalSize() {
			const { editModal } = this;
			return editModal.size || 'standard';
		},

		multiformClass() {
			const { editModal } = this;
			return editModal.multiform ? 'multiform' : '';
		},

		currentPath() {
			return this.$route.fullPath;
		},

		itemsSaving() {
			return false;
		}
	},

	methods: {
		...mapActions({
			show_edit_modal: 'show_edit_modal'
		}),

		toggleSaving(isSaving) {
			this.isSaving = isSaving;
		},

		handleCloseEditModal() {
			if (this.editModal.closeCallback) {
				this.editModal.closeCallback();
			} else {
				this.show_edit_modal({
					// ...this.editModal,
					editModalProp: this.editModalProp,
					size: this.editModal.size,
					show: false
				});
			}
		},

		saveModalItem() {
			this.$refs.ItemFormComponent.validateForm();
		},

		handleAction({ data }) {
			const { name, callInRoot } = data;
			// console.log(this.$refs, this.$refs.ItemFormComponent, name)
			if (callInRoot) {
				this[name](data);
			} else if (this.$refs.ItemFormComponent[name]) {
				this.$refs.ItemFormComponent[name](data);
			} else {
				console.warn(`Action ${name} does not exists`);
			}
		},

		successModalSubmit(answer) {
			if (this.editModal.callback) {
				this.editModal.callback(answer);
			}
		}
	},

	watch: {
		'editModal.show'(show) {
			if (show) {
				/*setTimeout(() => {
					this.showModal = true;
				}, 10);*/
			} else {
				// setTimeout(() => {
				// this.showModal = false;
				// }, 10);
				if (show !== undefined) {
					setTimeout(() => {
						this.show_edit_modal({ editModalProp: this.editModalProp });
					}, 400);
				}
			}
		}
	}
};
</script>
