<template>
	<div
		class="imgWrapper relative"
		:class="{ 'has-equipment-img': equipment_picture }"
	>
		<div
			class="images-part-overlay dark-overlay pointer"
			v-if="equipmentData.pictures.length"
			@click="togglePreviewModal"
		>
			<div class="caption">
				<i class="icomoon icon-zoom-in"></i>
			</div>
		</div>
		<img
			:class="{ 'type-img': !equipment_picture }"
			:src="equipment_picture || equipmentData.equipment_type_img"
			alt="img error"
		/>
	</div>
</template>

<script>
export default {
	props: {
		equipmentData: {
			type: Object,
			required: true
		}
	},

	data() {
		return {};
	},

	computed: {
		equipment_picture() {
			const { equipmentData } = this;

			if (equipmentData) {
				const { pictures /*equipment_type_img*/ } = equipmentData;
				if (pictures.length) return Object.freeze(pictures[0].full_thumb_file_name);
			}
			// else if (equipment_type_img) return cardData.equipment_type_img;

			return null;
		}
	},

	methods: {
		togglePreviewModal() {
			const { pictures, full_file_name } = this.equipmentData;
			const picturesList = pictures || [
				{
					id: full_file_name,
					full_file_name: full_file_name
				}
			];

			const payload = {
				eventName: 'togglePreviewModal',
				data: {
					picturesList: picturesList,
					pictureId: picturesList[0].id + ''
				},
				onward: true
			};
			this.$emit('event', payload);
		}
	}
};
</script>
