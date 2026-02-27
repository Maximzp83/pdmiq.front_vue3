<template>
	<div :class="['nav-tabs-container flex wrap align-center', { small }, className]">
		<div class="main-group flex wrap">
			<el-button
				v-for="link in linksList"
				:key="`nav_button_link-${link.id}`"
				native-type="button"
				round
				:class="{ active: isActive({ link, currentPath }) }"
				@click="emit('changeRoute', { path: link.path })"
			>
				{{ link.title }}
			</el-button>
		</div>

		<div v-if="additionalBlock" class="additional-group">
			<slot></slot>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	searchbarOptions: {
		type: Object,
		default: () => ({
			prepend: true,
		}),
	},
	currentPath: {
		type: String,
		default: '',
	},
	additionalBlock: Boolean,
	className: {
		type: String,
		default: '',
	},
	linksList: {
		type: Array,
		default: () => [],
	},
	small: Boolean,
	isActive: {
		type: Function,
		default: ({ link, currentPath }) => currentPath === link.path,
	},
});

const emit = defineEmits(['changeRoute']);

void props;
</script>
