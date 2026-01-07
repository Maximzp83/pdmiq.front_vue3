<template>
	<div class="">
		<div class="title bold">
			{{ `${tt('Part')}: ${equipmentTypeData.brand_model_name}` }}
		</div>
		<ul class="info-list typeOptions">
			<InfoItem
				v-for="item in typeOptions"
				:key="`footer-${item.id}`"
				:settingItem="item"
				labelClassName="capitalize"
				:valueMethod="getTypeOptionValue"
				keyProp="name"
			/>
		</ul>
	</div>
</template>

<script>
export default {
	components: {
		InfoItem: () => import('@/components/itemDetails/InfoItem.vue')
	},

	props: {
		equipmentTypeData: { type: Object, required: true }
	},

	computed: {
		typeOptions: that =>
			Object.freeze(
				that.equipmentTypeData.typeOptions.filter(
					to => to.raw_values && to.raw_values.length && to.is_in_equipment_card
				)
			)
	},

	methods: {
		getTypeOptionValue({ raw_values }) {
			let resut = '';
			raw_values.forEach(rw => (resut += ` ${rw}`));
			return resut;
		}
	}
};
</script>
