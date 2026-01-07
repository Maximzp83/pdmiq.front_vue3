<template>
	<div class="edit-form-container relative">
		<el-form
			class="item-edit-form relative section-row"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Select')} ${tt('file')}`" prop="file">
				<el-upload
					ref="uploadContainer"
					:on-change="e => onSelectFile(e, 'file')"
					:on-remove="() => onRemoveFile('file')"
					action="#"
					class="1upload-container"
					:auto-upload="false"
				>
					<!-- accept=".xml" -->
					<el-button size="small" type="primary">{{
						tt('phrases.click_to_upload')
					}}</el-button>
				</el-upload>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
// import { mapActions } from 'vuex';

// import { findItemBy } from '@/helpers';
import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],
	components: {
		ElUpload: () =>
			import(/* webpackChunkName: "ElUpload" */ 'element-ui/lib/upload')
		// EmailsFormItem: () => import('./EmailsFormItem.vue')
	},

	props: {},

	data() {
		return {
			formData: {
				file: null
			}
		};
	},

	computed: {
		// collectedDataWithoutInjectToForm: () => true
		rules: () => ({
			file: required
		})
	},

	methods: {
		onSelectFile({ raw }, propName) {
			this.formData[propName] = raw;
		},
		onRemoveFile(prop) {
			this.formData[prop] = null;
		}
	},

	created() {
		/*this.fetch_notification_templates({ params: { max: -1 } }).then(() => {
			this.notificationTemplatesReady = true;
		});*/
	},

	beforeDestroy() {
		// this.cleanListsAsArray(['set_notification_templates']);
	}
};
</script>
