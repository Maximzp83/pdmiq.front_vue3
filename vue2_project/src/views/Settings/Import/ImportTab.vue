<template>
	<div class="">
		<div class="card connect_to_card bottom">
			<div class="card-content small-buttons-navbar mrow wrap flex card-tabs">
				<ButtonsNavbar
					class="mcol-xs-12 mcol-sm-auto"
					card
					inline
					:itemsList="navbarList"
					buttonType="el-button--info inverted"
				/>

				<div
					class="fluid mcol-xs-12 mcol-sm-6"
					v-if="currentPath == '/settings/import/history'"
				>
					<Filterbar
						@event="handleEvent"
						:filters="filters"
						:hideCreate="true"
						:hideDelete="true"
					/>
				</div>
			</div>
		</div>

		<transition name="standard-fade" mode="out-in">
			<router-view ref="nestedViewContent" preventSetNavbar />
		</transition>
	</div>
</template>

<script>
import { mapState /*, mapActions*/ } from 'vuex';
import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		ButtonsNavbar: () => import('@/components/common/ButtonsNavbar.vue'),
		Filterbar: () => import('@/components/common/Filterbar.vue')
	},
	computed: {
		...mapState({
			filters: state => state.testing.filters
		}),
		navbarList: () => [
			{ id: 1, path: '/settings/import/logs', label: 'Plant' },
			{ id: 2, path: '/settings/import/master', label: 'Master' },
			{ id: 3, path: '/settings/import/history', label: 'History' }
		],

		currentPath: that => that.$route.fullPath
	},

	methods: {
		set_filters(filters) {
			this.$store.dispatch('testing/set_settings_filters', filters);
		},

		setFilters(filters, bindedFilters = []) {
			let newFilters = { ...this.filters, ...filters };
			// console.log('filters', this.filters.page, newFilters.page)
			if (this.filters.page == newFilters.page) {
				newFilters.page = 1;
			}
			if (bindedFilters.length) {
				for (const prop of bindedFilters) {
					if (this.filters[prop]) {
						newFilters = { ...newFilters, [prop]: null };
					}
				}
			}
			// console.log(newFilters)
			this.set_filters(newFilters);
		}

		/*handleSaveItem() {
			if (this.$refs['EmailsForm'].handleSaveItem) {
				this.$refs['EmailsForm'].handleSaveItem();
			}
		}*/
	}
};
</script>
