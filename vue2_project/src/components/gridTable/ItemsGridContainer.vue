<template>
	<div class="items-grid-container drag-n-drop-wrapper">
		<VueElementLoading
			class="section-block"
			:active="itemsLoading"
			spinner="line-scale"
			:text="`${itemsName.mult} loading...`"
			:background-color="'rgba(255, 255, 255, .7)'"
		/>

		<div :class="['flex mrow wrap', itemsListClassName]" v-if="itemsList.length">
			<div
				:class="['card_item', cardClassName || 'mcol-xs-12 mcol-sm-6 mcol-lg-4']"
				v-for="item in itemsList"
				:key="`card_item-${item.id}`"
				:data-id="item.id"
			>
				<!-- <GridItemCardWrapper -->
				<component
					v-if="instanceName || componentPath"
					ref="ItemCardContent"
					@event="handleEventNew"
					:cardData="item"
					:selectedIds="selectedIds"
					:instanceName="instanceName"
					v-bind:is="componentFile"
					:componentPath="componentPath"
					:operationsSettings="operationsSettings"
					:additionalProps="additionalProps"
				/>
			</div>
		</div>

		<div class="errors-block" v-else-if="!itemsLoading">
			<div
				class="text-center section-block"
				v-if="$Lang.currentLangId === LANGUAGE_TYPES.ENGLISH"
			>
				{{ `${itemsName.mult} ${tt('phrases.not_found')}` }}...
			</div>
			<div
				class="text-center section-block"
				v-else-if="$Lang.currentLangId === LANGUAGE_TYPES.SPANISH"
			>
				{{ `${tt('phrases.not_found')} ${itemsName.mult}` }}...
			</div>
		</div>
	</div>
</template>

<script>
// import { getObjectVal } from '@/helpers';
// import { USER_TYPES } from '@/constants/global';
import { eventHandler } from '@/mixins';
import { LANGUAGE_TYPES } from '@/localization/utils';

export default {
	mixins: [eventHandler()],
	components: {
		// GridItemCardWrapper: () => import('./GridItemCardWrapper.vue'),
	},
	props: {
		itemsName: { type: Object, required: true },
		itemsList: {
			type: Array,
			default: () => []
		},
		operationsSettings: { type: Object, default: () => ({}) },
		additionalProps: { type: Object, default: () => ({}) },

		/*tableSettings: {
			type: Object,
			default: () => ({})
		},*/
		itemsLoading: Boolean,
		itemsSaving: Boolean,
		canDeleteSettings: null,
		disableSelection: Boolean,
		hideHeader: Boolean,
		disableSort: Boolean,
		emptyText: String,
		instanceName: String,
		componentPath: String,
		cardClassName: String,
		itemsListClassName: String
		// checkIsDisabled: Boolean
		// clearable: Boolean,
		// query: String
	},

	data() {
		return {
			selectedIds: []
			// activeRowIdx: null
		};
	},
	computed: {
		LANGUAGE_TYPES: () => LANGUAGE_TYPES,

		/*showOperations() {
			const authUserType = this.$store.state.auth.authUser.type;
			return authUserType !== USER_TYPES.PLANT_USER;
		},*/

		componentFile() {
			const path = this.componentPath
				? `${this.componentPath}`
				: `${this.instanceName}/ItemCard`;

			return () => import(`@/views/${path}.vue`);
		}
	},
	methods: {
		/*toConsole(val) {
			console.log(val);
		},*/

		handleSelectionChange(id) {
			if (this.selectedIds.indexOf(id) != -1) {
				this.selectedIds = this.selectedIds.filter(s_id => s_id !== id);
			} else {
				this.selectedIds.push(id);
			}
		}
	}
};
</script>
