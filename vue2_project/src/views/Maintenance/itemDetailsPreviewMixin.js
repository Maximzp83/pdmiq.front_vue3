import { getFileName } from '@/helpers';

const itemDetailsPreviewMixin = {
	computed: {
		equipmentLabelOptions: () =>
			Object.freeze({
				accessors: [
					'brand_name',
					'machine_name',
					'production_line_name',
					'location_name'
				],
				delimeter: ','
			})
	},

	methods: {
		setupAttachments(list) {
			let html = '';

			if (list) {
				list.forEach(ai => {
					html += `<a class="display-inline-block info-color"
						href="${ai.file_path}"
					>${getFileName(ai.file_path)}</a>`;
				});
			}
			return html || '-';
		},

		setupImages(list) {
			let html = '';
			if (list && list.length) {
				html += '<div class="flex mrow wrap">';
				list.forEach(img => {
					html += `<div class="mcol-xs-6">
										<div class="relative imgWrapper" data-img-id="${img.id}">
											<div
												class="images-part-overlay dark-overlay pointer"
												:style="image_styles"
											>
												<div class="caption">
													<i class="icomoon icon-zoom-in"></i>
												</div>
											</div>
											<img src="${img.file_path}"	alt="img error"/>
										</div>
									</div>`;
				});
				html += '</div>';
			}
			return html || '-';
		},

		previewImage({ native_event, row }) {
			const container = native_event.target.closest('.imgWrapper');
			if (container) {
				const { imgId } = container.dataset;

				const payload = {
					eventName: 'togglePreviewModal',
					data: {
						pictureId: +imgId,
						picturesList: row.images
					},
					onward: true
				};
				this.$emit('event', payload);
			}
		},

		initialRequestsListResponsesReadyCallback() {
			if (this.settings && this.settings.printHTML) {
				this.set_global_state({ stateProp: 'mainPreloader', value: false });
				// console.log(this.mainPreloader)
				setTimeout(() => {
					this.$emit('event', {
						eventName: 'printHTML',
						data: { querySelector: '.custom-dialog-wrapper.active' },
						onward: true
					});

					this.show_edit_modal({
						editModalProp: 'editModalClassic',
						hideModal: true
					});
				}, 50);
			}
		}
	}
};

export default () => itemDetailsPreviewMixin;
