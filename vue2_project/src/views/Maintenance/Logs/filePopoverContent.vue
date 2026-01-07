<template>
	<div class="">
		<ul class="tooltip-files-list">
			<li v-for="(file, idx) in filesList" :key="`file-${file.id}-${idx}`">
				<a class="link linkToFile underline" :href="file.file_path" target="_blank">
					<!-- <i class="el-icon-document"></i> -->
					{{ file.file_name }}
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
import { getFileName } from '@/helpers';

// import { required } from '@/constants/validation';
// import { dynamicItemFormMixin } from '@/mixins';

export default {
	// mixins: [dynamicItemFormMixin],
	props: {
		propsData: { type: Object, required: true },
		additionalProps: { type: Object, required: true }
	},

	data() {
		return {};
	},

	computed: {
		filesList() {
			const { images, attachments } = this.propsData;
			const { name } = this.additionalProps;

			// console.log(images, attachments, name)

			if (name == 'openFile') {
				return attachments.map(ai => {
					return {
						id: ai.id,
						file_name: getFileName(ai.file_path),
						file_path: ai.file_path
					};
				});
			} else if (name == 'togglePreviewModal') {
				return images;
			}
			return [];
		}
	}
};
</script>
