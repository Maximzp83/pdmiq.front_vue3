<template>
	<div class="measurement-unit-created-cell">
		<div class="measurement-unit-created-cell__name">
			<router-link class="link underline info-color" :to="`/users/${createdBy.id}`">{{ createdBy.name }}</router-link>
		</div>
		<div
			class="measurement-unit-created-cell__date muted"
			v-text="createdAtDisplay"
		></div>
	</div>
</template>

<script>
	import { cleanDateString } from '@/helpers';

export default {
	props: {
		propsData: Object
	},

	computed: {
		createdBy() {
			const { causer_data, last_event } = this.propsData;
			let result = {
				name: '-',
				id: null
			};
			if (last_event) {
				return {
					name: last_event.causer_data.full_name || '-',
					id: last_event.causer_id
				};
			}
			if (causer_data) {
				return {
					name: causer_data.full_name || '-',
					id: causer_data.id
				};
			}
			return result;
		},

		createdAtDisplay() {
			const { logged_at, last_event } = this.propsData;

			if (last_event) {
				return last_event.logged_at ? cleanDateString(last_event.logged_at) : '-';
			}

			return cleanDateString(logged_at) || '-';
		}
	},

	/*created() {
		console.log(this.propsData);
	}*/
};
</script>

<style scoped>
.measurement-unit-created-cell__name,
.measurement-unit-created-cell__date {
	line-height: 1.3;
}
</style>
