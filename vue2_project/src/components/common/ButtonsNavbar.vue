<template>
	<div :class="['buttons-navbar-container', { small: small }]">
		<div :class="[{ card: card }]">
			<div :class="[{ 'card-content': card }]">
				<div :class="[{ 'mrow flex wrap': inline }]">
					<div
						:class="['']"
						v-for="item in itemsList"
						:key="`route-${item.id || item.label}`"
					>
						<router-link
							:to="item.path"
							:class="[
								'el-button ',
								{ 'semi-bold': bold },
								item.className || buttonType || ' el-button--primary inverted'
							]"
						>
							{{ item.label }}
							<!-- <i class="suffix-icon icomoon icon-compare"></i> -->
						</router-link>
					</div>

					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		itemsList: {
			type: Array,
			required: true
		},
		inline: Boolean,
		card: Boolean,
		bold: Boolean,
		buttonType: String,
		small: Boolean
		// value: Number
	},

	/*data() {
		return {
			selected_id: null
		};
	},*/

	methods: {}

	/*watch: {
		selected_id(id) {

		}
	}*/
};
</script>
