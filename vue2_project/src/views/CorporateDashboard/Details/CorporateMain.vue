<template>
	<div :class="['view-content-card corporate-for-print-container', {'printHTMLWindowIsOpen':printHTMLWindowIsOpen}]">
		<VueElementLoadingWrapper
			:isLoading="plantsLoading"
			:itemsName="itemsName.mult"
		/>

		<div class="section-row 1break-page-block">
			<div class="card content-row main-title flex align-center">
				<div class="card-content common-title semi-bold">{{`${companyData.name} - ${tt('overall_Program_Review')}` }}</div>

				<div class="logo-img ml-auto">
					<img :src="main_logo" alt="logo" />
				</div>
			</div>

			<PlantDetailsItem
				class="content-row"
				v-if="plantsList.length"
				:companyId="companyId"
				:plantsList="plantsList"
				:propsFilters="predefinedFiltersForAllPlants"
				:allPlantsRoiStatistics="allPlantsRoiStatistics"
			/>
				<!-- :selectedColumnsNumber="selectedColumnsNumber" -->

			<div v-else class="card ">
				<div class="card-content common-title text-center">This Company does not contain plants...</div>
			</div>
				<!-- @event="handleEventNew" -->
		</div>

		<div class="section-row content-row flex align-center columns-selector">
			<div class="common-title semi-bold capitalize">{{`${ tt('Plant')} ${tt('Summaries') } ${tt('view') }`}}</div>
			<div class="mcol-xs-3 mcol-sm-2 filter-item perPage-item ml-auto">
				<CustomSelect
					:optionsLoading="plantsLoading"
					:optionsList="columnsNumberList"
					v-model="columnsNumber"
				/>
			</div>
		</div>

		<div class="content-row flex mrow wrap columns-list">
			<!-- <div class=""> -->
				<div :class="[
					`mcol-xs-${selectedColumnsNumber.classPostfix}`,
					{'break-page-block': setBreakPageFor(idx, selectedColumnsNumber.id) },
					`columnsNumber-${selectedColumnsNumber.id}`
				]"
					v-for="(plantItem, idx) in plantsList"
					:key="`plant-${plantItem.id}`"
				>
						<!-- v-if="idx == 0" -->
					<PlantDetailsItem
						@event="handleEventNew"
						class="card column-item"
						:plantItem="plantItem"
						:selectedColumnsNumber="selectedColumnsNumber"
						:isLastItem="idx == plantsList.length-1"
						@onLastItemMounted="handleLastItemMounted"
					/>
				<!-- </div> -->
			</div>
		</div>
				<!-- @event="handleEventNew" -->
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';

Vue.use(HighchartsVue);
import { mapActions, mapState } from 'vuex';
// import { findItemBy } from '@/helpers';
// import { required /*number*/ } from '@/constants/validation';
// import { MAINTENANCE_TYPES } from '@/constants/global';
import { main_logo } from '@/constants/global';


import { fetchItemsHelper, eventHandler } from '@/mixins';

export default {
	mixins: [fetchItemsHelper(), eventHandler()],
	// name: 'QuoteTab',
	components: {
		PlantDetailsItem: () => import('./PlantDetailsItem.vue'),
	},

	props: {
		companyId: Number,
		companyData: { type: Object, required: true },
		// plantItem: Object,
	},

	data() {
		return {
			plantsList: [],
			plantsLoading: false,
			columnsNumber: 1,

			allPlantsRoiStatistics: {
				currentValue: 0,
				redArea: 0,
			},
		};
	},

	computed: {
		...mapState({
			printHTMLWindowIsOpen: state => state.global.printHTMLWindowIsOpen,
			// globalFilters: state => state.global.globalFilters,
			// authUser: state => state.auth.authUser
		}),

		/*filteredPlants() {
			let list = [];
			for (let i = 0; i < this.plantsList.length; i++) {
				if (i < 4) list.push(this.plantsList[i]);
			}
			return list;
		},*/

		main_logo: () => main_logo,

		itemsName() {
			return Object.freeze({
				one: this.$t('Plant'),
				mult: this.$t('Plants')
			});
		},

		predefinedFiltersForAllPlants: that =>
			Object.freeze({
				plantId: null,
				plantIds: that.plantsList.map(item => item.id),
				// productionLineId: null
			}),
			
		columnsNumberList() {
			return Object.freeze([
				{ id: 1, label: '1', classPostfix: '12' },
				{ id: 2, label: '2', classPostfix: '6' },
				{ id: 3, label: '3', classPostfix: '4' },
				{ id: 4, label: '4', classPostfix: '3' },
				{ id: 5, label: '5', classPostfix: '20' },
				// { id: 6, label: '6', classPostfix: '2' }
			])
		},

		selectedColumnsNumber() {
			return this.columnsNumberList.find(item => item.id === this.columnsNumber) || this.columnsNumberList[0];
		},

		/*authUser() {
			return this.$store.state.auth.authUser;
		},*/

		/*isIndustrialMatrix() {
			return this.$store.state.auth.isIndustrialMatrix;
		},*/
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
		}),

		fetchPlants(companyId) {
			const payload = { params: {max:-1, companyId} };
			this.doFetchAction('fetch_plants', 'plantsList', 'plantsLoading', payload);
		},

		setBreakPageFor(idx, columnsNum) {
			// if (columnsNum < 2) return true;
			if (columnsNum == 1) return idx % 2 == 0;

			return idx % columnsNum == 0;
		},

		handleLastItemMounted() {
			if (this.selectedColumnsNumber.id > 1) {
				const columns = document.querySelectorAll('.corporate-dashboard .columns-list > div')

				let rowsHeight = {};
				let row = 0;

				for (let i = 0; i < columns.length; i++) {
					const column = columns[i];
					if (column.classList.contains('break-page-block')) {
						row++;
						rowsHeight[row] = 0;
					}

					const block = column.querySelector('.column-item .roi-charts-wrapper');
					block.setAttribute('rowIdx', row);
					if (rowsHeight[row] < block.offsetHeight) {
						rowsHeight[row] = block.offsetHeight;
					}
				}

				for (let i = 0; i < columns.length; i++) {
					const column = columns[i];
					const block = column.querySelector('.column-item .roi-charts-wrapper');
					const rowIdx = block.getAttribute('rowIdx');
					const height = rowsHeight[rowIdx];
					block.style.height = `${height}px`;
					// console.log(height)
				}
				// console.log(rowsHeight)
			}
		},

		plantRoiStatisticsReady(data) {
			// console.log('plantRoiStatisticsReady', data)
			this.allPlantsRoiStatistics = {
				currentValue: this.allPlantsRoiStatistics.currentValue + data.currentValue,
				redArea: this.allPlantsRoiStatistics.redArea + data.redArea
			}
		}
	},

	watch: {
		companyId(id) {
			this.allPlantsRoiStatistics = {
				currentValue: 0,
				redArea: 0
			}
			this.fetchPlants(id);			
		},

		/*'printHTMLWindowIsOpen'(isOpen) {
			if (isOpen && this.columnsNumber > 3) {
				this.columnsNumber = 3;
			}
		}*/
	},

	created() {
		this.fetchPlants(this.companyId);
	}
};
</script>
