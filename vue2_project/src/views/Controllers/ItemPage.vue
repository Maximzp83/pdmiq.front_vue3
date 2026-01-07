<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="mrow flex align-center">
					<div class="mcol-xs-auto">
						<!-- <h1 class="title page-title">{{ pageTitle }}</h1> -->
					</div>
					<div
						class="mcol-xs-auto"
						v-if="loadContent && (
							itemType === CONTROLLER_TYPES.BANNER ||
							itemType === CONTROLLER_TYPES.ULTRA_SOUND
						)"
						v-show="tabsList.length > 1"
					>
						<TabsBar
							@switchTab="switchTab"
							:activeTab="activeTab"
							:tabsList="tabsList"
						/>
					</div>
				</div>
				<div class="view-content-card card">
					<div class="form-wrapper card-content" v-if="loadContent">
						<ItemForm
							v-if="itemType === CONTROLLER_TYPES.BANNER"
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemsName="itemsName"
							:activeTab="activeTab"
							:tabsList="tabsList"
							:new_item_type="CONTROLLER_TYPES.BANNER"
						/>

						<ItemFormUltraSound
							v-if="itemType === CONTROLLER_TYPES.ULTRA_SOUND"
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemsName="itemsName"
							:activeTab="activeTab"
							:tabsList="tabsList"
							:new_item_type="CONTROLLER_TYPES.ULTRA_SOUND"
						/>

						<!-- <ItemFormUltraSoundWhiteRiver
							ref="ItemFormComponent"
							v-if="itemType === CONTROLLER_TYPES.ULTRA_SOUND_WHITE_RIVER"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemsName="itemsName"
							:new_item_type="CONTROLLER_TYPES.ULTRA_SOUND_WHITE_RIVER"
						/> -->

						<ItemFormCounter
							v-if="itemType === CONTROLLER_TYPES.COUNTER"
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemsName="itemsName"
							:new_item_type="CONTROLLER_TYPES.COUNTER"
							:additionalItemType="additionalItemType"
						/>

						<ItemFormNCD
							v-if="itemType === CONTROLLER_TYPES.NCD"
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:itemsName="itemsName"
							:new_item_type="CONTROLLER_TYPES.NCD"
							:additionalItemType="additionalItemType"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { navigation, itemPageMixin, initPageDataMixin, tabsMixin } from '@/mixins';
import { CONTROLLER_TYPES } from '@/constants/global';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin(), tabsMixin()],
	name: 'ControllerPage',

	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		ItemForm: () => import('./ItemForm.vue'),
		ItemFormUltraSound: () => import('./ItemFormUltraSound.vue'),
		// ItemFormUltraSoundWhiteRiver: () => import('./ItemFormUltraSoundWhiteRiver.vue'),
		ItemFormCounter: () => import('./ItemFormCounter.vue'),
		ItemFormNCD: () => import('./ItemFormNCD.vue')
	},

	data() {
		return {
			// item_type: CONTROLLER_TYPES.BANNER,
			additionalItemType: ''
		};
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('Controller'),
				mult: this.$t('Controllers')
			};
		},

		itemType() {
			const { itemData, $route } = this;
			if (itemData) {
				return itemData.type;
			}

			if ($route.query && $route.query.type) {
				return +$route.query.type;
			}

			return undefined;
		},

		CONTROLLER_TYPES: () => CONTROLLER_TYPES,

		tabsList() {
			let list = [
				{ title: 'main', prop: 'mainTabActive' }
			];

			if (this.itemData && this.itemData.type === CONTROLLER_TYPES.BANNER) {
				list.push({ title: 'formulas', prop: 'formulasTabActive' });
			}

			if (this.itemData) {
				list.push({ title: 'commands', prop: 'commandsTabActive' });
			}

			if (this.itemData && this.itemData.type === CONTROLLER_TYPES.BANNER) {
				list.push({ title: 'devices', prop: 'devicesTabActive' });			
			}

			return Object.freeze(list);
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'controllers/fetch_controller',
			save_item: 'controllers/save_controller'
		}),

		handleSubmitForm(data) {
			const payload = { data: data };

			if (data.configure_file || data.sb_file) {
				payload.withFile = true;
			}

			/*if (payload) {
				console.log(payload)
				return
			}*/
			// console.log(payload)
			// payload.data.attribute_options_id = [242, 245];
			this.save_item(payload).then(() => {
				this.changeRoute({ parent: true });
			});
		}
	}
};
</script>