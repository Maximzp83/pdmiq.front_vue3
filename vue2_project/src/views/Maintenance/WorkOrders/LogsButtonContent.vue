<template>
	<ul class="">
		<li v-for="log in logsList" :key="`log-${log.id}`">
			<el-button
				:class="['action-button link underline info-color']"
				@click="showLog(log)"
			>
				<span>{{ log.id }}</span>
			</el-button>
		</li>
	</ul>
</template>

<script>
export default {
	props: {
		propsData: { type: Object, required: true },
		additionalProps: { type: Object, required: true }
	},

	data() {
		return {};
	},

	computed: {
		logsList() {
			return Object.freeze(this.propsData.logs || []);
		}
	},

	methods: {
		showLog(log) {
			this.$emit('event', {
				eventName: 'handleShowLog',
				data: {
					order: this.propsData,
					log: log
				},
				onward: true
			});
		}
	}
};
</script>
