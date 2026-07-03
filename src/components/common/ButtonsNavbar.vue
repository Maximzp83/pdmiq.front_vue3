<template>
	<div :class="['buttons-navbar-container', { small }]">
		<div :class="[{ card }]">
			<div :class="[{ 'card-content': card }]">
				<div :class="[{ 'mrow flex wrap': inline }]">
					<div v-for="item in itemsList" :key="`route-${item.id || item.label}`">
						<router-link
							:to="item.path"
							:class="[
								'el-button ',
								{ 'semi-bold': bold },
								{ active: isActive(item) },
								item.className || buttonClass || ' el-button--primary inverted'
							]"
						>
							{{ item.label }}
						</router-link>
					</div>

					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useRoute } from 'vue-router';

defineProps({
	itemsList: {
		type: Array,
		required: true,
	},
	inline: Boolean,
	card: Boolean,
	bold: Boolean,
	buttonClass: {
		type: String,
		default: '',
	},
	small: Boolean,
});

const route = useRoute();

const normalizePath = (path = '') => path.replace(/\/+$/, '');
const isActive = (item) => {
	const itemPath = normalizePath(item.path);
	const currentPath = normalizePath(route.path);
	return Boolean(itemPath && (currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)));
};
</script>
