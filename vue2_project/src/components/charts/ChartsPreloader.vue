<template>
	<div class="">
		<div v-if="showMock">
			<slot v-if="customMock" name="custom_mock"></slot>

			<div v-else class="chart-mock card content-row">
				<div
					class="content-container inlineImg"
					style="background-image: url(/static/img/background/graph.svg)"
				>
					<div class="caption">
						<div class="text-item">{{ tt('phrases.There_are') }}</div>
						<div class="text-item central">{{ tt('phrases.no_charts') }}</div>
						<div class="text-item">{{ tt('phrases.for_this_sensor') }}</div>
					</div>
				</div>
			</div>
		</div>

		<div v-if="showPreloader" class="chart-mock card content-row">
			<VueElementLoading
				spinner="ring"
				:active="true"
				:text="preloaderText || `${tt('phrases.charts_loading')}...`"
				:background-color="'transparent'"
			/>

			<div
				class="content-container inlineImg"
				style="background-image: url(/static/img/background/graph.svg)"
			></div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		showMock: null,
		customMock: Boolean,
		showPreloader: Boolean,
		preloaderText: String
	}
};
</script>
