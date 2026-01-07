<template functional>
	<div
		:class="[
			`nav-tabs-container flex wrap align-center`,
			{ small: props.small },
			props.className
		]"
	>
		<div class="main-group flex wrap ">
			<el-button
				v-for="link in props.linksList"
				:key="`nav_button_link-${link.id}`"
				@click="listeners.changeRoute({ path: link.path })"
				native-type="button"
				round
				v-text="link.title"
				:class="{
					active: props.isActive({ link: link, currentPath: props.currentPath })
				}"
			/>
		</div>

		<div class="additional-group" v-if="props.additionalBlock">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	functional: true,
	props: {
		searchbarOptions: {
			type: Object,
			default: () => ({
				prepend: true
				// suffix: 'icomoon icon-search'
			})
		},
		currentPath: {
			type: String
		},
		additionalBlock: {
			type: Boolean
		},

		className: {
			type: String,
			default: ''
		},

		linksList: {
			type: Array,
			default: () => []
		},

		small: Boolean,
		isActive: {
			type: Function,
			default: ({ link, currentPath }) => {
				return currentPath == link.path;
			}
		}
	}
};
</script>
