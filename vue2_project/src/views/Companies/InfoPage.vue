<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<!-- <h1 class="title page-title">{{ pageTitle }}</h1> -->
				<div class="view-content-card card">
					<div class="form-wrapper card-content" v-if="!itemLoading && itemData">
						<div class="item-info-block">
							<div class="info-item">
								<div class="">
									<b>{{ tt('Name') }}</b
									>:
								</div>
								<div class="info">{{ itemData.name }}</div>
							</div>
							<div class="info-item">
								<div class="">
									<b>{{ tt('Address') }}</b
									>:
								</div>
								<div class="info">{{ itemData.address }}</div>
							</div>
							<div class="info-item">
								<div class="">
									<b>{{ tt('Phone') }}</b
									>:
								</div>
								<div class="info">{{ itemData.phone_number }}</div>
							</div>
							<div class="info-item">
								<div class="">
									<b>{{ tt('Comments') }}</b
									>:
								</div>
								<div class="info">{{ itemData.comments }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { initPageDataMixin } from '@/mixins';

export default {
	mixins: [initPageDataMixin()],
	name: 'InfoPage',

	data() {
		return {
			withoutClearItem: false
		};
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('Company'),
				mult: this.$t('Companies')
			};
		},

		pageTitle() {
			const itemName = this.itemsName.one;
			if (this.itemData) {
				return `${this.itemData.name} ${this.$t('info')}`;
			}
			return `${itemName}`;
		},

		navbarSettings() {
			return {
				navigateButton: { history: true, steps: -1 },
				editButton: { parent: true, steps: 1 },
				showFilter: true
			};
		}
	},

	methods: {
		...mapActions({
			fetch_item: 'companies/fetch_company'
		})
	}
};
</script>
