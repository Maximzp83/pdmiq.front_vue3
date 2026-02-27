<template>
	<div :class="[{ card: isCard }, 'block-item']">
		<div v-if="isCard" class="card-header filled_2">
			<div class="title semi-bold uppercase" v-text="title || tt('IMAGE')"></div>
		</div>

		<div :class="[{ 'card-content': isCard }, { imgObjFitContain: imgObjFitContain }]">
			<div v-if="filteredImagesList.length" class="imgs-list mrow flex">
				<div
					v-for="img in filteredImagesList"
					:key="`image-${img.id}`"
					class="img-item mcol-xs-6 fluid"
				>
					<div class="content-container relative">
						<div class="instance-image-wrapper">
							<div class="images-part-overlay dark-overlay" @click="togglePreviewModal(img.id)">
								<div class="caption">
									<i class="icomoon icon-zoom-in"></i>
								</div>
							</div>

							<img :src="img.full_file_name" alt="img error" />
						</div>
					</div>
				</div>
			</div>

			<div v-else-if="showMockSrc" class="img-item mock-item text-center">
				<img
					:src="showMockSrc"
					alt="error"
					:class="['plant-dashboard-logo-mock', mockClass]"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { cloneDeep, mergeArrays } from '@/helpers';

defineOptions({
	name: 'ItemImagesBlock',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	title: { type: String, default: '' },
	showMockSrc: { type: String, default: '' },
	mockClass: { type: String, default: '' },
	blockType: { type: String, default: 'card' },
	imagesListKey: { type: String, default: '' },
	imgObjFitContain: Boolean,
});

const emit = defineEmits(['event']);

const isCard = computed(() => props.blockType === 'card');

const imagesList = computed(() => {
	if (!props.itemData) {
		return [];
	}

	const itemData = cloneDeep(props.itemData);
	let { pictures, machine_pictures: machinePictures, full_file_name: fullFileName, file } = itemData;
	pictures = pictures || [];
	machinePictures = machinePictures || [];
	let images = mergeArrays(pictures, machinePictures);

	if (props.imagesListKey) {
		images = itemData[props.imagesListKey] || [];
	}

	if (images.length) {
		return images;
	}
	if (fullFileName) {
		return [{ id: fullFileName, full_file_name: fullFileName }];
	}
	if (file) {
		return [{ id: file, full_file_name: file }];
	}

	return [];
});

const filteredImagesList = computed(() => {
	const result = [];
	for (let i = 0; i < imagesList.value.length; i++) {
		const img = imagesList.value[i];
		if (result.some((resultItem) => resultItem.type === img.type)) {
			continue;
		}
		result.push({ ...img, id: `${img.id}-${i}` });
	}
	return result;
});

const togglePreviewModal = (id) => {
	emit('event', {
		eventName: 'togglePreviewModal',
		data: {
			picturesList: imagesList.value,
			pictureId: id,
		},
		onward: true,
	});
};
</script>
