<template>
	<div class="commands-history-item">
		<div class="content-row muted" v-text="created_at"></div>
		<div class="content-row semi-bold" v-text="itemData.message_body"></div>
		<div
			class="content-row semi-bold"
			v-text="itemData.message_response || '-'"
		></div>
	</div>
</template>

<script>
// import { dynamicItemFormMixin } from '@/mixins';
import { cleanDateString } from '@/helpers';
export default {
	// mixins: [dynamicItemFormMixin()],
	components: {
		// ImgUploadBlock: () => import('@/components/form/ImgUploadBlock.vue')
	},

	props: {
		itemData: { type: Object, required: true }
	},

	data() {
		return {};
	},

	computed: {
		// created_at: that => getYmdDateString({dateObj: that.itemData.created_at, withTime:1 })
		created_at: that => cleanDateString(that.itemData.created_at)
	}
};
</script>
