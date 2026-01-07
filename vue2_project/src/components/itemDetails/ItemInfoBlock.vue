<template>
	<div class="card block-item">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase" v-text="blockTitle"></div>
		</div>

		<div class="card-content flex column">
			<ul
				:class="[
					'section-row info-list',
					infoListClassName,
					{ 'dots-in-text': dotsInText }
				]"
			>
				<InfoItem
					v-for="item in settingsList"
					:key="`info-${item.label}`"
					:settingItem="item"
					:itemData="itemData"
				/>

				<template v-if="additionalInfoItems">
					<InfoItem
						v-for="sec_item in additionalInfoItems.settingsList"
						:key="`info-${sec_item.label}`"
						:settingItem="
							additionalInfoItems.constSettingItem
								? additionalInfoItems.constSettingItem
								: sec_item
						"
						:itemData="additionalInfoItems.constSettingItem ? sec_item : itemData"
					/>
				</template>
			</ul>

			<div class="section-row relative counters-list" v-if="usedCountersList.length">
				<SimpleSpinner :active="countersLoading" />
				<div class="mrow flex">
					<CounterItem
						v-for="item in usedCountersList"
						:key="`counter-${item.title}`"
						:counterData="item"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// import { mapActions } from 'vuex';
// import { findItemBy } from '@/helpers';
// import { fetchItemsHelper } from '@/mixins';

export default {
	// mixins: [fetchItemsHelper],
	components: {
		InfoItem: () => import('./InfoItem.vue'),
		CounterItem: () => import('./CounterItem.vue')

		// ImagePreviewModal: () => import('@/components/common/ImagePreviewModal.vue')
	},

	props: {
		itemData: {
			type: Object,
			required: true
		},
		blockTitle: String,
		settingsList: { type: Array, default: () => [] },
		countersSettings: { type: Object, required: false },
		infoListClassName: String,
		dotsInText: Boolean,
		additionalInfoItems: Object
	},

	data() {
		return {
			// countersList: [],
			countersLoading: false
		};
	},

	computed: {
		// preventSetupNavbar: () => true,
		// preventDestroyNavbar: () => true,
		usedCountersList() {
			if (this.countersSettings) {
				const { /*countersList*/ itemData } = this;
				const { /*list,*/ items } = this.countersSettings;

				// if (countersList.length) {
				// 	return list.map(li => findItemBy('title', li, countersList));
				// }

				return items.map(i => ({ ...i, count: itemData[i.count] }));
			}

			return [];
		}
	},

	methods: {
		/*...mapActions({
			fetch_counters: 'dashboard/fetch_counters',
		}),*/
		/*fetchCounters() {
			const { filter } = this.countersSettings;
			const { itemData } = this;
			const payload = { params: 
				{ [filter.key]: itemData[filter.valueProp] }
			};

			this.doFetchAction(
				'fetch_counters',
				'countersList',
				'countersLoading',
				payload
			);
		},*/
	},

	created() {
		// this.fetchCounters({})
	}
};
</script>
