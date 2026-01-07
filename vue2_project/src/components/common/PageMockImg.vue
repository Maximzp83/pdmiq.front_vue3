<template>
	<div class="view-content-card card content-row">
		<div class="card-content success-dashboard-content">
			<div class="title fz_48 text-center">
				{{ text || tt('phrases.select_plant_first') }}!
			</div>

			<div class="main-image-container">
				<div class="imgWrapper main-img">
					<img :src="dashboardPresentation" alt="img error" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { dashboardPresentation } from '@/constants/global';

export default {
	props: {
		text: String
	},
	computed: {
		dashboardPresentation: () => dashboardPresentation
	}
};
</script>
