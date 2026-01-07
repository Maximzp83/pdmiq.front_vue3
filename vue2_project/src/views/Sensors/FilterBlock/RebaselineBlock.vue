<template>
	<div class="">
		<el-popover
			placement="bottom"
			popper-class="button-popover"
			:title="tt('phrases.thresholds_re_baseline')"
			width="180"
			trigger="hover"
		>
			<el-button
				@click="click_re_baseline"
				slot="reference"
				type="primary"
				native-type="button"
				class="ml-auto inverted re-baseline-button"
				:class="{ loading: rebaselineLoading }"
			>
				<div class="relative img-container">
					<img
						:class="[`suffix-icon`, 'img rebase-wheel-img']"
						:src="rebase_wheel"
					/>
					<img
						:class="[`suffix-icon`, 'img rebase-lines-img']"
						:src="rebase_lines"
					/>
				</div>
			</el-button>
		</el-popover>
	</div>
</template>

<script>
	import {
		rebase_lines,
		rebase_wheel,
	} from '@/constants/global';
	
	import { RebaselineRequestMixin, actionButtonsMixin } from '@/mixins';

export default {
	mixins: [RebaselineRequestMixin(), actionButtonsMixin()],
	props: {
		sensorData: {
			type: Object,
			required: true
		},
	},

	data() {
		return {
			rebaselineLoading: false
		};
	},
	computed: {
		rebase_wheel: () => rebase_wheel,
		rebase_lines: () => rebase_lines,
	},

	methods: {
		
	}

};
</script>
