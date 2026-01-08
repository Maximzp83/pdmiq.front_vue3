<template>
	<ElDialog
		:class="'imgDialog'"
		:title="hideTitle ? '' : title"
		center
		top="15px"
		:append-to-body="true"
		:model-value="imgDialogOpen"
		@close="closeModal"
	>
		<div class="imgDialogContainer">
			<div class="zoom-buttons-block">
				<button
					class="zoom-button out div-block"
					type="button"
					@click="changeZoom(-0.2)"
				>
					<i class="icomoon icon-zoom-out"></i>
				</button>
				<button
					class="zoom-button in div-block"
					type="button"
					@click="changeZoom(0.2)"
				>
					<i class="icomoon icon-zoom-in"></i>
				</button>
				<button
					class="zoom-button out div-block"
					type="button"
					@click="changeZoom(0)"
				>
					Reset zoom
				</button>
			</div>

			<button
				v-if="slidesQuantity > 1"
				class="cycle-button prev"
				type="button"
				@click="changePreviewSlide(-1)"
			>
				<i class="icomoon icon-path_2"></i>
			</button>

			<div :class="['img-container', { show: previewImgShow }]">
				<div
					v-for="(item, idx) in pictures"
					v-show="idx == currentImageIdx"
					:key="`full-pic-${item.id}`"
					class="img-wrapper"
				>
					<img
						v-if="idx == currentImageIdx"
						:src="item.full_file_name || item.file_path || item.url || item.file"
						:alt="`failed to load - ${item.file_name}`"
					/>
				</div>
			</div>

			<button
				v-if="slidesQuantity > 1"
				class="cycle-button next"
				type="button"
				@click="changePreviewSlide(1)"
			>
				<i class="icomoon icon-path_2"></i>
			</button>

			<div v-if="showProgressBar && slidesQuantity > 1" class="progress-block">
				<ul>
					<li
						v-for="item in pictures"
						:key="`pic-${item.id}`"
						:class="{ active: imgId == item.id }"
						@click="setPreviewImg(item.id)"
					></li>
				</ul>
			</div>
		</div>
	</ElDialog>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue';
import { ElDialog } from 'element-plus';
import { findItemBy } from '@/helpers';
import { getImgTypeName } from '@/helpers/specialHelpers';

const props = defineProps({
	imgDialogOpen: {
		type: Boolean,
		default: false,
	},
	imgId: {
		type: String,
		default: '',
	},
	pictures: {
		type: Array,
		default: () => [],
	},
	hideTitle: {
		type: Boolean,
		default: false,
	},
	showProgressBar: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['closeModal', 'update:imgId']);

const title = ref('');
const currentImageIdx = ref(0);
const previewImgShow = ref(true);
const isMobile = ref(false);
const currentZoom = ref(1);
const draggingActive = ref(false);

const slidesQuantity = computed(() => {
	if (props.pictures) {
		return props.pictures.length;
	}
	return 0;
});

const changeZoom = (zoom) => {
	const imgElement = document.querySelector('.imgDialogContainer .img-wrapper > img');
	if (imgElement) {
		if (zoom) {
			currentZoom.value = currentZoom.value + zoom;
		} else {
			currentZoom.value = 1;
		}
		imgElement.style.transform = `scale(${currentZoom.value})`;
	}
};

const setPreviewImg = (id) => {
	currentZoom.value = 1;
	if (props.showProgressBar && props.imgId == id) return;
	id = isNaN(+id) ? id : +id;
	const picture = findItemBy('id', id, props.pictures);

	if (picture) {
		previewImgShow.value = false;
		title.value = getImgTypeName(picture);

		setTimeout(() => {
			currentImageIdx.value = props.pictures.indexOf(picture);
			emit('update:imgId', `${id}`);
		}, 200);

		setTimeout(() => {
			previewImgShow.value = true;
		}, 400);
	}
};

const changePreviewSlide = (dir) => {
	const lastIdx = slidesQuantity.value - 1;
	let newIdx = currentImageIdx.value + dir;

	newIdx > lastIdx ? (newIdx = 0) : null;
	newIdx < 0 ? (newIdx = lastIdx) : null;

	setPreviewImg(props.pictures[newIdx].id);
};

const closeModal = () => {
	emit('closeModal');
	setTimeout(() => {
		currentImageIdx.value = 0;
	}, 300);
};

const setupDraggableImage = () => {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	const imgElement = document.querySelector('.imgDialogContainer .img-wrapper > img');

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		imgElement.style.top = imgElement.offsetTop - pos2 + 'px';
		imgElement.style.left = imgElement.offsetLeft - pos1 + 'px';
	}

	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;
	}

	if (imgElement) {
		imgElement.onmousedown = dragMouseDown;
	}
};

watch(
	() => props.imgDialogOpen,
	(isOpen) => {
		if (isOpen) {
			setPreviewImg(props.imgId);
		}
	}
);

watch(currentZoom, (zoom) => {
	if (zoom > 1) {
		if (!draggingActive.value) {
			setupDraggableImage();
			draggingActive.value = true;
		}
	} else {
		draggingActive.value = false;
		const imgElement = document.querySelector('.imgDialogContainer .img-wrapper > img');
		if (imgElement) {
			imgElement.style.top = 'initial';
			imgElement.style.left = 'initial';
		}
	}
});

onBeforeMount(() => {
	isMobile.value = document.documentElement.clientWidth < 992;
});
</script>
