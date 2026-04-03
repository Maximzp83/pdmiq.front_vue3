<template>
	<div class="crossover-block">
		<div class="card relative vertical-fluid">
			<div class="card-header">
				<div class="title semi-bold uppercase">{{ title }}</div>
			</div>

			<div class="card-content relative">
				<SimpleSpinner :active="crossoverLoading" />

				<ul class="info-list crossover" v-if="!disableCrossoverBlock">
					<li v-for="item in crossoverList" :key="`cross-${item.label}`">
						<span
							class="quantity pointer"
							v-text="`${item.quantity}`"
							@click="handleShowAnaloguesList(item)"
						></span>
						<span class="text capitalize-first" v-text="item.label"></span>
					</li>
				</ul>

				<div v-else class="text-center semi-bold">
					{{ tt('phrases.data_missing_for_crossovers') }}
				</div>
			</div>
		</div>

		<el-dialog
			append-to-body
			center
			:class="'1small dialog-decorate-header'"
			:title="analoguesTitle"
			:visible.sync="showAnalogues"
		>
			<!-- @success="updateChart" -->
			<AnaloguesList
				preventSetNavbar
				@closeDialog="showAnalogues = false"
				:itemsList="selectedCrossoverList"
				:visible="showAnalogues"
			/>
			<!-- :processData="processData" -->
		</el-dialog>
	</div>
</template>

<script>
export default {
	components: {
		AnaloguesList: () => import('./AnaloguesList.vue')
	},

	props: {
		crossoverList: Array,
		crossoverLoading: Boolean,
		equipmentData: Object,
		equipmentTypeName: String
	},

	data: () => ({
		showAnalogues: false,
		selectedCrossoverList: [],
		analoguesTitle: ''
	}),

	computed: {
		title() {
			return `${this.tt('crossover')} ${this.equipmentTypeName}`;
		},

		disableCrossoverBlock() {
			const {
				brand_model_is_crossover_excluded,
				brand_is_crossover_excluded
			} = this.equipmentData;
			return !!brand_model_is_crossover_excluded || !!brand_is_crossover_excluded;
		}
	},

	methods: {
		handleShowAnaloguesList({ label, list }) {
			if (list.length) {
				this.analoguesTitle = `${label}`.toUpperCase();
				this.selectedCrossoverList = list;
				this.showAnalogues = true;
			}
		}
	}
};
</script>
