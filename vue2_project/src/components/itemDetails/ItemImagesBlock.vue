<template>
	<div :class="[{ card: isCard }, 'block-item']">
		<div v-if="isCard" :class="['card-header filled_2']">
			<div class="title semi-bold uppercase" v-text="title || tt('IMAGE')"></div>
		</div>

		<div
			:class="[{ 'card-content': isCard }, { imgObjFitContain: imgObjFitContain }]"
		>
			<div
				v-if="filteredImagesList.length"
				:class="[
					'imgs-list mrow flex' /*{ 'has-equipment-img': equipment_picture }*/
				]"
			>
				<div
					class="img-item mcol-xs-6 fluid"
					v-for="img in filteredImagesList"
					:key="`image-${img.id}`"
				>
					<div class="content-container relative">
						<div class="instance-image-wrapper">
							<div
								class="images-part-overlay dark-overlay"
								@click="togglePreviewModal(img.id)"
							>
								<div class="caption">
									<i class="icomoon icon-zoom-in"></i>
								</div>
							</div>

							<!-- <div :style="`background-image: url(${img.full_file_name})`"
								class="inlineImg"></div> -->

							<img :src="img.full_file_name" alt="img error" />
						</div>
					</div>
				</div>
			</div>

			<div v-else-if="showMockSrc" class="img-item mock-item text-center ">
				<img
					:src="showMockSrc"
					alt="error"
					:class="['plant-dashboard-logo-mock', mockClass]"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { cloneDeep, mergeArrays } from '@/helpers';

export default {
	props: {
		itemData: { type: Object, default: () => ({}) },
		title: String,
		showMockSrc: String,
		mockClass: String,
		blockType: { type: String, default: 'card' },
		imagesListKey: String,
		imgObjFitContain: Boolean
	},

	computed: {
		isCard: that => that.blockType == 'card',

		imagesList() {
			if (this.itemData) {
				const itemData = cloneDeep(this.itemData);
				let { pictures, machine_pictures, full_file_name, file } = itemData;
				pictures = pictures || [];
				machine_pictures = machine_pictures || [];
				let images = mergeArrays(pictures, machine_pictures);

				if (this.imagesListKey) {
					images = itemData[this.imagesListKey];
				}
				if (images.length) {
					return images;
				} else if (full_file_name) {
					return [{ id: full_file_name, full_file_name: full_file_name }];
				} else if (file) {
					return [{ id: file, full_file_name: file }];
				}
				return [];
			}
			return [];
		},

		filteredImagesList() {
			const { imagesList } = this;
			let result = [];

			for (let i = 0; i < imagesList.length; i++) {
				let img = imagesList[i];
				if (result.some(r => r.type == img.type)) {
					continue;
				} else {
					img.id = `${img.id}-${i}`;
					result.push(img);
				}
			}

			return result;
		}
	},

	methods: {
		togglePreviewModal(id) {
			const payload = {
				eventName: 'togglePreviewModal',
				data: {
					picturesList: this.imagesList,
					pictureId: id
				},
				onward: true
			};
			this.$emit('event', payload);
		}
	}
};
</script>
