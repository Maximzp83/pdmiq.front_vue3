<template>
	<div class="imgWrapper relative" :class="{ 'has-equipment-img': equipmentPicture }">
		<div
			v-if="equipmentData.pictures?.length"
			class="images-part-overlay dark-overlay pointer"
			@click="togglePreviewModal"
		>
			<div class="caption">
				<i class="icomoon icon-zoom-in"></i>
			</div>
		</div>
		<img
			:class="{ 'type-img': !equipmentPicture }"
			:src="equipmentPicture || equipmentData.equipment_type_img"
			alt="img error"
		/>
	</div>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'EquipmentPictureBlock',
});

const props = defineProps({
	equipmentData: { type: Object, required: true },
});

const emit = defineEmits(['event']);

const equipmentPicture = computed(() => {
	const pictures = props.equipmentData?.pictures || [];
	return pictures.length ? Object.freeze(pictures[0].full_thumb_file_name) : null;
});

const togglePreviewModal = () => {
	const { pictures, full_file_name } = props.equipmentData;
	const picturesList = pictures || [
		{
			id: full_file_name,
			full_file_name,
		},
	];

	emit('event', {
		eventName: 'togglePreviewModal',
		data: {
			picturesList,
			pictureId: `${picturesList[0].id}`,
		},
		onward: true,
	});
};
</script>
