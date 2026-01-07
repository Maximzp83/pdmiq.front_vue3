<template>
	<el-dialog
		:class="'imgDialog'"
		:title="hideTitle ? '' : title"
		center
		top="15px"
		@close="closeModal"
		:append-to-body="true"
		:visible="imgDialogOpen"
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
					class="img-wrapper"
					v-show="idx == currentImageIdx"
					v-for="(item, idx) in pictures"
					:key="`full-pic-${item.id}`"
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

			<div class="progress-block" v-if="showProgressBar && slidesQuantity > 1">
				<ul>
					<li
						v-for="item in pictures"
						:key="`pic-${item.id}`"
						@click="setPreviewImg(item.id)"
						:class="{ active: imgId == item.id }"
					></li>
				</ul>
			</div>
		</div>
	</el-dialog>
</template>

<script>
import { findItemBy } from '@/helpers';
import { getImgTypeName } from '@/helpers/specialHelpers';

export default {
	props: {
		imgDialogOpen: Boolean,
		imgId: String,
		pictures: {
			type: Array,
			default: () => []
		},
		hideTitle: Boolean,
		showProgressBar: Boolean
		/*sliderSettings: {
			type: Object,
			default: () => ({
				slidesToShow: 1,
				slidesToScroll: 1,
				edgeFriction: 0.35,
				infinite: true,
				arrows: false,
				swipe: false,
				touchMove: false,
				draggable: false,
				fade: false,
				speed: 200,
				// draggable: false,
				focusOnSelect: false,
				responsive: [
					{
						breakpoint: 991,
						settings: {	
							swipe: true,
							touchMove: true,
						}
					},
				]


				// fade: true,
				// asNavFor: '.plant-images-slider-nav',
				// waitForAnimate: false,
			}),
		},*/
	},

	data: () => ({
		// imgDialogOpen: false,
		title: '',
		currentImageIdx: 0,
		previewImgShow: true,
		isMobile: false,

		currentZoom: 1,
		draggingActive: false
	}),

	computed: {
		slidesQuantity() {
			if (this.pictures) {
				return this.pictures.length;
			}
			return 0;
		}
	},

	methods: {
		changeZoom(zoom) {
			const imgElement = document.querySelector(
				'.imgDialogContainer .img-wrapper > img'
			);
			if (imgElement) {
				if (zoom) {
					this.currentZoom = this.currentZoom + zoom;
					// console.log(zoom, this.currentZoom)
				} else {
					this.currentZoom = 1;
				}
				imgElement.style.transform = `scale(${this.currentZoom})`;
			}
		},

		setPreviewImg(id) {
			this.currentZoom = 1;
			if (this.showProgressBar && this.imgId == id) return;
			id = isNaN(+id) ? id : +id;
			const picture = findItemBy('id', id, this.pictures);
			// console.log(picture, this.pictures, id)
			if (picture) {
				this.previewImgShow = false;
				this.title = getImgTypeName(picture);

				setTimeout(() => {
					this.currentImageIdx = this.pictures.indexOf(picture);
					this.$emit('update:imgId', `${id}`);
				}, 200);

				setTimeout(() => {
					this.previewImgShow = true;
				}, 400);
			}
		},

		changePreviewSlide(dir) {
			const { slidesQuantity, currentImageIdx, pictures } = this;
			const lastIdx = slidesQuantity - 1;
			let newIdx = currentImageIdx + dir;

			newIdx > lastIdx ? (newIdx = 0) : null;
			newIdx < 0 ? (newIdx = lastIdx) : null;

			this.setPreviewImg(pictures[newIdx].id);
		},

		closeModal() {
			this.$emit('closeModal');
			setTimeout(() => {
				this.currentImageIdx = 0;
			}, 300);
		},

		setupDraggableImage() {
			// this.currentZoom = 1;
			// this.draggingActive = false;
			let pos1 = 0,
				pos2 = 0,
				pos3 = 0,
				pos4 = 0;
			const imgElement = document.querySelector(
				'.imgDialogContainer .img-wrapper > img'
			);

			function dragMouseDown(e) {
				e = e || window.event;
				e.preventDefault();
				// get the mouse cursor position at startup:
				pos3 = e.clientX;
				pos4 = e.clientY;
				document.onmouseup = closeDragElement;
				// call a function whenever the cursor moves:
				document.onmousemove = elementDrag;
			}

			function elementDrag(e) {
				e = e || window.event;

				e.preventDefault();
				// calculate the new cursor position:
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;
				// set the element's new position:
				imgElement.style.top = imgElement.offsetTop - pos2 + 'px';
				imgElement.style.left = imgElement.offsetLeft - pos1 + 'px';
				// console.log(e.clientX, e.clientY, imgElement.style)
			}

			function closeDragElement() {
				/* stop moving when mouse button is released:*/
				document.onmouseup = null;
				document.onmousemove = null;
			}

			if (imgElement) {
				// console.log(imgElement)
				imgElement.onmousedown = dragMouseDown;
			}
		}
	},

	watch: {
		imgDialogOpen(isOpen) {
			if (isOpen) {
				this.setPreviewImg(this.imgId);
			}
		},

		currentZoom(zoom) {
			// console.log(this.draggingActive)
			if (zoom > 1) {
				if (!this.draggingActive) {
					this.setupDraggableImage();
					this.draggingActive = true;
				}
			} else {
				this.draggingActive = false;
				const imgElement = document.querySelector(
					'.imgDialogContainer .img-wrapper > img'
				);
				imgElement.style.top = 'initial';
				imgElement.style.left = 'initial';
			}
		}
	},

	beforeMount() {
		this.isMobile = document.documentElement.clientWidth < 992;
	}
};
</script>
