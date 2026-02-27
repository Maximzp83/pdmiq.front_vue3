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
								item.className || buttonType || ' el-button--primary inverted'
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
defineProps({
	itemsList: {
		type: Array,
		required: true,
	},
	inline: Boolean,
	card: Boolean,
	bold: Boolean,
	buttonType: {
		type: String,
		default: '',
	},
	small: Boolean,
});
</script>
